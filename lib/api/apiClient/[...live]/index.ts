import { tokenManager } from "@/lib/helpers/tokenManager";
import axios, {
	type AxiosError,
	type AxiosInstance,
	type AxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import { mockApiResponses } from "../../mockData";

const BASE_URL = "/api"; // Calls will be directed to /app/api

// Custom error for logout handling
export class LogoutError extends Error {
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
	WALLET_NOT_REGISTERED: "Wallet not registered. Please register first.",
	WALLET_EXISTS: "This wallet address is already registered",
	INVALID_SIGNATURE: "Invalid signature",
	ORDER_NOT_DELETABLE: "Only planned orders can be deleted",
};

class ApiClient {
	private axiosInstance: AxiosInstance;
	private isLive: boolean;
	private storageListener: ((this: Window, ev: StorageEvent) => any) | null =
		null;

	constructor() {
		// Initialize isLive from localStorage if available (client-side)
		this.isLive = this.getIsLiveFromStorage();

		this.axiosInstance = axios.create({
			baseURL: BASE_URL,
			headers: {
				"Content-Type": "application/json",
			},
			withCredentials: true, // Ensure cookies are sent if authentication is required
		});

		this.setupInterceptors();
		this.setupStorageListener();
	}

	// Get isLive value from localStorage, defaulting to true if not available
	private getIsLiveFromStorage(): boolean {
		if (typeof window !== "undefined") {
			const storedValue = localStorage.getItem("isLive");
			return storedValue === null ? true : storedValue === "true";
		}
		return true; // Default to true on server-side
	}

	// Set up listener for localStorage changes
	private setupStorageListener(): void {
		if (typeof window !== "undefined") {
			// Remove any existing listener
			if (this.storageListener) {
				window.removeEventListener("storage", this.storageListener);
			}

			// Create and add new listener
			this.storageListener = (event: StorageEvent) => {
				if (event.key === "isLive") {
					this.isLive = event.newValue === "true";
					console.log(
						`API Client mode updated: ${this.isLive ? "Live" : "Mock"}`
					);
				}
			};

			window.addEventListener("storage", this.storageListener);
		}
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
				// Check localStorage again on each request to ensure we have the latest value
				if (typeof window !== "undefined") {
					this.isLive = this.getIsLiveFromStorage();
				}

				const token = tokenManager.getAccessToken();
				if (token) {
					config.headers["Authorization"] = `Bearer ${token}`;
				}

				// IMPORTANT: Check if we're sending FormData and remove Content-Type header
				// This allows the browser to set the correct multipart/form-data with boundary
				if (config.data instanceof FormData) {
					// Delete the Content-Type header to let the browser set it automatically
					delete config.headers["Content-Type"];
				}

				return config;
			},
			(error) => Promise.reject(error)
		);

		this.axiosInstance.interceptors.response.use(
			(response) => response,
			async (error) => {
				const originalRequest = error.config as CustomAxiosRequestConfig;

				// If not in live mode, use mock data instead of handling the error
				if (!this.isLive) {
					return this.mockRequest(
						originalRequest.method || "get",
						originalRequest.url || "",
						originalRequest.data
					).then((data) => {
						return { data };
					});
				}

				// Check if error is 401 (Unauthorized) before attempting refresh
				if (error.response?.status === 401) {
					// Check for specific error messages that indicate we should not retry
					const errorData = error.response?.data as
						| { error?: string }
						| undefined;
					const errorMessage = errorData?.error || "";

					// If the error indicates an invalid or expired token and we've already retried,
					// or if the error specifically mentions the refresh token is invalid/expired
					if (
						originalRequest._retry ||
						errorMessage.includes("Invalid refresh token") ||
						errorMessage.includes("Refresh token has expired") ||
						errorMessage.includes("Refresh token not found")
					) {
						// Clear tokens and throw logout error
						tokenManager.clearTokens();
						// Dispatch a custom event that the ErrorBoundary can listen for
						if (typeof window !== "undefined") {
							window.dispatchEvent(new CustomEvent("auth:sessionExpired"));
						}
						return Promise.reject(
							new LogoutError("Session expired, please log in again.")
						);
					}

					originalRequest._retry = true;

					// Prevent multiple refresh calls at the same time
					if (this.isRefreshing) {
						return new Promise((resolve, reject) => {
							this.refreshSubscribers.push((token) => {
								if (token) {
									(originalRequest.headers ??= {})["Authorization"] =
										`Bearer ${token}`;
									resolve(this.axiosInstance(originalRequest));
								} else {
									reject(
										new LogoutError("Session expired, please log in again.")
									);
								}
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
						const response = await this.axiosInstance.post("/auth/refresh", {
							refreshToken,
						});

						// Extract the new tokens from the response
						const { accessToken, refreshToken: newRefreshToken } =
							response.data;

						if (!accessToken || !newRefreshToken) {
							throw new Error("Invalid token response from server");
						}

						// Store the new tokens
						tokenManager.setTokens(accessToken, newRefreshToken);
						this.isRefreshing = false;

						// Resolve all queued requests with the new token
						this.refreshSubscribers.forEach((callback) =>
							callback(accessToken)
						);
						this.refreshSubscribers = [];

						// Retry the original request with the new token
						(originalRequest.headers ??= {})["Authorization"] =
							`Bearer ${accessToken}`;

						return this.axiosInstance(originalRequest);
					} catch (refreshError) {
						this.isRefreshing = false;
						this.refreshSubscribers.forEach((callback) => callback(""));
						this.refreshSubscribers = [];
						tokenManager.clearTokens();

						// Dispatch a custom event that the ErrorBoundary can listen for
						if (typeof window !== "undefined") {
							window.dispatchEvent(new CustomEvent("auth:sessionExpired"));
						}

						return Promise.reject(
							new LogoutError("Session expired, please log in again.")
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

	// This method is still available but will now update localStorage as well
	setLiveMode(value: boolean) {
		this.isLive = value;
		if (typeof window !== "undefined") {
			localStorage.setItem("isLive", value.toString());
		}
	}

	// Get current mode
	getLiveMode(): boolean {
		// Always check localStorage to ensure we have the latest value
		if (typeof window !== "undefined") {
			return this.getIsLiveFromStorage();
		}
		return this.isLive;
	}

	// Add mockRequest method to handle mock responses
	private mockRequest<T>(method: string, url: string, data?: any): Promise<T> {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				try {
					// Parse the URL to separate the path from query parameters
					const [basePath, queryString] = url.split("?");

					// Parse query parameters into an object
					const queryParams: Record<string, string> = {};
					if (queryString) {
						queryString.split("&").forEach((param) => {
							const [key, value] = param.split("=");
							if (key && value) {
								queryParams[key] = decodeURIComponent(value);
							}
						});
					}

					// Get the mock data for this method
					const mockMethod = mockApiResponses[method.toLowerCase()];
					if (!mockMethod) {
						return reject(new Error(`No mock data for ${method} method`));
					}

					// Check for exact URL match first
					if (mockMethod[url]) {
						const mockResponse = mockMethod[url];
						if (typeof mockResponse === "function") {
							resolve(mockResponse(data) as T);
						} else {
							resolve(mockResponse as T);
						}
						return;
					}

					// Check for base path match (without query parameters)
					if (mockMethod[basePath]) {
						const mockResponse = mockMethod[basePath];
						if (typeof mockResponse === "function") {
							// Pass query parameters to the function
							resolve(mockResponse(queryParams) as T);
						} else {
							resolve(mockResponse as T);
						}
						return;
					}

					// Check for path pattern matches (for routes with parameters like /users/:id)
					for (const pattern in mockMethod) {
						if (pattern.includes(":")) {
							const regexPattern = pattern.replace(/:[^/]+/g, "([^/]+)");
							const regex = new RegExp(`^${regexPattern}$`);
							const match = basePath.match(regex);

							if (match) {
								const mockResponse = mockMethod[pattern];

								// Extract path parameters
								const paramNames = pattern.match(/:[^/]+/g) || [];
								const params: Record<string, string> = { ...queryParams };

								paramNames.forEach((param, index) => {
									const paramName = param.substring(1); // Remove the leading ':'
									params[paramName] = match[index + 1];
								});

								if (typeof mockResponse === "function") {
									resolve(mockResponse(params) as T);
								} else {
									resolve(mockResponse as T);
								}
								return;
							}
						}
					}

					// If we get here, no mock data was found
					reject(new Error(`No mock data for ${method} ${url}`));
				} catch (error) {
					console.error("Error in mock request:", error);
					reject(
						new Error(
							`Mock request error: ${error instanceof Error ? error.message : String(error)}`
						)
					);
				}
			}, 500); // Simulate network delay
		});
	}

	async request<T>(
		method: string,
		url: string,
		data?: any,
		config?: AxiosRequestConfig
	): Promise<T> {
		// Check localStorage again to ensure we have the latest value
		if (typeof window !== "undefined") {
			this.isLive = this.getIsLiveFromStorage();
		}

		// If not in live mode, use mock data
		if (!this.isLive) {
			return this.mockRequest<T>(method, url, data);
		}

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
