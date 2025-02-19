import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { apiClient } from "@/lib/api/apiClient"
import type { User } from "@/lib/types"

interface UserState {
  items: User[]
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  items: [],
  loading: false,
  error: null,
}

export const fetchUsers = createAsyncThunk("user/fetchUsers", async (_, thunkAPI) => {
  try {
    const response = await apiClient.get<User[]>("/users")
    return response
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || "Failed to fetch users")
  }
})

export const addUser = createAsyncThunk(
  "user/addUser",
  async (user: Omit<User, "id" | "createdAt" | "updatedAt">, thunkAPI) => {
    try {
      const response = await apiClient.post<User>("/users", user)
      return response
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Failed to add a user")
    }
  },
)

export const updateUser = createAsyncThunk("user/updateUser", async (user: User, thunkAPI) => {
  try {
    const response = await apiClient.put<User>(`/users/${user.id}`, user)
    return response
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || "Failed to update a user")
  }
})

export const removeUser = createAsyncThunk("user/removeUser", async (id: string, thunkAPI) => {
  try {
    await apiClient.delete(`/users/${id}`)
    return id
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || "Failed to remove a user")
  }
})

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(addUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.loading = false
        state.items.push(action.payload)
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false
        const updatedUser = action.payload
        const index = state.items.findIndex((user) => user.id === updatedUser.id)
        if (index !== -1) {
          state.items[index] = updatedUser
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(removeUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(removeUser.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter((user) => user.id !== action.payload)
      })
      .addCase(removeUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default userSlice.reducer

