import {
	fetchProgress,
	saveStepProgress,
	completeOnboardingApi,
} from "@/api/onboarding";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OnboardingState {
	userId: string | null;
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
	userId: null,
	currentStep: 0,
	totalSteps: 5,
	completedSteps: [],
	roleSpecificData: {},
	completed: false,
	cancelled: false,
};

export const fetchUserProgress = createAsyncThunk(
	"onboarding/fetchProgress",
	async (userId: string, { rejectWithValue }) => {
		try {
			const response = await fetchProgress(userId);
			return response; // { currentStep, completedSteps }
		} catch (error) {
			return rejectWithValue("Failed to fetch progress.");
		}
	}
);

export const saveProgress = createAsyncThunk(
	"onboarding/saveProgress",
	async (
		{ userId, stepId }: { userId: string; stepId: number },
		{ rejectWithValue }
	) => {
		try {
			const response = await saveStepProgress(userId, stepId);
			return response.message;
		} catch (error) {
			return rejectWithValue("Failed to save progress.");
		}
	}
);

export const complete = createAsyncThunk(
	"onboarding/complete",
	async (userId: string, { rejectWithValue }) => {
		try {
			const response = await completeOnboardingApi(userId);
			return response.message;
		} catch (error) {
			return rejectWithValue("Failed to complete onboarding.");
		}
	}
);
const onboardingSlice = createSlice({
	name: "onboarding",
	initialState,
	reducers: {
		setUserId: (state, action: PayloadAction<string | null>) => {
			state.userId = action.payload;
		},
		validateUserId: (state, action: PayloadAction<string>) => {
			if (state.userId && state.userId !== action.payload) {
				Object.assign(state, initialState);
			}
		},
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
			if (state.completedSteps.length === state.totalSteps) {
				state.completed = true;
			}
		},
		resetOnboarding: () => initialState,
		cancelOnboarding: (state) => {
			state.cancelled = true;
		},
		resumeOnboarding: (state) => {
			state.cancelled = false;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchUserProgress.fulfilled, (state, action) => {
				state.currentStep = action.payload.currentStep;
				state.completedSteps = action.payload.completedSteps;
			})
			.addCase(saveProgress.fulfilled, (state, action) => {
				console.log(action.payload); // Save success message
			})
			.addCase(complete.fulfilled, (state) => {
				state.completed = true;
			});
	},
});

export const {
	setUserId,
	validateUserId,
	setCurrentStep,
	completeStep,
	setRoleSpecificData,
	completeOnboarding,
	resetOnboarding,
	cancelOnboarding,
	resumeOnboarding,
} = onboardingSlice.actions;
export default onboardingSlice.reducer;
