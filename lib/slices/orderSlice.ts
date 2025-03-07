// lib/slices/orderSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Order } from "@/lib/types";
import { apiClient } from "../api/apiClient/[...live]";


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
			return response ?? []; // Handle null/undefined responses
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error?.message || "Failed to fetch orders"
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
			return (
				response ?? thunkAPI.rejectWithValue("Invalid response from server")
			);
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error?.message || "Failed to add order item"
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
			return (
				response ?? thunkAPI.rejectWithValue("Invalid response from server")
			);
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error?.message || "Failed to update order item"
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
				error?.message || "Failed to remove order item"
			);
		}
	}
);

// Process payment
export const markOrderAsPaidAsync = createAsyncThunk(
	"order/markOrderAsPaid",
	async ({ id, method }: { id: string; method: string }, thunkAPI) => {
		try {
			const response = await apiClient.post<Order>(`/orders/${id}/payment`, {
				method,
			});
			return (
				response ?? thunkAPI.rejectWithValue("Invalid response from server")
			);
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error?.message || "Payment processing failed"
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
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchOrders.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchOrders.fulfilled, (state, action) => {
				state.loading = false;
				state.items = action.payload || []; // Ensuring no null/undefined
			})
			.addCase(fetchOrders.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
				state.items = []; // Reset orders to prevent stale data
			})

			.addCase(addOrder.fulfilled, (state, action) => {
				if (action.payload) {
					state.items.push(action.payload);
				}
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
			})

			.addCase(markOrderAsPaidAsync.pending, (state) => {
				state.paymentLoading = true;
				state.error = null;
			})
			.addCase(markOrderAsPaidAsync.fulfilled, (state, action) => {
				state.paymentLoading = false;
				const index = state.items.findIndex(
					(order) => order.id === action.payload.id
				);
				if (index !== -1) {
					state.items[index].paid = true;
					state.items[index].status = "PROCESSING"; // Move to processing
				}
			})
			.addCase(markOrderAsPaidAsync.rejected, (state, action) => {
				state.paymentLoading = false;
				state.error = action.payload as string;
			});
	},
});

export const { updateOrderState } = orderSlice.actions;
export default orderSlice.reducer;
