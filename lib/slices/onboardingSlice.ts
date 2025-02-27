import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from "@reduxjs/toolkit";
import { type OnboardingState, OnboardingStatus, OnboardingStepStatus } from "@/lib/types";
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
 * Navigate back to previous step
 */
export const navigateBack = createAsyncThunk(
	"onboarding/navigateBack",
	async (_, { getState, dispatch, rejectWithValue }) => {
		try {
			const state = getState() as { onboarding: OnboardingState };
			const { currentStep, stepHistory, stepsData } = state.onboarding;

			if (currentStep <= 0) {
				return rejectWithValue("Already at first step");
			}

			const previousStep = currentStep - 1;
			const previousStepData = stepsData[previousStep] || {};

			// Only update step status if not already completed
			if (!state.onboarding.completedSteps.includes(previousStep)) {
				await dispatch(
					updateStep({
						stepId: previousStep,
						status: OnboardingStepStatus.IN_PROGRESS,
						data: previousStepData,
					})
				).unwrap();
			}

			return {
				nextStep: previousStep,
				stepData: previousStepData,
			};
		} catch (error) {
			return rejectWithValue(
				error instanceof Error ? error.message : "Failed to navigate back"
			);
		}
	}
);

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
			 dispatch(updateOnboardingStatus(OnboardingStatus.COMPLETED))
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
			// Add current step to history before changing
			state.stepHistory.push({
				stepId: state.currentStep,
				data: state.stepsData[state.currentStep] || {},
			});
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
			if (
				action.payload < MAX_STEPS &&
				!state.completedSteps.includes(action.payload) &&
				state.completedSteps.length < MAX_STEPS
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
			// Handle navigateBack
			.addCase(navigateBack.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(navigateBack.fulfilled, (state, action) => {
				state.loading = false;
				state.currentStep = action.payload.nextStep;
				// Don't clear step data, preserve it
				state.error = null;
			})
			.addCase(navigateBack.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message || "Failed to navigate back";
			})
			// Handle fetchProgress
			.addCase(fetchProgress.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchProgress.fulfilled, (state, action) => {
				state.loading = false;
				state.currentStep = action.payload.currentStep;
				state.completedSteps = action.payload.completedSteps.slice(
					0,
					MAX_STEPS
				);
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
				state.completedSteps = action.payload.completedSteps.slice(
					0,
					MAX_STEPS
				);
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
				if (action.payload.status === OnboardingStepStatus.COMPLETED) {
					if (
						!state.completedSteps.includes(action.payload.id) &&
						state.completedSteps.length < MAX_STEPS
					) {
						state.completedSteps.push(action.payload.id);
					}

					// Move to next step if not the last one
					if (
						action.payload.id < MAX_STEPS - 1 &&
						state.completedSteps.length < MAX_STEPS
					) {
						state.currentStep = action.payload.id + 1;
					}
				} else if (action.payload.status === OnboardingStepStatus.IN_PROGRESS) {
					state.currentStep = action.payload.id;
				}

				// Update step data if provided
				if (action.payload.data) {
					state.stepsData[action.payload.id] = action.payload.data;
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
					state.completedSteps.push(action.payload.id);
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
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
