import apiClient from "./apiClient";
import { OnboardingProgress } from "@/lib/types/user";

export const fetchProgress = async (userId: string): Promise<OnboardingProgress> => {
  const response = await apiClient<OnboardingProgress>("/onboarding/progress", "GET");
  return response;
};

export const saveStepProgress = async (userId: string, stepId: number): Promise<{ message: string }> => {
  const response = await apiClient<{ message: string }>("/onboarding/save", "POST", { userId, stepId });
  return response;
};

export const completeOnboardingApi = async (userId: string): Promise<{ message: string }> => {
  const response = await apiClient<{ message: string }>("/onboarding/complete", "POST", { userId });
  return response;
};

