// src/lib/slices/order/order.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api/apiClient";
import { Order } from "@/lib/types";

interface OrderState {
	items: Order[];
	loading: boolean;
	error: string | null;
}

const initialState: OrderState = {
	items: [],
	loading: false,
	error: null,
};

export const fetchOrders = createAsyncThunk(
	"order/fetchOrders",
	async (_, thunkAPI) => {
		try {
			const response = await apiClient.get<Order[]>("/orders");
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to fetch orders"
			);
		}
	}
);

export const addOrder = createAsyncThunk(
	"order/addOrder",
	async (
		item: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">,
		thunkAPI
	) => {
		try {
			const response = await apiClient.post<Order>("/orders", item);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to add order item"
			);
		}
	}
);

export const updateOrder = createAsyncThunk(
	"order/updateOrder",
	async (item: Order, thunkAPI) => {
		try {
			const response = await apiClient.put<Order>(`/orders/${item.id}`, item);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to update order item"
			);
		}
	}
);

export const removeOrder = createAsyncThunk(
	"order/removeOrder",
	async (id: number, thunkAPI) => {
		try {
			await apiClient.delete(`/orders/${id}`);
			return id;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to remove order item"
			);
		}
	}
);
const orderSlice = createSlice({
	name: "order",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchOrders.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchOrders.fulfilled, (state, action) => {
				state.loading = false;
				state.items = action.payload;
			})
			.addCase(fetchOrders.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(addOrder.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(addOrder.fulfilled, (state, action) => {
				state.loading = false;
				state.items.push(action.payload);
			})
			.addCase(addOrder.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(updateOrder.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateOrder.fulfilled, (state, action) => {
				state.loading = false;
				const updatedItem = action.payload;
				const index = state.items.findIndex(
					(item) => item.id === updatedItem.id
				);
				if (index !== -1) {
					state.items[index] = updatedItem;
				}
			})
			.addCase(updateOrder.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(removeOrder.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(removeOrder.fulfilled, (state, action) => {
				state.loading = false;
				state.items = state.items.filter((item) => item.id !== action.payload);
			})
			.addCase(removeOrder.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});
	},
});

export default orderSlice.reducer;
