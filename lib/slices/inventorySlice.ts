// src/lib/slices/InventorySlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api/apiClient";
import { InventoryItem } from "@/lib/types";

interface InventoryState {
	items: InventoryItem[];
	loading: boolean;
	error: string | null;
}

const initialState: InventoryState = {
	items: [],
	loading: false,
	error: null,
};

export const fetchInventory = createAsyncThunk(
	"inventory/fetchInventory",
	async (_, thunkAPI) => {
		try {
			const response = await apiClient.get<InventoryItem[]>("/inventory");
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to fetch inventory"
			);
		}
	}
);

export const addInventoryItem = createAsyncThunk(
	"inventory/addInventoryItem",
	async (item: Omit<InventoryItem, "id">, thunkAPI) => {
		try {
			const response = await apiClient.post<InventoryItem>("/inventory", item);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to add inventory item"
			);
		}
	}
);

export const updateInventoryItem = createAsyncThunk(
	"inventory/updateInventoryItem",
	async (item: InventoryItem, thunkAPI) => {
		try {
			const response = await apiClient.put<InventoryItem>(
				`/inventory/${item.id}`,
				item
			);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to update inventory item"
			);
		}
	}
);

export const removeInventoryItem = createAsyncThunk(
	"inventory/removeInventoryItem",
	async (id: number, thunkAPI) => {
		try {
			await apiClient.delete(`/inventory/${id}`);
			return id;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to remove inventory item"
			);
		}
	}
);

const inventorySlice = createSlice({
	name: "inventory",
	initialState,
	reducers: {
		resetLoading: (state) => {
		  state.loading = false
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
		  state.loading = action.payload
		},
	  },
	extraReducers: (builder) => {
		builder
			.addCase(fetchInventory.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchInventory.fulfilled, (state, action) => {
				state.loading = false;
				state.items = action.payload;
			})
			.addCase(fetchInventory.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(addInventoryItem.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(addInventoryItem.fulfilled, (state, action) => {
				state.loading = false;
				state.items.push(action.payload);
			})
			.addCase(addInventoryItem.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(updateInventoryItem.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateInventoryItem.fulfilled, (state, action) => {
				state.loading = false;
				const updatedItem = action.payload;
				const index = state.items.findIndex(
					(item) => item.id === updatedItem.id
				);
				if (index !== -1) {
					state.items[index] = updatedItem;
				}
			})
			.addCase(updateInventoryItem.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(removeInventoryItem.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(removeInventoryItem.fulfilled, (state, action) => {
				state.loading = false;
				state.items = state.items.filter((item) => item.id !== action.payload);
			})
			.addCase(removeInventoryItem.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});
	},
});

export const { resetLoading, setLoading } = inventorySlice.actions;

// Export the actions, the reducer, and any extra logic you'd like
export default inventorySlice.reducer;
