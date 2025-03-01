// lib/slices/user/user.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { User } from "@/lib/types";
import { apiClient } from "@/lib/api/apiClient/[...live]";

interface UserState {
	items: User[];
	loading: boolean;
	error: string | null;
}

interface PaginatedUsersResponse {
	users: User[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		pages: number;
	};
}

const initialState: UserState = {
	items: [],
	loading: false,
	error: null,
};

export const fetchUsers = createAsyncThunk(
	"user/fetchUsers",
	async (_, thunkAPI) => {
		try {
			let allUsers: User[] = [];
			let page = 1;
			const limit = 10; // You can adjust this limit as needed

			while (true) {
				// Fetch a page of users
				const response = await apiClient.get<PaginatedUsersResponse>(
					`/users?page=${page}&limit=${limit}`
				);

				// Add the users from the current page to the accumulated list
				allUsers = allUsers.concat(response.users);

				// Check if there are more pages
				if (response.pagination.page >= response.pagination.pages) {
					// If there are no more pages, break out of the loop
					break;
				}

				// Increment the page number for the next request
				page++;
			}

			// Once you have fetched all pages, return the entire list of users
			return allUsers;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error.message || "Failed to fetch users");
		}
	}
);

export const addUser = createAsyncThunk(
	"user/addUser",
	async (user: Omit<User, "id" | "createdAt" | "updatedAt">, thunkAPI) => {
		try {
			const response = await apiClient.post<User>("/users", user);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error.message || "Failed to add a user");
		}
	}
);

export const updateUser = createAsyncThunk(
	"user/updateUser",
	async (user: User, thunkAPI) => {
		try {
			const response = await apiClient.put<User>(`/users/${user.id}`, user);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to update a user"
			);
		}
	}
);

export const removeUser = createAsyncThunk(
	"user/removeUser",
	async (id: string, thunkAPI) => {
		try {
			await apiClient.delete(`/users/${id}`);
			return id;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to remove a user"
			);
		}
	}
);

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchUsers.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchUsers.fulfilled, (state, action) => {
				state.loading = false;
				state.items = action.payload;
			})
			.addCase(fetchUsers.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(addUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(addUser.fulfilled, (state, action) => {
				state.loading = false;
				state.items.push(action.payload);
			})
			.addCase(addUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(updateUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateUser.fulfilled, (state, action) => {
				state.loading = false;
				const updatedUser = action.payload;
				const index = state.items.findIndex(
					(user) => user.id === updatedUser.id
				);
				if (index !== -1) {
					state.items[index] = updatedUser;
				}
			})
			.addCase(updateUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(removeUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(removeUser.fulfilled, (state, action) => {
				state.loading = false;
				state.items = state.items.filter((user) => user.id !== action.payload);
			})
			.addCase(removeUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});
	},
});

export default userSlice.reducer;
