import apiClient from "./apiClient";
import { User, AuthResponse } from "@/lib/types/user";

export const loginUser = async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
  const response = await apiClient<AuthResponse>("/auth/login", "POST", credentials);
  return response;
};

export const registerUser = async (userData: Omit<User, "id" | "isEmailVerified" | "isPhoneVerified" | "kycStatus" | "onboardingStatus">): Promise<User> => {
  const response = await apiClient<User>("/auth/register", "POST", userData);
  return response;
};

export const resetPassword = async (identifier: string): Promise<{ message: string }> => {
  const response = await apiClient<{ message: string }>("/auth/reset", "POST", { identifier });
  return response;
};

