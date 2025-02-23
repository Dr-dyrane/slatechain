// lib/api/apiClient/index.ts

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
				if (error.response?.status === 401 && !originalRequest._retry) {
					originalRequest._retry = true;
					try {
						const refreshToken = tokenManager.getRefreshToken();
						const { data } = await this.axiosInstance.post("/auth/refresh", {
							refreshToken,
						});
						tokenManager.setTokens(data.accessToken, data.refreshToken);

						originalRequest.headers[
							"Authorization"
						] = `Bearer ${data.accessToken}`;
						return this.axiosInstance(originalRequest);
					} catch (refreshError) {
						tokenManager.clearTokens();
						throw new LogoutError("Session expired, please login again");
					}
				}

				return Promise.reject(error);
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
