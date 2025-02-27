import type {
	OnboardingProgress,
	OnboardingStep,
	OnboardingResponse,
	StepUpdateResponse,
	StepSkipResponse,
	CompletionResponse,
} from "@/lib/types/onboarding";
import type { OnboardingStepStatus } from "@/lib/types";
import { apiClient } from "./apiClient/[...live]";


/**
 * Fetch current onboarding progress
 */
export const fetchOnboardingProgress =
	async (): Promise<OnboardingProgress> => {
		const response = await apiClient.get<OnboardingResponse>(
			"/onboarding/progress"
		);
		if (!response.data) {
			throw new Error("Failed to fetch onboarding progress");
		}
		return response.data;
	};

/**
 * Start or restart onboarding process
 */
export const startOnboarding = async (): Promise<OnboardingProgress> => {
	const response =
		await apiClient.post<OnboardingResponse>("/onboarding/start");
	if (!response.data) {
		throw new Error("Failed to start onboarding");
	}
	return response.data;
};

/**
 * Update onboarding step status and data
 */
export const updateOnboardingStep = async (
	stepId: number,
	status: OnboardingStepStatus,
  data?: Record<string, string | number | boolean | string[] | undefined>,
): Promise<OnboardingStep> => {
	const response = await apiClient.put<StepUpdateResponse>(
		`/onboarding/step/${stepId}`,
		{
			status,
			data,
		}
	);
	if (!response.data) {
		throw new Error("Failed to update onboarding step");
	}
	return response.data;
};

/**
 * Skip an onboarding step
 */
export const skipOnboardingStep = async (
	stepId: number,
	reason: string
): Promise<OnboardingStep> => {
	const response = await apiClient.post<StepSkipResponse>(
		`/onboarding/skip/${stepId}`,
		{ reason }
	);
	if (!response.data) {
		throw new Error("Failed to skip onboarding step");
	}
	return response.data;
};

/**
 * Complete the onboarding process
 */
export const completeOnboarding = async (): Promise<{
	success: boolean;
	completedAt: string;
}> => {
	const response = await apiClient.post<CompletionResponse>(
		"/onboarding/complete"
	);
	if (!response.data) {
		throw new Error("Failed to complete onboarding");
	}
	return response.data;
};
