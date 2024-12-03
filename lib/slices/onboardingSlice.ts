import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OnboardingState {
	currentStep: number;
	totalSteps: number;
	completedSteps: number[];
	roleSpecificData: {
		[key: string]: any;
	};
}

const initialState: OnboardingState = {
	currentStep: 0,
	totalSteps: 5,
	completedSteps: [],
	roleSpecificData: {},
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
			action: PayloadAction<{ [key: string]: any }>
		) => {
			state.roleSpecificData = { ...state.roleSpecificData, ...action.payload };
		},
		resetOnboarding: () => initialState,
	},
});

export const {
	setCurrentStep,
	completeStep,
	setRoleSpecificData,
	resetOnboarding,
} = onboardingSlice.actions;
export default onboardingSlice.reducer;
