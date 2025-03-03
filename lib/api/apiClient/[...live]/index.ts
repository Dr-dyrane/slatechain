// lib/api/apiClient/[...live]/index.ts

import { tokenManager } from "@/lib/helpers/tokenManager";
import axios, {
	type AxiosError,
	AxiosInstance,
	AxiosRequestConfig,
} from "axios";
import { toast } from "sonner";

const BASE_URL = "/api"; // Calls will be directed to /app/api

// Custom error for logout handling
class LogoutError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "LogoutError";
	}
}

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
	_retry?: boolean;
}

// Custom error class for API errors
export class ApiError extends Error {
	constructor(
		message: string,
		public status?: number,
		public code?: string
	) {
		super(message);
		this.name = "ApiError";
	}
}

// Error messages mapping
const ERROR_MESSAGES: Record<string, string> = {
	INVALID_CREDENTIALS: "Invalid email or password",
	USER_NOT_FOUND: "User not found",
	EMAIL_EXISTS: "Email already exists",
	INVALID_TOKEN: "Your session has expired, please log in again",
	SERVER_ERROR: "Something went wrong, please try again later",
	RATE_LIMIT: "Too many attempts, please try again later",
	INVALID_INPUT: "Please fill in all required fields",
	INVALID_EMAIL: "Please enter a valid email address",
	WEAK_PASSWORD: "Password is too weak",
	PASSWORDS_DONT_MATCH: "Passwords do not match",
	NO_TOKEN: "Authentication required",
	INVALID_PASSWORD: "Current password is incorrect",
	INVALID_CODE: "Invalid or expired reset code",
	INVALID_UPDATE: "No valid fields to update",
	SUCCESS: "Operation completed successfully",
	EMAIL_SEND_ERROR: "Failed to send reset email. Please try again later.",
	NOT_FOUND: "Requested resource not found",
	INVALID_STATUS: "Invalid status provided",
	ONBOARDING_COMPLETE: "Onboarding already completed",
	INVALID_TYPE: "Invalid notification type",
	NO_RECIPIENTS: "No users match the notification criteria",
	NOTIFICATION_NOT_FOUND: "Notification not found",
	FORBIDDEN_NOTIFICATION:
		"You don't have permission to access this notification",
};

class ApiClient {
	private axiosInstance: AxiosInstance;
	private isLive: boolean;

	constructor() {
		this.isLive = true;

		this.axiosInstance = axios.create({
			baseURL: BASE_URL,
			headers: {
				"Content-Type": "application/json",
			},
			withCredentials: true, // Ensure cookies are sent if authentication is required
		});

		this.setupInterceptors();
	}

	private getErrorMessage(error: AxiosError): string {
		const response = error.response?.data as
			| { code?: string; message?: string }
			| undefined;
		const errorCode = response?.code || "SERVER_ERROR";
		return (
			ERROR_MESSAGES[errorCode] ||
			response?.message ||
			"An unexpected error occurred"
		);
	}

	private isRefreshing = false;
	private refreshSubscribers: ((token: string) => void)[] = [];

	private setupInterceptors() {
		this.axiosInstance.interceptors.request.use(
			(config) => {
				const token = tokenManager.getAccessToken();
				if (token) {
					config.headers["Authorization"] = `Bearer ${token}`;
				}
				return config;
			},
			(error) => Promise.reject(error)
		);

		this.axiosInstance.interceptors.response.use(
			(response) => response,
			async (error) => {
				const originalRequest = error.config as CustomAxiosRequestConfig;

				// Check if error is 401 (Unauthorized) before attempting refresh
				if (error.response?.status === 401) {
					// If retry already attempted, clear tokens and log out user
					if (originalRequest._retry) {
						tokenManager.clearTokens();
						return Promise.reject(
							new LogoutError("Session expired, please log in again.")
						);
					}

					originalRequest._retry = true;

					// Prevent multiple refresh calls at the same time
					if (this.isRefreshing) {
						return new Promise((resolve) => {
							this.refreshSubscribers.push((token) => {
								(originalRequest.headers ??= {})["Authorization"] =
									`Bearer ${token}`;
								resolve(this.axiosInstance(originalRequest));
							});
						});
					}

					this.isRefreshing = true;

					try {
						const refreshToken = tokenManager.getRefreshToken();

						if (!refreshToken) {
							throw new LogoutError(
								"No refresh token available. Please log in again."
							);
						}

						// Attempt to refresh the token
						const { data } = await this.axiosInstance.post("/auth/refresh", {
							refreshToken,
						});

						tokenManager.setTokens(data.accessToken, data.refreshToken);
						this.isRefreshing = false;

						// Resolve all queued requests with the new token
						this.refreshSubscribers.forEach((callback) =>
							callback(data.accessToken)
						);
						this.refreshSubscribers = [];

						// Retry the original request with the new token
						(originalRequest.headers ??= {})["Authorization"] =
							`Bearer ${data.accessToken}`;

						return this.axiosInstance(originalRequest);
					} catch (refreshError) {
						this.isRefreshing = false;
						this.refreshSubscribers.forEach((callback) => callback(""));
						this.refreshSubscribers = [];
						tokenManager.clearTokens();
						return Promise.reject(
							new LogoutError("Session expired, please log in again...")
						);
					}
				}

				// Handle Rate Limiting (429)
				if (error.response?.status === 429) {
					toast.error("Too many attempts. Please try again later.");
					return Promise.reject(
						new ApiError("Rate limit exceeded", 429, "RATE_LIMIT")
					);
				}

				// Apply getErrorMessage before returning any other errors
				const errorMessage = this.getErrorMessage(error);
				return Promise.reject(
					new ApiError(errorMessage, error.response?.status)
				);
			}
		);
	}

	setLiveMode(value: boolean) {
		this.isLive = value;
	}

	async request<T>(
		method: string,
		url: string,
		data?: any,
		config?: AxiosRequestConfig
	): Promise<T> {
		try {
			const response = await this.axiosInstance.request<T>({
				method,
				url,
				data,
				...config,
			});
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new ApiError(this.getErrorMessage(error), error.response?.status);
			}
			throw error;
		}
	}

	async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
		return this.request<T>("GET", url, undefined, config);
	}

	async post<T>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig
	): Promise<T> {
		return this.request<T>("POST", url, data, config);
	}

	async put<T>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig
	): Promise<T> {
		return this.request<T>("PUT", url, data, config);
	}

	async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
		return this.request<T>("DELETE", url, undefined, config);
	}
}

export const apiClient = new ApiClient();
export { LogoutError };
