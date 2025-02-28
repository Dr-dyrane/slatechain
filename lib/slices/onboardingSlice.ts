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

// Helper function to ensure completedSteps is always an array
const ensureCompletedSteps = (state: OnboardingState) => {
	if (!Array.isArray(state.completedSteps)) {
		state.completedSteps = [];
	}
};

// Helper function to safely handle nested response data
const getResponseData = (response: any) => {
	return response?.data || response;
};

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

// Update the thunks to handle nested response structure
export const fetchProgress = createAsyncThunk(
	"onboarding/fetchProgress",
	async (_, { rejectWithValue }) => {
		try {
			const response = await fetchOnboardingProgress();
			return getResponseData(response);
		} catch (error) {
			return rejectWithValue(
				error instanceof Error ? error.message : "Failed to fetch progress"
			);
		}
	}
);

export const startOnboardingProcess = createAsyncThunk(
	"onboarding/start",
	async (_, { rejectWithValue }) => {
		try {
			const response = await startOnboarding();
			return getResponseData(response);
		} catch (error) {
			return rejectWithValue(
				error instanceof Error ? error.message : "Failed to start onboarding"
			);
		}
	}
);

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
			data?: Record<string, any>;
		},
		{ dispatch, rejectWithValue }
	) => {
		try {
			const response = await updateOnboardingStep(stepId, status, data);
			// Update roleSpecificData if it's in the response:
			if (response?.data?.roleSpecificData) {
				dispatch(setRoleSpecificData(response.data.roleSpecificData));
			}
			return getResponseData(response);
		} catch (error) {
			return rejectWithValue(
				error instanceof Error ? error.message : "Failed to update step"
			);
		}
	}
);

export const skipStep = createAsyncThunk(
	"onboarding/skipStep",
	async (
		{ stepId, reason }: { stepId: number; reason: string },
		{ rejectWithValue }
	) => {
		try {
			const response = await skipOnboardingStep(stepId, reason);
			return getResponseData(response);
		} catch (error) {
			return rejectWithValue(
				error instanceof Error ? error.message : "Failed to skip step"
			);
		}
	}
);

export const finishOnboarding = createAsyncThunk(
	"onboarding/complete",
	async (_, { dispatch, rejectWithValue }) => {
		try {
			const response = await completeOnboarding();
			const responseData = getResponseData(response);
			dispatch(updateOnboardingStatus(OnboardingStatus.COMPLETED));
			return responseData;
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
			ensureCompletedSteps(state);
			state.currentStep = Math.min(action.payload, MAX_STEPS - 1);
		},
		setStepData: (
			state,
			action: PayloadAction<{
				stepId: number;
				data: Record<string, any>;
			}>
		) => {
			state.stepsData[action.payload.stepId] = action.payload.data;
		},
		completeStep: (state, action: PayloadAction<number>) => {
			ensureCompletedSteps(state);
			const stepId = action.payload;
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
			if (state.currentStep > 0) {
				state.currentStep -= 1;
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
				ensureCompletedSteps(state);
				const progressData = action.payload.data || action.payload;
				state.currentStep = action.payload.currentStep;
				state.completedSteps =
					action.payload.completedSteps?.slice(0, MAX_STEPS) || [];
				state.completed = action.payload.completed;
				state.roleSpecificData = action.payload.roleSpecificData || {};
				// Store step data in stepsData
				if (progressData.steps) {
					progressData.steps.forEach((step: any) => {
						if (step.data) {
							state.stepsData[step.stepId] = step.data;
						}
					});
				}
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
				ensureCompletedSteps(state);
				state.currentStep = action.payload.currentStep;
				state.completedSteps =
					action.payload.completedSteps?.slice(0, MAX_STEPS) || [];
				state.completed = action.payload.completed;
				state.roleSpecificData = action.payload.roleSpecificData || {};
				state.stepHistory = [];
				state.stepsData = {};
			})
			.addCase(startOnboardingProcess.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			// Handle updateStep
			.addCase(updateStep.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateStep.fulfilled, (state, action) => {
				state.loading = false;
				ensureCompletedSteps(state);

				if (action.payload.status === OnboardingStepStatus.COMPLETED) {
					if (!state.completedSteps.includes(action.payload.id)) {
						state.completedSteps = [...state.completedSteps, action.payload.id];
					}

					if (typeof action.payload.currentStep === "number") {
						state.currentStep = action.payload.currentStep;
					} else if (action.payload.id < MAX_STEPS - 1) {
						state.currentStep = action.payload.id + 1;
					}
				}

				if (action.payload.data) {
					state.stepsData[action.payload.id] = action.payload.data;
				}
			})
			.addCase(updateStep.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			// Handle skipStep
			.addCase(skipStep.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(skipStep.fulfilled, (state, action) => {
				state.loading = false;
				ensureCompletedSteps(state);

				if (!state.completedSteps.includes(action.payload.id)) {
					state.completedSteps = [...state.completedSteps, action.payload.id];

					if (action.payload.id < MAX_STEPS - 1) {
						state.currentStep = action.payload.id + 1;
					}
				}
			})
			.addCase(skipStep.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			// Handle finishOnboarding
			.addCase(finishOnboarding.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(finishOnboarding.fulfilled, (state, action) => {
				state.loading = false;
				state.completed = true;
				// Handle any additional data from the completion response if needed
				if (action.payload?.completedAt) {
					state.stepsData[MAX_STEPS - 1] = {
						completedAt: action.payload.completedAt,
					};
				}
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
	goBack,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
