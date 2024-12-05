import { apiClient } from "./apiClient";
import { User, AuthResponse, LoginRequest, RegisterRequest } from "@/lib/types";

export const loginUser = async (
	credentials: LoginRequest
): Promise<AuthResponse> => {
	return apiClient.post<AuthResponse>("/auth/login", credentials);
};

export const registerUser = async (
	userData: RegisterRequest
): Promise<AuthResponse> => {
	return apiClient.post<AuthResponse>("/auth/register", userData);
};

export const logoutUser = async (refreshToken: string): Promise<void> => {
	return apiClient.post("/auth/logout", { refreshToken });
};

export const refreshAccessToken = async (
	refreshToken: string
): Promise<AuthResponse> => {
	return apiClient.post<AuthResponse>("/auth/refresh", { refreshToken });
};

export const updateUserProfile = async (
	profileData: Partial<User>
): Promise<User> => {
	return apiClient.put<User>("/users/me/profile", profileData);
};
