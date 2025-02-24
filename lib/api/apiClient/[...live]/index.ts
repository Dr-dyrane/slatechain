// lib/api/apiClient/[...live]/index.ts

import { tokenManager } from "@/lib/helpers/tokenManager";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

const BASE_URL = "/api"; // Calls will be directed to /app/api

// Custom error for logout handling
class LogoutError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "LogoutError";
	}
}

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
				const originalRequest = error.config;

				// If the error is not 401 (Unauthorized), reject it immediately
				if (error.response?.status !== 401) {
					return Promise.reject(error);
				}

				// Prevent multiple refresh calls at the same time
				if (this.isRefreshing) {
					return new Promise((resolve) => {
						this.refreshSubscribers.push((token) => {
							originalRequest.headers["Authorization"] = `Bearer ${token}`;
							resolve(this.axiosInstance(originalRequest));
						});
					});
				}

				// If retry already attempted, clear tokens and log out user
				if (originalRequest._retry) {
					tokenManager.clearTokens();
					throw new LogoutError("Session expired, please log in again.");
				}

				originalRequest._retry = true;
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
					originalRequest.headers[
						"Authorization"
					] = `Bearer ${data.accessToken}`;
					return this.axiosInstance(originalRequest);
				} catch (refreshError) {
					this.isRefreshing = false;
					this.refreshSubscribers = [];
					tokenManager.clearTokens();
					throw new LogoutError("Session expired, please log in again.");
				}
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
		const response = await this.axiosInstance.request<T>({
			method,
			url,
			data,
			...config,
		});
		return response.data;
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
