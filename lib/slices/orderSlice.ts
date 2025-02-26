// lib/slices/orderSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Order } from "@/lib/types";
import { apiClient } from "../api/apiClient";

interface OrderState {
	items: Order[];
	loading: boolean;
	updateLoading: boolean;
	paymentLoading: boolean;
	error: string | null;
}

const initialState: OrderState = {
	items: [],
	loading: false,
	updateLoading: false,
	paymentLoading: false,
	error: null,
};

// Fetch orders
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

// Add order
export const addOrder = createAsyncThunk(
	"order/addOrder",
	async (
		order: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">,
		thunkAPI
	) => {
		try {
			const response = await apiClient.post<Order>("/orders", order);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to add order item"
			);
		}
	}
);

// Update order
export const updateOrder = createAsyncThunk(
	"order/updateOrder",
	async (order: Order, thunkAPI) => {
		try {
			const response = await apiClient.put<Order>(`/orders/${order.id}`, order);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to update order item"
			);
		}
	}
);

// Delete order
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
	reducers: {
		// Manual update for order status (for UI actions)
		updateOrderState: (state, action) => {
			const index = state.items.findIndex(
				(order) => order.id === action.payload.id
			);
			if (index !== -1) {
				state.items[index] = action.payload;
			}
		},
		// Mark an order as paid
		markOrderAsPaid: (state, action) => {
			state.paymentLoading = true;
			const order = state.items.find((order) => order.id === action.payload);
			if (order) {
				order.status = "PROCESSING"; // Move to processing after payment
				order.paid = true;
			}
			state.paymentLoading = false;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchOrders.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchOrders.fulfilled, (state, action) => {
				state.loading = false;
				state.items = action.payload ?? [];
			})
			.addCase(fetchOrders.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(addOrder.fulfilled, (state, action) => {
				state.items.push(action.payload);
			})
			.addCase(updateOrder.pending, (state) => {
				state.updateLoading = true;
				state.error = null;
			})
			.addCase(updateOrder.fulfilled, (state, action) => {
				state.updateLoading = false;
				const index = state.items.findIndex(
					(order) => order.id === action.payload.id
				);
				if (index !== -1) {
					state.items[index] = action.payload;
				}
			})
			.addCase(updateOrder.rejected, (state, action) => {
				state.updateLoading = false;
				state.error = action.payload as string;
			})
			.addCase(removeOrder.fulfilled, (state, action) => {
				state.items = state.items.filter(
					(order) => order.id !== action.payload
				);
			});
	},
});

export const { updateOrderState, markOrderAsPaid } = orderSlice.actions;
export default orderSlice.reducer;
