import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
	isAuthenticated: boolean;
	user: { id: string; name: string; email: string } | null;
	error: string | null;
}

const initialState: AuthState = {
	isAuthenticated: false,
	user: null,
	error: null,
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		login: (
			state,
			action: PayloadAction<{ id: string; name: string; email: string }>
		) => {
			state.isAuthenticated = true;
			state.user = action.payload;
			state.error = null;

			// Store token in cookie and localStorage
			document.cookie = `auth_token=${action.payload.id}; path=/; max-age=3600`; // Set token in cookie for 1 hour
			localStorage.setItem("auth_token", action.payload.id); // Optionally store in localStorage
		},
		logout: (state) => {
			state.isAuthenticated = false;
			state.user = null;
			state.error = null;

			// Clear the token from cookie and localStorage
			document.cookie = "auth_token=; Max-Age=0; path=/;"; // Clear the cookie
			localStorage.removeItem("auth_token"); // Clear from localStorage
		},
		setError: (state, action: PayloadAction<string>) => {
			state.error = action.payload;
		},
		clearError: (state) => {
			state.error = null;
		},
	},
});

export const { login, logout, setError, clearError } = authSlice.actions;
export default authSlice.reducer;
