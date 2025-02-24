// src/lib/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
	AuthState,
	AuthError,
	LoginRequest,
	RegisterRequest,
	KYCStatus,
	OnboardingStatus,
	AuthResponse,
	User,
	PasswordChangeFormData,
} from "@/lib/types";
import {
	loginUser,
	registerUser,
	logoutUser,
	getUserData,
	googleCallback,
	changeUserPassword,
	sendPasswordResetEmail,
	resetPassword,
	updateUserProfile,
} from "@/lib/api/auth";
import { tokenManager } from "../helpers/tokenManager";
import { toast } from "sonner";

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

export const fetchUser = createAsyncThunk<
	AuthResponse,
	void,
	{ rejectValue: AuthError }
>("auth/fetchUser", async (_, { rejectWithValue }) => {
	try {
		const userData = await getUserData();
		return userData;
	} catch (error: any) {
		const authError: AuthError = {
			code: "GOOGLE_LOGIN_ERROR",
			message: error.message || "An error occurred fetching user information",
		};
		return rejectWithValue(authError);
	}
});

export const updateUser = createAsyncThunk<
	User,
	Partial<User>,
	{ rejectValue: AuthError }
>("auth/updateUser", async (profileData, { rejectWithValue }) => {
	try {
		return await updateUserProfile(profileData);
	} catch (error: any) {
		const authError: AuthError = {
			code: "UPDATE_PROFILE_ERROR",
			message:
				error.response?.data?.message ||
				error.message ||
				"Failed to update profile",
		};
		return rejectWithValue(authError);
	}
});

export const resetUserPassword = createAsyncThunk<
	void,
	{ code: string; newPassword: string },
	{ rejectValue: AuthError }
>(
	"auth/resetUserPassword",
	async ({ code, newPassword }, { rejectWithValue }) => {
		try {
			await resetPassword(code, newPassword);
			toast.success(
				"Password reset successful, please log in with your new password"
			);
		} catch (error: any) {
			const authError: AuthError = {
				code: "GOOGLE_LOGIN_ERROR",
				message: error.message || "An error occurred reseting the password",
			};
			return rejectWithValue(authError);
		}
	}
);

export const sendResetEmail = createAsyncThunk<
	void,
	string,
	{ rejectValue: AuthError }
>("auth/sendResetEmail", async (email, { rejectWithValue }) => {
	try {
		await sendPasswordResetEmail(email);
	} catch (error: any) {
		const authError: AuthError = {
			code: "GOOGLE_LOGIN_ERROR",
			message: error.message || "An error occurred sending email",
		};
		return rejectWithValue(authError);
	}
});

export const changePassword = createAsyncThunk<
	void,
	PasswordChangeFormData,
	{ rejectValue: AuthError }
>("auth/changePassword", async (passwordData, { rejectWithValue }) => {
	try {
		await changeUserPassword(passwordData);
	} catch (error: any) {
		const authError: AuthError = {
			code: "GOOGLE_LOGIN_ERROR",
			message: error.message || "An error occurred during password change",
		};
		return rejectWithValue(authError);
	}
});

export const login = createAsyncThunk<
	AuthResponse,
	LoginRequest,
	{ rejectValue: AuthError }
>("auth/login", async (credentials, { rejectWithValue }) => {
	try {
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
	AuthResponse,
	void,
	{ rejectValue: AuthError }
>("auth/google", async (_, { rejectWithValue }) => {
	try {
		const response = await googleCallback();
		return response;
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
	async (_, { rejectWithValue, dispatch }) => {
		try {
			await logoutUser();
			tokenManager.clearTokens(); // Clear tokens from storage
			dispatch(authSlice.actions.resetAuthState()); // Reset state
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
		resetAuthState: (state) => {
			state.user = null;
			state.accessToken = null;
			state.refreshToken = null;
			state.isAuthenticated = false;
			state.loading = false;
			state.kycStatus = KYCStatus.NOT_STARTED;
			state.onboardingStatus = OnboardingStatus.NOT_STARTED;
			tokenManager.clearTokens();
		},
		setUser: (state, action: PayloadAction<any>) => {
			state.user = action.payload;
			state.isAuthenticated = true;
			state.kycStatus = action.payload.kycStatus;
			state.onboardingStatus = action.payload.onboardingStatus;
			if (action.payload.accessToken) {
				state.accessToken = action.payload.accessToken;
				state.refreshToken = action.payload.refreshToken;
			}
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
		setTokens: (
			state,
			action: PayloadAction<{ accessToken: string; refreshToken: string }>
		) => {
			state.isAuthenticated = true;
			state.accessToken = action.payload.accessToken;
			state.refreshToken = action.payload.refreshToken;
			tokenManager.setTokens(
				action.payload.accessToken,
				action.payload.refreshToken
			);
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchUser.fulfilled, (state, action) => {
				state.loading = false;
				state.user = action.payload.user;
			})
			.addCase(fetchUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload || {
					code: "FETCH_USER_ERROR",
					message: "Failed to fetch user information",
				};
			})
			.addCase(updateUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateUser.fulfilled, (state, action) => {
				state.loading = false;
				state.user = action.payload;
			})
			.addCase(updateUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as AuthError;
			})
			.addCase(resetUserPassword.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(resetUserPassword.fulfilled, (state, action) => {
				state.loading = false;
				// toast.success("Password reset successful, please log in with your new password");
			})
			.addCase(resetUserPassword.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as AuthError;
			})
			.addCase(sendResetEmail.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(sendResetEmail.fulfilled, (state, action) => {
				state.loading = false;
				// toast.success('A reset email has been sent, please check you inbox');
			})
			.addCase(sendResetEmail.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload || {
					code: "SEND_EMAIL_ERROR",
					message: "Failed to send reset email, please try again later",
				};
			})
			.addCase(changePassword.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(changePassword.fulfilled, (state, action) => {
				state.loading = false;
			})
			.addCase(changePassword.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload || {
					code: "PASSWORD_CHANGE_ERROR",
					message: "An error occurred during password change",
				};
			})

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
			.addCase(googleLogin.fulfilled, (state, action) => {
				state.user = action.payload.user;
				state.accessToken = action.payload.accessToken;
				state.refreshToken = action.payload.refreshToken;
				state.isAuthenticated = true;
				state.loading = false;
				state.kycStatus = action.payload.user.kycStatus;
				state.onboardingStatus = action.payload.user.onboardingStatus;
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
				state.user = null;
				state.accessToken = null;
				state.refreshToken = null;
				state.isAuthenticated = false;
				state.loading = false;
				tokenManager.clearTokens();
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
	setTokens,
} = authSlice.actions;
export default authSlice.reducer;
