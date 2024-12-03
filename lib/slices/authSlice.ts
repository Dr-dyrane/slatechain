import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { registerUser, loginUser } from "@/api/auth";

interface User {
	id: string;
	name: string;
	email: string;
	role: string;
}

interface AuthState {
	isAuthenticated: boolean;
	user: User | null;
	error: string | null;
	isLoading: boolean;
}

const initialState: AuthState = {
	isAuthenticated: false,
	user: null,
	error: null,
	isLoading: false,
};

export const register = createAsyncThunk(
	"auth/register",
	async (userData: Omit<User, "id">, { rejectWithValue }) => {
		try {
			const response = await registerUser(userData);
			return response;
		} catch (error) {
			return rejectWithValue("Registration failed");
		}
	}
);

export const login = createAsyncThunk(
	"auth/login",
	async (
		credentials: { email: string; password: string },
		{ rejectWithValue }
	) => {
		try {
			const response = await loginUser(credentials);
			return response;
		} catch (error) {
			return rejectWithValue("Login failed");
		}
	}
);

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		logout: (state) => {
			state.isAuthenticated = false;
			state.user = null;
			state.error = null;
		},
		clearError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(register.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(register.fulfilled, (state, action) => {
				state.isAuthenticated = true;
				state.user = action.payload;
				state.isLoading = false;
				state.error = null;
			})
			.addCase(register.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})
			.addCase(login.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(login.fulfilled, (state, action) => {
				state.isAuthenticated = true;
				state.user = action.payload;
				state.isLoading = false;
				state.error = null;
			})
			.addCase(login.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			});
	},
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
