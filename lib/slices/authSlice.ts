import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  isAuthenticated: boolean
  user: { id: string; name: string; email: string } | null
  error: string | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ id: string; name: string; email: string }>) => {
      state.isAuthenticated = true
      state.user = action.payload
      state.error = null
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.error = null
      document.cookie = 'auth_token=; Max-Age=0; path=/;' // Clear the cookie
      localStorage.removeItem('auth_token') // If you're storing the token in localStorage
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const { login, logout, setError, clearError } = authSlice.actions
export default authSlice.reducer
