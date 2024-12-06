import { apiClient } from "./apiClient";
import { User, AuthResponse, LoginRequest, RegisterRequest } from "@/lib/types";

let refreshPromise: Promise<AuthResponse> | null = null;

export const loginUser = async (
	credentials: LoginRequest
): Promise<AuthResponse> => {
	const response = await apiClient.post<AuthResponse>(
		"/auth/login",
		credentials
	);
	setAuthTokens(response.accessToken, response.refreshToken);
	return response;
};

export const registerUser = async (
	userData: RegisterRequest
): Promise<AuthResponse> => {
	const response = await apiClient.post<AuthResponse>(
		"/auth/register",
		userData
	);
	setAuthTokens(response.accessToken, response.refreshToken);
	return response;
};

export const logoutUser = async (): Promise<void> => {
	const refreshToken = localStorage.getItem("refreshToken");
	if (refreshToken) {
		await apiClient.post("/auth/logout", { refreshToken });
	}
	clearAuthTokens();
};

export const refreshAccessToken = async (): Promise<AuthResponse> => {
	if (refreshPromise) {
		return refreshPromise;
	}

	const refreshToken = localStorage.getItem("refreshToken");
	if (!refreshToken) {
		throw new Error("No refresh token available");
	}

	refreshPromise = apiClient.post<AuthResponse>("/auth/refresh", {
		refreshToken,
	});

	try {
		const response = await refreshPromise;
		setAuthTokens(response.accessToken, response.refreshToken);
		return response;
	} finally {
		refreshPromise = null;
	}
};

export const updateUserProfile = async (
	profileData: Partial<User>
): Promise<User> => {
	return apiClient.put<User>("/users/me/profile", profileData);
};

const setAuthTokens = (accessToken: string, refreshToken: string) => {
	localStorage.setItem("accessToken", accessToken);
	localStorage.setItem("refreshToken", refreshToken);
};

const clearAuthTokens = () => {
	localStorage.removeItem("accessToken");
	localStorage.removeItem("refreshToken");
};