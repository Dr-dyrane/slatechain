// src/lib/api/auth.ts
import { tokenManager } from "../helpers/tokenManager";

import {
	User,
	AuthResponse,
	LoginRequest,
	RegisterRequest,
	PasswordChangeFormData,
	TwoFactorVerifyRequest,
	TwoFactorSetupRequest,
} from "@/lib/types";
import { apiClient } from "./apiClient/[...live]";

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
	const refreshToken = tokenManager.getRefreshToken();
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

export const changeUserPassword = async (
	passwordData: PasswordChangeFormData
): Promise<void> => {
	await apiClient.post("/auth/password/change", passwordData);
};

export const sendPasswordResetEmail = async (
	email: string
): Promise<string> => {
	const response = await apiClient.post<{ code: string }>(
		"/auth/password/forgot",
		{ email }
	);
	return response.code;
};

export const resetPassword = async (
	code: string,
	newPassword: string
): Promise<void> => {
	await apiClient.post("/auth/password/reset", { code, newPassword });
};

export const getUserData = async (): Promise<AuthResponse> => {
	return apiClient.get<AuthResponse>("/auth/me");
};

// Login with phone number
export async function loginWithPhone(credentials: {
	phoneNumber: string;
	otp?: string;
}): Promise<{ token: string } | AuthResponse> {
	const response = await apiClient.post<{ token: string } | AuthResponse>(
		"/auth/phone-login",
		credentials
	);
	return response;
}

// Verify 2FA code
export async function verifyTwoFactor(
	verifyData: TwoFactorVerifyRequest
): Promise<AuthResponse> {
	const response = await apiClient.post<AuthResponse>(
		"/auth/verify-2fa",
		verifyData
	);
	return response;
}

// Setup 2FA
export async function setupTwoFactor(
	setupData: TwoFactorSetupRequest
): Promise<User> {
	const response = await apiClient.post<User>("/auth/setup-2fa", setupData);
	return response;
}
