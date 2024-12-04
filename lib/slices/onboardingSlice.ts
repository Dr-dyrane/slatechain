import {
	fetchProgress,
	saveStepProgress,
	completeOnboardingApi,
  } from "@/lib/api/onboarding";
  import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
  import { OnboardingProgress } from "@/lib/types/user";
  
  interface OnboardingState extends OnboardingProgress {
	userId: string | null;
	totalSteps: number;
	roleSpecificData: {
	  [key: string]: string | number | boolean;
	};
	completed: boolean;
	cancelled: boolean;
	error: string | null;
	isLoading: boolean;
  }
  
  const initialState: OnboardingState = {
	userId: null,
	currentStep: 0,
	totalSteps: 5,
	completedSteps: [],
	roleSpecificData: {},
	completed: false,
	cancelled: false,
	error: null,
	isLoading: false,
  };
  
  export const fetchUserProgress = createAsyncThunk<
	OnboardingProgress,
	string,
	{ rejectValue: string }
  >(
	"onboarding/fetchProgress",
	async (userId, { rejectWithValue }) => {
	  try {
		const response = await fetchProgress(userId);
		return response;
	  } catch (error) {
		return rejectWithValue("Failed to fetch progress.");
	  }
	}
  );
  
  export const saveProgress = createAsyncThunk<
	string,
	{ userId: string; stepId: number },
	{ rejectValue: string }
  >(
	"onboarding/saveProgress",
	async ({ userId, stepId }, { rejectWithValue }) => {
	  try {
		const response = await saveStepProgress(userId, stepId);
		return response.message;
	  } catch (error) {
		return rejectWithValue("Failed to save progress.");
	  }
	}
  );
  
  export const complete = createAsyncThunk<
	string,
	string,
	{ rejectValue: string }
  >(
	"onboarding/complete",
	async (userId, { rejectWithValue }) => {
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
		.addCase(fetchUserProgress.pending, (state) => {
		  state.isLoading = true;
		})
		.addCase(fetchUserProgress.fulfilled, (state, action: PayloadAction<OnboardingProgress>) => {
		  state.currentStep = action.payload.currentStep;
		  state.completedSteps = action.payload.completedSteps;
		  state.isLoading = false;
		  state.error = null;
		})
		.addCase(fetchUserProgress.rejected, (state, action) => {
		  state.isLoading = false;
		  state.error = action.payload ?? "Failed to fetch progress.";
		})
		.addCase(saveProgress.pending, (state) => {
		  state.isLoading = true;
		})
		.addCase(saveProgress.fulfilled, (state, action: PayloadAction<string>) => {
		  state.isLoading = false;
		  state.error = null;
		  console.log(action.payload); // Save success message
		})
		.addCase(saveProgress.rejected, (state, action) => {
		  state.isLoading = false;
		  state.error = action.payload ?? "Failed to save progress.";
		})
		.addCase(complete.pending, (state) => {
		  state.isLoading = true;
		})
		.addCase(complete.fulfilled, (state) => {
		  state.completed = true;
		  state.isLoading = false;
		  state.error = null;
		})
		.addCase(complete.rejected, (state, action) => {
		  state.isLoading = false;
		  state.error = action.payload ?? "Failed to complete onboarding.";
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
  
  