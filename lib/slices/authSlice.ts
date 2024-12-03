import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

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

export const registerUser = createAsyncThunk<
	User,
	any,
	{ rejectValue: string }
>("auth/registerUser", async (userData, { rejectWithValue }) => {
	try {
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));
		// In a real app, you would make an API call here
		const response = { data: { id: "1", ...userData } };
		return response.data as User;
	} catch (error) {
		return rejectWithValue("Registration failed");
	}
});

export const login = createAsyncThunk(
	"auth/login",
	async (
		credentials: { email: string; password: string },
		{ rejectWithValue }
	) => {
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			// In a real app, you would make an API call here
			const response = {
				data: {
					id: "1",
					name: "John Doe",
					email: credentials.email,
					role: "admin",
				},
			};
			return response.data;
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
			.addCase(registerUser.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
				state.isAuthenticated = true;
				state.user = action.payload;
				state.isLoading = false;
				state.error = null;
			})
			.addCase(registerUser.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})
			.addCase(login.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
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
