// lib/api/onboarding.ts

import { OnboardingProgress, OnboardingStep } from "@/lib/types";
import { apiClient } from "./apiClient/[...live]";

export const fetchOnboardingProgress = async (): Promise<OnboardingProgress> => {
  return apiClient.get<OnboardingProgress>("/onboarding/progress");
};

export const startOnboarding = async (): Promise<OnboardingProgress> => {
  return apiClient.post<OnboardingProgress>("/onboarding/start");
};

export const updateOnboardingStep = async (
  stepId: number,
  status: string,
  data?: Record<string, any>
): Promise<OnboardingStep> => {
  return apiClient.put<OnboardingStep>(`/onboarding/step/${stepId}`, { status, data });
};

export const skipOnboardingStep = async (
  stepId: number,
  reason: string
): Promise<OnboardingStep> => {
  return apiClient.post<OnboardingStep>(`/onboarding/skip/${stepId}`, { reason });
};

export const completeOnboarding = async (): Promise<{
  success: boolean;
  completedAt: string;
}> => {
  return apiClient.post<{ success: boolean; completedAt: string }>("/onboarding/complete");
};

