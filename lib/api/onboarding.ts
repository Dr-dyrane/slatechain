import { apiClient } from "./apiClient";
import { OnboardingProgress } from "@/lib/types/user";

export const fetchOnboardingProgress =
	async (): Promise<OnboardingProgress> => {
		return apiClient.get<OnboardingProgress>("/onboarding/progress");
	};

export const startOnboarding = async (): Promise<OnboardingProgress> => {
	return apiClient.post<OnboardingProgress>("/onboarding/start");
};

export const submitOnboardingStep = async (
	stepId: number,
	stepData: any
): Promise<{ stepId: number; status: string }> => {
	return apiClient.post<{ stepId: number; status: string }>(
		"/onboarding/steps",
		{ stepId, stepData }
	);
};

export const completeOnboarding = async (): Promise<{
	success: boolean;
	completedAt: string;
}> => {
	return apiClient.post<{ success: boolean; completedAt: string }>(
		"/onboarding/complete"
	);
};
