import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
	OnboardingState,
	OnboardingStep,
	OnboardingProgress,
} from "@/lib/types";
import {
	fetchOnboardingProgress,
	startOnboarding,
	updateOnboardingStep,
	skipOnboardingStep,
	completeOnboarding,
} from "@/lib/api/onboarding";
import { MAX_STEPS } from "../constants/onboarding-steps";

const initialState: OnboardingState = {
	currentStep: 0,
	totalSteps: 5,
	completedSteps: [],
	roleSpecificData: {},
	completed: false,
	cancelled: false,
	userId: null,
	loading: false,
	error: null,
};

export const fetchProgress = createAsyncThunk<OnboardingProgress>(
	"onboarding/fetchProgress",
	async (_, { rejectWithValue }) => {
		try {
			return await fetchOnboardingProgress();
		} catch (error) {
			return rejectWithValue((error as Error).message);
		}
	}
);

export const startOnboardingProcess = createAsyncThunk<OnboardingProgress>(
	"onboarding/start",
	async (_, { rejectWithValue }) => {
		try {
			return await startOnboarding();
		} catch (error) {
			return rejectWithValue((error as Error).message);
		}
	}
);

export const updateStep = createAsyncThunk<
	OnboardingStep,
	{ stepId: number; status: string; data?: Record<string, any> }
>(
	"onboarding/updateStep",
	async ({ stepId, status, data }, { rejectWithValue }) => {
		try {
			return await updateOnboardingStep(stepId, status, data);
		} catch (error) {
			return rejectWithValue((error as Error).message);
		}
	}
);

export const skipStep = createAsyncThunk<
	OnboardingStep,
	{ stepId: number; reason: string }
>("onboarding/skipStep", async ({ stepId, reason }, { rejectWithValue }) => {
	try {
		return await skipOnboardingStep(stepId, reason);
	} catch (error) {
		return rejectWithValue((error as Error).message);
	}
});

export const finishOnboarding = createAsyncThunk<{
	success: boolean;
	completedAt: string;
}>("onboarding/complete", async (_, { rejectWithValue }) => {
	try {
		return await completeOnboarding();
	} catch (error) {
		return rejectWithValue((error as Error).message);
	}
});

const onboardingSlice = createSlice({
	name: "onboarding",
	initialState,
	reducers: {
		setLoading: (state, action) => {
			state.loading = action.payload;
		},

		setCurrentStep: (state, action: PayloadAction<number>) => {
			state.currentStep = Math.min(action.payload, MAX_STEPS - 1);
		},
		completeStep: (state, action: PayloadAction<number>) => {
			if (
				action.payload < MAX_STEPS &&
				!state.completedSteps.includes(action.payload)
			) {
				state.completedSteps.push(action.payload);
			}
		},
		setRoleSpecificData: (
			state,
			action: PayloadAction<Record<string, any>>
		) => {
			state.roleSpecificData = { ...state.roleSpecificData, ...action.payload };
		},
		cancelOnboarding: (state) => {
			state.cancelled = true;
		},
		resumeOnboarding: (state) => {
			state.cancelled = false;
		},
		resetOnboarding: () => initialState,
		setUserId: (state, action: PayloadAction<string>) => {
			state.userId = action.payload;
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchProgress.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchProgress.fulfilled, (state, action) => {
				state.loading = false;
				state.currentStep = action.payload.currentStep;
				state.completedSteps = action.payload.completedSteps;
				state.completed = action.payload.completed;
			})
			.addCase(fetchProgress.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(startOnboardingProcess.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(startOnboardingProcess.fulfilled, (state, action) => {
				state.loading = false;
				state.currentStep = action.payload.currentStep;
				state.completedSteps = action.payload.completedSteps;
				state.completed = action.payload.completed;
			})
			.addCase(startOnboardingProcess.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(updateStep.pending, (state) => {
				state.error = null;
			})
			.addCase(updateStep.rejected, (state, action) => {
				state.error = action.payload as string;
			})
			.addCase(updateStep.fulfilled, (state, action) => {
				const stepIndex = state.completedSteps.findIndex(
					(step) => step === action.payload.id
				);
				if (stepIndex === -1 && action.payload.status === "COMPLETED") {
					state.completedSteps.push(action.payload.id);
				}
				if (action.payload.status === "IN_PROGRESS") {
					state.currentStep = action.payload.id;
				}
			})
			.addCase(skipStep.fulfilled, (state, action) => {
				const stepIndex = state.completedSteps.findIndex(
					(step) => step === action.payload.id
				);
				if (stepIndex === -1) {
					state.completedSteps.push(action.payload.id);
				}
			})
			.addCase(finishOnboarding.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(finishOnboarding.fulfilled, (state) => {
				state.loading = false;
				state.completed = true;
			})
			.addCase(finishOnboarding.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});
	},
});

export const {
	setLoading,
	setCurrentStep,
	completeStep,
	setRoleSpecificData,
	cancelOnboarding,
	resumeOnboarding,
	resetOnboarding,
	setUserId,
	setError,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
