import { apiClient } from './apiClient';
import { User, AuthResponse } from '@/lib/types/user';

export const loginUser = async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
  return apiClient.post<AuthResponse>('/auth/login', credentials);
};

export const registerUser = async (userData: Omit<User, "id" | "isEmailVerified" | "isPhoneVerified" | "kycStatus" | "onboardingStatus">): Promise<User> => {
  return apiClient.post<User>('/auth/register', userData);
};

export const logoutUser = async (refreshToken: string): Promise<void> => {
  return apiClient.post('/auth/logout', { refreshToken });
};

export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> => {
  return apiClient.post<{ accessToken: string; expiresIn: number }>('/auth/refresh', { refreshToken });
};

