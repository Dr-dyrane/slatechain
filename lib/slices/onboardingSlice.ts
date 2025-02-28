import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from "@reduxjs/toolkit";
import {
	type OnboardingState,
	OnboardingStatus,
	OnboardingStepStatus,
} from "@/lib/types";
import {
	fetchOnboardingProgress,
	startOnboarding,
	updateOnboardingStep,
	skipOnboardingStep,
	completeOnboarding,
} from "@/lib/api/onboarding";
import { MAX_STEPS } from "../constants/onboarding-steps";
import { updateOnboardingStatus } from "./authSlice";

const initialState: OnboardingState = {
	currentStep: 0,
	totalSteps: MAX_STEPS,
	completedSteps: [],
	roleSpecificData: {},
	completed: false,
	cancelled: false,
	userId: null,
	loading: false,
	error: null,
	stepHistory: [],
	stepsData: {},
};

/**
 * Fetch onboarding progress
 */
export const fetchProgress = createAsyncThunk(
	"onboarding/fetchProgress",
	async (_, { rejectWithValue }) => {
		try {
			const response = await fetchOnboardingProgress();
			return response;
		} catch (error) {
			return rejectWithValue(
				error instanceof Error ? error.message : "Failed to fetch progress"
			);
		}
	}
);

/**
 * Start onboarding process
 */
export const startOnboardingProcess = createAsyncThunk(
	"onboarding/start",
	async (_, { rejectWithValue }) => {
		try {
			const response = await startOnboarding();
			return response;
		} catch (error) {
			return rejectWithValue(
				error instanceof Error ? error.message : "Failed to start onboarding"
			);
		}
	}
);

/**
 * Update step status and data
 */
export const updateStep = createAsyncThunk(
	"onboarding/updateStep",
	async (
		{
			stepId,
			status,
			data,
		}: {
			stepId: number;
			status: OnboardingStepStatus;
			data?: Record<string, string | number | boolean | string[] | undefined>;
		},
		{ getState, rejectWithValue }
	) => {
		try {
			// Validate step transition
			const state = getState() as { onboarding: OnboardingState };
			const { currentStep, completedSteps } = state.onboarding;

			// Can't update steps beyond current unless they're already completed
			if (stepId > currentStep && !completedSteps.includes(stepId)) {
				return rejectWithValue("Cannot update future steps");
			}

			const response = await updateOnboardingStep(stepId, status, data);
			return response;
		} catch (error) {
			return rejectWithValue(
				error instanceof Error ? error.message : "Failed to update step"
			);
		}
	}
);

/**
 * Skip current step
 */
export const skipStep = createAsyncThunk(
	"onboarding/skipStep",
	async (
		{ stepId, reason }: { stepId: number; reason: string },
		{ getState, rejectWithValue }
	) => {
		try {
			// Validate skip operation
			const state = getState() as { onboarding: OnboardingState };
			const { currentStep, completedSteps } = state.onboarding;

			// Can only skip current step
			if (stepId !== currentStep) {
				return rejectWithValue("Can only skip current step");
			}

			// Can't skip if already completed
			if (completedSteps.includes(stepId)) {
				return rejectWithValue("Cannot skip completed step");
			}

			const response = await skipOnboardingStep(stepId, reason);
			return response;
		} catch (error) {
			return rejectWithValue(
				error instanceof Error ? error.message : "Failed to skip step"
			);
		}
	}
);

/**
 * Complete onboarding process
 */
export const finishOnboarding = createAsyncThunk(
	"onboarding/complete",
	async (_, { getState, dispatch, rejectWithValue }) => {
		try {
			// Validate completion
			const state = getState() as { onboarding: OnboardingState };
			const { completedSteps } = state.onboarding;

			// Ensure all required steps are completed
			if (completedSteps.length < MAX_STEPS - 1) {
				// -1 for completion step
				return rejectWithValue("All required steps must be completed");
			}

			const response = await completeOnboarding();
			// Update auth state with completed status
			dispatch(updateOnboardingStatus(OnboardingStatus.COMPLETED));
			return response;
		} catch (error) {
			return rejectWithValue(
				error instanceof Error ? error.message : "Failed to complete onboarding"
			);
		}
	}
);

const onboardingSlice = createSlice({
	name: "onboarding",
	initialState,
	reducers: {
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.loading = action.payload;
		},
		setCurrentStep: (state, action: PayloadAction<number>) => {
			const stepId = state.currentStep;
			// Ensure completedSteps is initialized
			if (!Array.isArray(state.completedSteps)) {
				state.completedSteps = [];
			}
			state.currentStep = Math.min(action.payload, MAX_STEPS - 1);
		},
		setStepData: (
			state,
			action: PayloadAction<{
				stepId: number;
				data: Record<string, string | number | boolean | string[] | undefined>;
			}>
		) => {
			state.stepsData[action.payload.stepId] = action.payload.data;
		},
		completeStep: (state, action: PayloadAction<number>) => {
			const stepId = action.payload;
			if (!Array.isArray(state.completedSteps)) {
				state.completedSteps = [];
			}
			if (!state.completedSteps.includes(stepId)) {
				state.completedSteps = [...state.completedSteps, stepId];
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
		goBack: (state) => {
			// Reducer to handle navigation back
			if (state.currentStep > 0) {
				state.currentStep = state.currentStep - 1;
			}
		},
	},
	extraReducers: (builder) => {
		builder
			// Handle fetchProgress
			.addCase(fetchProgress.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchProgress.fulfilled, (state, action) => {
				state.loading = false;
				state.currentStep = action.payload.currentStep;
				state.completedSteps =
					action.payload.completedSteps?.slice(0, MAX_STEPS) || [];
				state.completed = action.payload.completed;
				state.roleSpecificData = action.payload.roleSpecificData || {};
			})
			.addCase(fetchProgress.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			// Handle startOnboardingProcess
			.addCase(startOnboardingProcess.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(startOnboardingProcess.fulfilled, (state, action) => {
				state.loading = false;
				state.currentStep = action.payload.currentStep;
				state.completedSteps =
					action.payload.completedSteps?.slice(0, MAX_STEPS) || [];
				state.completed = action.payload.completed;
				state.roleSpecificData = action.payload.roleSpecificData || {};
				// Reset step history and data when starting new
				state.stepHistory = [];
				state.stepsData = {};
			})
			.addCase(startOnboardingProcess.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			// Handle updateStep
			.addCase(updateStep.pending, (state) => {
				state.error = null;
			})
			.addCase(updateStep.fulfilled, (state, action) => {
				state.loading = false;
				const stepId = action.payload.id;

				// Ensure we're accessing the nested data structure correctly
				const responseData = action.payload.data;

				// Initialize completedSteps if needed
				if (!Array.isArray(state.completedSteps)) {
					state.completedSteps = [];
				}

				if (responseData?.status === OnboardingStepStatus.COMPLETED) {
					// Add to completedSteps if not already included
					if (!state.completedSteps.includes(responseData.id)) {
						state.completedSteps = [...state.completedSteps, responseData.id];
					}

					// Update current step based on the response
					if (typeof responseData.currentStep === "number") {
						state.currentStep = responseData.currentStep;
					} else if (responseData.id < MAX_STEPS - 1) {
						state.currentStep = responseData.id + 1;
					}
				}

				// Update step data if provided
				if (responseData?.data) {
					state.stepsData[responseData.id] = responseData.data;
				}
			})
			.addCase(updateStep.rejected, (state, action) => {
				state.error = action.payload as string;
			})
			// Handle skipStep
			.addCase(skipStep.pending, (state) => {
				state.error = null;
			})
			.addCase(skipStep.fulfilled, (state, action) => {
				if (
					!state.completedSteps.includes(action.payload.id) &&
					state.completedSteps.length < MAX_STEPS
				) {
					// Create a new array to update completedSteps
					state.completedSteps = Array.isArray(state.completedSteps)
						? [...state.completedSteps, action.payload.id]
						: [action.payload.id];
					// Move to next step after skipping
					if (action.payload.id < MAX_STEPS - 1) {
						state.currentStep = action.payload.id + 1;
					}
				}
			})
			.addCase(skipStep.rejected, (state, action) => {
				state.error = action.payload as string;
			})
			// Handle finishOnboarding
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
	setStepData,
	completeStep,
	setRoleSpecificData,
	cancelOnboarding,
	resumeOnboarding,
	resetOnboarding,
	setUserId,
	setError,
	goBack, // Export goBack reducer
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
