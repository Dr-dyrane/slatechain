// src/lib/slices/inventorySlice.ts

import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from "@reduxjs/toolkit";
import type {
	InventoryItem,
	InventoryState,
	ManufacturingOrder,
	StockMovement,
	Warehouse,
} from "@/lib/types";
import { apiClient } from "../api/apiClient/[...live]";

const initialState: InventoryState = {
	items: [],
	warehouses: [],
	stockMovements: [],
	manufacturingOrders: [],
	loading: false,
	error: null,
};

// Async Thunks
export const fetchInventory = createAsyncThunk(
	"inventory/fetchInventory",
	async (_, thunkAPI) => {
		try {
			let allInventory: InventoryItem[] = [];
			let page = 1;
			const limit = 50; // Default limit from API

			while (true) {
				// Fetch inventory data page by page
				const response = await apiClient.get<{
					items: InventoryItem[];
					page: number;
					totalPages: number;
				}>(`/inventory?page=${page}&limit=${limit}`);

				// Add fetched items to the list
				allInventory = allInventory.concat(response.items);

				// Stop when all pages are fetched
				if (response.page >= response.totalPages) {
					break;
				}

				// Move to the next page
				page++;
			}

			// Return the complete inventory list
			return allInventory;
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
	async (id: any, thunkAPI) => {
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

// Warehouse Management Thunks
export const fetchWarehouses = createAsyncThunk(
	"inventory/fetchWarehouses",
	async (_, thunkAPI) => {
		try {
			const response = await apiClient.get<Warehouse[]>("/warehouses");
			return response || [];
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to fetch warehouses"
			);
		}
	}
);

export const addWarehouse = createAsyncThunk(
	"inventory/addWarehouse",
	async (
		warehouse: Omit<Warehouse, "id" | "createdAt" | "updatedAt">,
		thunkAPI
	) => {
		try {
			const response = await apiClient.post<Warehouse>(
				"/warehouses",
				warehouse
			);
			return response;
		} catch (error: any) {
			// Extract the error message from the response if available
			if (error.message && typeof error.message === "string") {
				return thunkAPI.rejectWithValue(error.message);
			}
			return thunkAPI.rejectWithValue(
				"Failed to add warehouse. Please try again."
			);
		}
	}
);

export const updateWarehouse = createAsyncThunk(
	"inventory/updateWarehouse",
	async (warehouse: Warehouse, thunkAPI) => {
		try {
			const response = await apiClient.put<Warehouse>(
				`/warehouses/${warehouse.id}`,
				warehouse
			);
			return response;
		} catch (error: any) {
			// Extract the error message from the response if available
			if (error.message && typeof error.message === "string") {
				return thunkAPI.rejectWithValue(error.message);
			}
			return thunkAPI.rejectWithValue(
				"Failed to update warehouse. Please try again."
			);
		}
	}
);

export const deleteWarehouse = createAsyncThunk(
	"inventory/deleteWarehouse",
	async (id: string, thunkAPI) => {
		try {
			await apiClient.delete(`/warehouses/${id}`);
			return id;
		} catch (error: any) {
			// Extract the error message from the response if available
			if (error.message && typeof error.message === "string") {
				return thunkAPI.rejectWithValue(error.message);
			}
			return thunkAPI.rejectWithValue(
				"Failed to delete warehouse. Please try again."
			);
		}
	}
);

// Stock Movement Thunks
export const fetchStockMovements = createAsyncThunk(
	"inventory/fetchStockMovements",
	async (_, thunkAPI) => {
		try {
			const response = await apiClient.get<StockMovement[]>("/stock-movements");
			return response || [];
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to fetch stock movements"
			);
		}
	}
);

export const createStockMovement = createAsyncThunk(
	"inventory/createStockMovement",
	async (movement: Omit<StockMovement, "id">, thunkAPI) => {
		try {
			const response = await apiClient.post<StockMovement>(
				"/stock-movements",
				movement
			);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to create stock movement"
			);
		}
	}
);

// Manufacturing Order Thunks
export const fetchManufacturingOrders = createAsyncThunk(
	"inventory/fetchManufacturingOrders",
	async (_, thunkAPI) => {
		try {
			const response = await apiClient.get<ManufacturingOrder[]>(
				"/manufacturing-orders"
			);
			return response || [];
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to fetch manufacturing orders"
			);
		}
	}
);

export const createManufacturingOrder = createAsyncThunk(
	"inventory/createManufacturingOrder",
	async (order: Omit<ManufacturingOrder, "id">, thunkAPI) => {
		try {
			const response = await apiClient.post<ManufacturingOrder>(
				"/manufacturing-orders",
				order
			);
			return response;
		} catch (error: any) {
			// Extract the error message from the response if available
			if (error.message && typeof error.message === "string") {
				return thunkAPI.rejectWithValue(error.message);
			}
			return thunkAPI.rejectWithValue(
				"Failed to create manufacturing order. Please try again."
			);
		}
	}
);

export const updateManufacturingOrder = createAsyncThunk(
	"inventory/updateManufacturingOrder",
	async (order: ManufacturingOrder, thunkAPI) => {
		try {
			const response = await apiClient.put<ManufacturingOrder>(
				`/manufacturing-orders/${order.id}`,
				order
			);
			return response;
		} catch (error: any) {
			// Extract the error message from the response if available
			if (error.message && typeof error.message === "string") {
				return thunkAPI.rejectWithValue(error.message);
			}
			return thunkAPI.rejectWithValue(
				"Failed to update manufacturing order. Please try again."
			);
		}
	}
);

export const deleteManufacturingOrder = createAsyncThunk(
	"inventory/deleteManufacturingOrder",
	async (id: string, thunkAPI) => {
		try {
			await apiClient.delete(`/manufacturing-orders/${id}`);
			return id;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to delete manufacturing order"
			);
		}
	}
);

const inventorySlice = createSlice({
	name: "inventory",
	initialState,
	reducers: {
		resetLoading: (state) => {
			state.loading = false;
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.loading = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchInventory.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(
				fetchInventory.fulfilled,
				(state, action: PayloadAction<InventoryItem[] | undefined>) => {
					state.loading = false;
					state.items = action.payload ?? [];
					state.error = null;
				}
			)
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
		// Warehouse reducers
		builder
			.addCase(fetchWarehouses.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchWarehouses.fulfilled, (state, action) => {
				state.loading = false;
				state.warehouses = action.payload;
				state.error = null;
			})
			.addCase(fetchWarehouses.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(addWarehouse.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(addWarehouse.fulfilled, (state, action) => {
				state.loading = false;
				state.warehouses.push(action.payload);
				state.error = null;
			})
			.addCase(addWarehouse.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(updateWarehouse.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateWarehouse.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.warehouses.findIndex(
					(w) => w.id === action.payload.id
				);
				if (index !== -1) {
					state.warehouses[index] = action.payload;
				}
				state.error = null;
			})
			.addCase(updateWarehouse.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(deleteWarehouse.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(deleteWarehouse.fulfilled, (state, action) => {
				state.loading = false;
				state.warehouses = state.warehouses.filter(
					(w) => w.id !== action.payload
				);
				state.error = null;
			})
			.addCase(deleteWarehouse.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});

		// Stock Movement reducers
		builder
			.addCase(fetchStockMovements.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchStockMovements.fulfilled, (state, action) => {
				state.loading = false;
				state.stockMovements = action.payload ?? [];
				state.error = null;
			})
			.addCase(fetchStockMovements.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(createStockMovement.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(createStockMovement.fulfilled, (state, action) => {
				state.loading = false;
				state.stockMovements.push(action.payload);
				state.error = null;
			})
			.addCase(createStockMovement.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});

		// Manufacturing Order reducers
		builder
			.addCase(fetchManufacturingOrders.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchManufacturingOrders.fulfilled, (state, action) => {
				state.loading = false;
				state.manufacturingOrders = action.payload ?? [];
				state.error = null;
			})
			.addCase(fetchManufacturingOrders.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(createManufacturingOrder.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(createManufacturingOrder.fulfilled, (state, action) => {
				state.loading = false;
				state.manufacturingOrders.push(action.payload);
				state.error = null;
			})
			.addCase(createManufacturingOrder.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(updateManufacturingOrder.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateManufacturingOrder.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.manufacturingOrders.findIndex(
					(o) => o.id === action.payload.id
				);
				if (index !== -1) {
					state.manufacturingOrders[index] = action.payload;
				}
				state.error = null;
			})
			.addCase(updateManufacturingOrder.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(deleteManufacturingOrder.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(deleteManufacturingOrder.fulfilled, (state, action) => {
				state.loading = false;
				state.manufacturingOrders = state.manufacturingOrders.filter(
					(o) => o.id !== action.payload
				);
				state.error = null;
			})
			.addCase(deleteManufacturingOrder.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});
	},
});

export const { resetLoading, setLoading } = inventorySlice.actions;

// Export the actions, the reducer, and any extra logic you'd like
export default inventorySlice.reducer;
