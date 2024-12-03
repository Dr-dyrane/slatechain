export const fetchProgress = async (userId: string) => {
	// Simulate API call to fetch user progress
	await new Promise((resolve) => setTimeout(resolve, 500));
	return {
		currentStep: 1, // Example: User is on step 2
		completedSteps: [0, 1], // Steps 0 and 1 completed
	};
};

export const saveStepProgress = async (userId: string, stepId: number) => {
	await new Promise((resolve) => setTimeout(resolve, 500));
	return { success: true, message: "Step progress saved." };
};

export const completeOnboardingApi = async (userId: string) => {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	return { success: true, message: "Onboarding completed." };
};
