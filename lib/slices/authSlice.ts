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
import { signIn, signOut } from "next-auth/react";

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
		const result = await signIn("credentials", {
			...credentials,
			redirect: false,
		});

		if (result?.error) {
			throw new Error(result.error);
		}

		const response = await loginUser(credentials);
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

export const googleLogin = createAsyncThunk<
	void,
	void,
	{ rejectValue: AuthError }
>("auth/googleLogin", async (_, { rejectWithValue }) => {
	try {
		await signIn("google", { callbackUrl: "/dashboard" });
	} catch (error: any) {
		const authError: AuthError = {
			code: "GOOGLE_LOGIN_ERROR",
			message: error.message || "An error occurred during Google login",
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
	async (_, { rejectWithValue }) => {
		try {
			await logoutUser();
			await signOut({ callbackUrl: "/login" });
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

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		clearError: (state) => {
			state.error = null;
		},
		setUser: (state, action: PayloadAction<AuthResponse>) => {
			state.user = action.payload.user;
			state.isAuthenticated = true;
			state.accessToken = action.payload.accessToken;
			state.refreshToken = action.payload.refreshToken;
		},
		setKYCStatus: (state, action: PayloadAction<KYCStatus>) => {
			state.kycStatus = action.payload;
		},
		setOnboardingStatus: (state, action: PayloadAction<OnboardingStatus>) => {
			state.onboardingStatus = action.payload;
		},
		resetLoading: (state) => {
			state.loading = false;
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
			.addCase(googleLogin.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(googleLogin.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload || {
					code: "GOOGLE_LOGIN_ERROR",
					message: "An error occurred during Google login",
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
			});
	},
});

export const {
	clearError,
	setUser,
	setKYCStatus,
	setOnboardingStatus,
	resetLoading,
} = authSlice.actions;
export default authSlice.reducer;
