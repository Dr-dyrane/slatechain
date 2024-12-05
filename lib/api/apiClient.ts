import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { mockApiResponses } from './mockData';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.slatechain.com/v1';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            const response = await this.axiosInstance.post('/auth/refresh', { refreshToken });
            const { accessToken } = response.data;
            localStorage.setItem('accessToken', accessToken);
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // Handle refresh token failure (e.g., logout user)
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async request<T>(method: string, url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    if (process.env.NODE_ENV === 'development') {
      return this.mockRequest<T>(method, url, data);
    }

    const response = await this.axiosInstance.request<T>({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  }

  private mockRequest<T>(method: string, url: string, data?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockResponse = mockApiResponses[method.toLowerCase()]?.[url];
        if (mockResponse) {
          if (typeof mockResponse === 'function') {
            resolve(mockResponse(data) as T);
          } else {
            resolve(mockResponse as T);
          }
        } else {
          reject(new Error(`No mock data for ${method} ${url}`));
        }
      }, 500); // Simulate network delay
    });
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('GET', url, undefined, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('POST', url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('PUT', url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('DELETE', url, undefined, config);
  }
}

export const apiClient = new ApiClient();

