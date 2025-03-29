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
	changeUserPassword,
	sendPasswordResetEmail,
	resetPassword,
	updateUserProfile,
} from "@/lib/api/auth";
import { tokenManager } from "../helpers/tokenManager";
import { toast } from "sonner";
import {
	connectWallet,
	signMessage,
	type WalletInfo,
} from "../blockchain/web3Provider";
import { authContract } from "../blockchain/authContract";

const initialState: AuthState = {
	user: null,
	accessToken: null,
	refreshToken: null,
	isAuthenticated: false,
	loading: false,
	error: null,
	kycStatus: KYCStatus.NOT_STARTED,
	onboardingStatus: OnboardingStatus.NOT_STARTED,
	wallet: null,
	isWalletConnecting: false,
};

export const connectBlockchainWallet = createAsyncThunk<
	WalletInfo,
	void,
	{ rejectValue: AuthError }
>("auth/connectBlockchainWallet", async (_, { rejectWithValue }) => {
	try {
		const wallet = await connectWallet();
		if (!wallet) {
			throw new Error("Failed to connect wallet");
		}
		return wallet;
	} catch (error: any) {
		return rejectWithValue({
			code: "WALLET_CONNECTION_ERROR",
			message: error.message || "Failed to connect wallet",
		});
	}
});

export const loginWithWallet = createAsyncThunk<
	AuthResponse,
	void,
	{ rejectValue: AuthError; state: { auth: AuthState } }
>(
	"auth/loginWithWallet",
	async (_, { getState, dispatch, rejectWithValue }) => {
		try {
			const { wallet } = getState().auth;

			if (!wallet || !wallet.address) {
				throw new Error("Wallet not connected");
			}

			// Check if user exists on the blockchain
			const userExists = await authContract.userExists(wallet.address);

			if (!userExists) {
				throw new Error("Wallet not registered. Please register first.");
			}

			// Generate a nonce for the user to sign
			const nonce = Math.floor(Math.random() * 1000000).toString();
			const message = `Sign this message to authenticate with SlateChain: ${nonce}`;

			// Ask user to sign the message
			const signature = await signMessage(message);

			if (!signature) {
				throw new Error("Failed to sign authentication message");
			}

			// Send the signature to the backend for verification
			const response = await fetch("/api/auth/wallet/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					address: wallet.address,
					message,
					signature,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Authentication failed");
			}

			const authResponse = await response.json();
			return authResponse;
		} catch (error: any) {
			return rejectWithValue({
				code: "WALLET_LOGIN_ERROR",
				message: error.message || "Failed to authenticate with wallet",
			});
		}
	}
);

export const registerWithWallet = createAsyncThunk<
	AuthResponse,
	{ email: string; firstName: string; lastName: string },
	{ rejectValue: AuthError; state: { auth: AuthState } }
>(
	"auth/registerWithWallet",
	async (userData, { getState, rejectWithValue }) => {
		try {
			const { wallet } = getState().auth;

			if (!wallet || !wallet.address) {
				throw new Error("Wallet not connected");
			}

			// Check if wallet is already registered
			const userExists = await authContract.userExists(wallet.address);

			if (userExists) {
				throw new Error("Wallet already registered. Please login instead.");
			}

			// Generate a nonce for the user to sign
			const nonce = Math.floor(Math.random() * 1000000).toString();
			const message = `Sign this message to register with SlateChain: ${nonce}`;

			// Ask user to sign the message
			const signature = await signMessage(message);

			if (!signature) {
				throw new Error("Failed to sign registration message");
			}

			// Send the registration data to the backend
			const response = await fetch("/api/auth/wallet/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					address: wallet.address,
					message,
					signature,
					email: userData.email,
					firstName: userData.firstName,
					lastName: userData.lastName,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Registration failed");
			}

			const authResponse = await response.json();
			return authResponse;
		} catch (error: any) {
			return rejectWithValue({
				code: "WALLET_REGISTRATION_ERROR",
				message: error.message || "Failed to register with wallet",
			});
		}
	}
);

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

export const googleLogin = createAsyncThunk<void, void>(
	"auth/googleLogin",
	async () => {
		window.location.href = "/api/auth/google";
	}
);

export const appleLogin = createAsyncThunk<void, void>(
	"auth/appleLogin",
	async () => {
		window.location.href = "/api/auth/apple";
	}
);

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
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.loading = action.payload;
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
		updateOnboardingStatus: (
			state,
			action: PayloadAction<OnboardingStatus>
		) => {
			if (state.user) {
				state.user.onboardingStatus = action.payload;
			}
			state.onboardingStatus = action.payload;
		},
		// wallet
		disconnectWallet: (state) => {
			state.wallet = null;
		},
		setWallet: (state, action: PayloadAction<WalletInfo>) => {
			state.wallet = action.payload;
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
			.addCase(appleLogin.pending, (state) => {
				state.loading = true;
				state.error = null;
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
			})
			.addCase(connectBlockchainWallet.pending, (state) => {
				state.isWalletConnecting = true;
				state.error = null;
			})
			.addCase(connectBlockchainWallet.fulfilled, (state, action) => {
				state.wallet = action.payload;
				state.isWalletConnecting = false;
			})
			.addCase(connectBlockchainWallet.rejected, (state, action) => {
				state.isWalletConnecting = false;
				state.error = action.payload || {
					code: "WALLET_CONNECTION_ERROR",
					message: "Failed to connect wallet",
				};
			})
			.addCase(loginWithWallet.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(loginWithWallet.fulfilled, (state, action) => {
				state.user = action.payload.user;
				state.accessToken = action.payload.accessToken;
				state.refreshToken = action.payload.refreshToken;
				state.isAuthenticated = true;
				state.loading = false;
				state.kycStatus = action.payload.user.kycStatus;
				state.onboardingStatus = action.payload.user.onboardingStatus;
			})
			.addCase(loginWithWallet.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload || {
					code: "WALLET_LOGIN_ERROR",
					message: "Failed to authenticate with wallet",
				};
			})
			.addCase(registerWithWallet.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(registerWithWallet.fulfilled, (state, action) => {
				state.user = action.payload.user;
				state.accessToken = action.payload.accessToken;
				state.refreshToken = action.payload.refreshToken;
				state.isAuthenticated = true;
				state.loading = false;
				state.kycStatus = action.payload.user.kycStatus;
				state.onboardingStatus = action.payload.user.onboardingStatus;
			})
			.addCase(registerWithWallet.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload || {
					code: "WALLET_REGISTRATION_ERROR",
					message: "Failed to register with wallet",
				};
			});
	},
});

export const {
	clearError,
	setUser,
	setLoading,
	setKYCStatus,
	setOnboardingStatus,
	resetLoading,
	setTokens,
	updateOnboardingStatus,
	disconnectWallet,
	setWallet,
} = authSlice.actions;
export default authSlice.reducer;
