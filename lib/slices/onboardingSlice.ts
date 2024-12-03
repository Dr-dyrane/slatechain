import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OnboardingState {
	currentStep: number;
	totalSteps: number;
	completedSteps: number[];
	roleSpecificData: {
		[key: string]: string | number | boolean;
	};
	completed: boolean;
	cancelled: boolean;
}

const initialState: OnboardingState = {
	currentStep: 0,
	totalSteps: 5,
	completedSteps: [],
	roleSpecificData: {},
	completed: false,
	cancelled: false,
};

const onboardingSlice = createSlice({
	name: "onboarding",
	initialState,
	reducers: {
		setCurrentStep: (state, action: PayloadAction<number>) => {
			state.currentStep = action.payload;
		},
		completeStep: (state, action: PayloadAction<number>) => {
			if (!state.completedSteps.includes(action.payload)) {
				state.completedSteps.push(action.payload);
			}
		},
		setRoleSpecificData: (
			state,
			action: PayloadAction<{ [key: string]: string | number | boolean }>
		) => {
			state.roleSpecificData = { ...state.roleSpecificData, ...action.payload };
		},
		completeOnboarding: (state) => {
			state.completed = true;
		},
		resetOnboarding: () => initialState,
		cancelOnboarding: (state) => {
			state.cancelled = true;
		},
		resumeOnboarding: (state) => {
			state.cancelled = false;
		},
	},
});

export const {
	setCurrentStep,
	completeStep,
	setRoleSpecificData,
	completeOnboarding,
	resetOnboarding,
	cancelOnboarding,
	resumeOnboarding,
} = onboardingSlice.actions;
export default onboardingSlice.reducer;
