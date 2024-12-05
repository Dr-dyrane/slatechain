import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
	AuthState,
	User,
	AuthError,
	LoginRequest,
	RegisterRequest,
	KYCStatus,
	OnboardingStatus,
	AuthResponse,
} from "@/lib/types";
import {
	loginUser,
	registerUser,
	logoutUser,
	refreshAccessToken,
} from "@/lib/api/auth";

const initialState: AuthState = {
	user: null,
	accessToken: null,
	refreshToken: null,
	isAuthenticated: false,
	loading: false,
	error: null,
	kycStatus: KYCStatus.NOT_STARTED,
	onboardingStatus: OnboardingStatus.NOT_STARTED,
};

export const login = createAsyncThunk<
	AuthResponse,
	LoginRequest,
	{ rejectValue: AuthError }
>("auth/login", async (credentials, { rejectWithValue }) => {
	try {
		const response = await loginUser(credentials);
		localStorage.setItem("accessToken", response.accessToken);
		localStorage.setItem("refreshToken", response.refreshToken);
		return response;
	} catch (error: any) {
		const authError: AuthError = {
			code: error.response?.status || "UNKNOWN_ERROR",
			message:
				error.response?.data?.message || error.message || "An error occurred",
		};
		return rejectWithValue(authError);
	}
});

export const register = createAsyncThunk<
	AuthResponse,
	RegisterRequest,
	{ rejectValue: AuthError }
>("auth/register", async (userData, { rejectWithValue }) => {
	try {
		const response = await registerUser(userData);
		localStorage.setItem("accessToken", response.accessToken);
		localStorage.setItem("refreshToken", response.refreshToken);
		return response;
	} catch (error: any) {
		const authError: AuthError = {
			code: error.response?.status || "UNKNOWN_ERROR",
			message:
				error.response?.data?.message || error.message || "An error occurred",
		};
		return rejectWithValue(authError);
	}
});

export const logout = createAsyncThunk<void, void, { rejectValue: AuthError }>(
	"auth/logout",
	async (_, { getState, rejectWithValue }) => {
		try {
			const { auth } = getState() as { auth: AuthState };
			if (auth.refreshToken) {
				await logoutUser(auth.refreshToken);
			}
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
		} catch (error: any) {
			const authError: AuthError = {
				code: "LOGOUT_ERROR",
				message:
					error.response?.data?.message ||
					error.message ||
					"An error occurred during logout",
			};
			return rejectWithValue(authError);
		}
	}
);

export const refreshToken = createAsyncThunk<
	AuthResponse,
	void,
	{ rejectValue: AuthError }
>("auth/refreshToken", async (_, { getState, rejectWithValue }) => {
	try {
		const { auth } = getState() as { auth: AuthState };
		if (!auth.refreshToken) {
			throw new Error("No refresh token available");
		}
		const response = await refreshAccessToken(auth.refreshToken);
		localStorage.setItem("accessToken", response.accessToken);
		return response;
	} catch (error: any) {
		const authError: AuthError = {
			code: "REFRESH_ERROR",
			message:
				error.response?.data?.message ||
				error.message ||
				"An error occurred while refreshing the token",
		};
		return rejectWithValue(authError);
	}
});

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		clearError: (state) => {
			state.error = null;
		},
		setUser: (state, action: PayloadAction<User>) => {
			state.user = action.payload;
			state.isAuthenticated = true;
		},
		setKYCStatus: (state, action: PayloadAction<KYCStatus>) => {
			state.kycStatus = action.payload;
		},
		setOnboardingStatus: (state, action: PayloadAction<OnboardingStatus>) => {
			state.onboardingStatus = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(login.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(login.fulfilled, (state, action) => {
				state.user = action.payload.user;
				state.accessToken = action.payload.accessToken;
				state.refreshToken = action.payload.refreshToken;
				state.isAuthenticated = true;
				state.loading = false;
				state.kycStatus = action.payload.user.kycStatus;
				state.onboardingStatus = action.payload.user.onboardingStatus;
			})
			.addCase(login.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload || {
					code: "UNKNOWN_ERROR",
					message: "An unknown error occurred",
				};
			})
			.addCase(register.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(register.fulfilled, (state, action) => {
				state.user = action.payload.user;
				state.accessToken = action.payload.accessToken;
				state.refreshToken = action.payload.refreshToken;
				state.isAuthenticated = true;
				state.loading = false;
				state.kycStatus = action.payload.user.kycStatus;
				state.onboardingStatus = action.payload.user.onboardingStatus;
			})
			.addCase(register.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload || {
					code: "UNKNOWN_ERROR",
					message: "An unknown error occurred",
				};
			})
			.addCase(logout.fulfilled, (state) => {
				return initialState;
			})
			.addCase(logout.rejected, (state, action) => {
				state.error = action.payload || {
					code: "LOGOUT_ERROR",
					message: "An error occurred during logout",
				};
			})
			.addCase(refreshToken.fulfilled, (state, action) => {
				state.user = action.payload.user;
				state.accessToken = action.payload.accessToken;
				state.refreshToken = action.payload.refreshToken;
				state.isAuthenticated = true;
			})
			.addCase(refreshToken.rejected, (state, action) => {
				state.error = action.payload || {
					code: "REFRESH_ERROR",
					message: "An error occurred while refreshing the token",
				};
				localStorage.removeItem("accessToken");
				localStorage.removeItem("refreshToken");
				return initialState;
			});
	},
});

export const { clearError, setUser, setKYCStatus, setOnboardingStatus } =
	authSlice.actions;
export default authSlice.reducer;
