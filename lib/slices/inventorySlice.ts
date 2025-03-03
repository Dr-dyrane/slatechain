// src/lib/slices/inventorySlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type {
	InventoryItem,
	InventoryState,
	ManufacturingOrder,
	StockMovement,
	Warehouse,
} from "@/lib/types";
import { apiClient } from "@/lib/api/apiClient";

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
			const response = await apiClient.get<InventoryItem[]>("/inventory");
			return response || [];
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
			return thunkAPI.rejectWithValue(
				error.message || "Failed to add warehouse"
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
			return thunkAPI.rejectWithValue(
				error.message || "Failed to update warehouse"
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
			return thunkAPI.rejectWithValue(
				error.message || "Failed to delete warehouse"
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
			return thunkAPI.rejectWithValue(
				error.message || "Failed to create manufacturing order"
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
			return thunkAPI.rejectWithValue(
				error.message || "Failed to update manufacturing order"
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
			.addCase(addWarehouse.fulfilled, (state, action) => {
				state.warehouses.push(action.payload);
			})
			.addCase(updateWarehouse.fulfilled, (state, action) => {
				const index = state.warehouses.findIndex(
					(w) => w.id === action.payload.id
				);
				if (index !== -1) {
					state.warehouses[index] = action.payload;
				}
			})
			.addCase(deleteWarehouse.fulfilled, (state, action) => {
				state.warehouses = state.warehouses.filter(
					(w) => w.id !== action.payload
				);
			});

		// Stock Movement reducers
		builder
			.addCase(fetchStockMovements.fulfilled, (state, action) => {
				state.stockMovements = action.payload ?? [];
			})
			.addCase(createStockMovement.fulfilled, (state, action) => {
				state.stockMovements.push(action.payload);
			});

		// Manufacturing Order reducers
		builder
			.addCase(fetchManufacturingOrders.fulfilled, (state, action) => {
				state.manufacturingOrders = action.payload ?? [];
			})
			.addCase(createManufacturingOrder.fulfilled, (state, action) => {
				state.manufacturingOrders.push(action.payload);
			})
			.addCase(updateManufacturingOrder.fulfilled, (state, action) => {
				const index = state.manufacturingOrders.findIndex(
					(o) => o.id === action.payload.id
				);
				if (index !== -1) {
					state.manufacturingOrders[index] = action.payload;
				}
			})
			.addCase(deleteManufacturingOrder.fulfilled, (state, action) => {
				state.manufacturingOrders = state.manufacturingOrders.filter(
					(o) => o.id !== action.payload
				);
			});
	},
});

export const { resetLoading, setLoading } = inventorySlice.actions;

// Export the actions, the reducer, and any extra logic you'd like
export default inventorySlice.reducer;
