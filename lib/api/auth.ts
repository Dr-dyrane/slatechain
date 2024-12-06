import { tokenManager } from "../helpers/tokenManager";
import { apiClient } from "./apiClient";
import { User, AuthResponse, LoginRequest, RegisterRequest } from "@/lib/types";

export const loginUser = async (
	credentials: LoginRequest
): Promise<AuthResponse> => {
	const response = await apiClient.post<AuthResponse>(
		"/auth/login",
		credentials
	);
	tokenManager.setTokens(response.accessToken, response.refreshToken);
	return response;
};

export const registerUser = async (
	userData: RegisterRequest
): Promise<AuthResponse> => {
	const response = await apiClient.post<AuthResponse>(
		"/auth/register",
		userData
	);
	tokenManager.setTokens(response.accessToken, response.refreshToken);
	return response;
};

export const logoutUser = async (): Promise<void> => {
	const refreshToken = localStorage.getItem("refreshToken");
	if (refreshToken) {
		await apiClient.post("/auth/logout", { refreshToken });
	}
	tokenManager.clearTokens();
};

export const updateUserProfile = async (
	profileData: Partial<User>
): Promise<User> => {
	return apiClient.put<User>("/users/me/profile", profileData);
};