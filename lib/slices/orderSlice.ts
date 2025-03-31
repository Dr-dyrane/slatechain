// lib/slices/orderSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Order } from "@/lib/types";
import { apiClient } from "../api/apiClient/[...live]";
import { processPayment } from "../api/payment";

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
			// Generate a temporary order number if not provided
			const orderNumber = `ORD${String(Date.now()).slice(-5).padStart(5, "0")}`;

			// Ensure we're sending the exact fields the backend expects
			const orderPayload = {
				customerId: order.customerId,
				orderNumber: orderNumber, 
				items: order.items.map((item) => ({
					productId: item.productId,
					quantity: item.quantity,
					price: item.price,
				})),
				totalAmount: order.totalAmount,
				status: order.status,
				paid: order.paid,
				// Note: createdBy will be set by the backend from the authenticated user
			};

			console.log("Sending order payload:", orderPayload);
			const response = await apiClient.post<Order>("/orders", orderPayload);
			return (
				response ?? thunkAPI.rejectWithValue("Invalid response from server")
			);
		} catch (error: any) {
			console.error("Error in addOrder:", error);
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
	async (
		{
			id,
			method,
			paymentDetails,
		}: { id: string; method: string; paymentDetails?: any },
		thunkAPI
	) => {
		try {
			// Use the processPayment function to handle the API call
			const response = await processPayment(
				id,
				method as any,
				paymentDetails,
				paymentDetails?.clientSecret
			);

			return (
				response ?? thunkAPI.rejectWithValue("Invalid response from server")
			);
		} catch (error: any) {
			console.error("Payment processing error:", error);
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
		// Reset payment loading and error states
		resetPaymentState: (state) => {
			state.paymentLoading = false;
			state.error = null;
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

			.addCase(addOrder.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(addOrder.fulfilled, (state, action) => {
				state.loading = false;
				if (action.payload) {
					state.items.push(action.payload);
				}
			})
			.addCase(addOrder.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
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
					(order) => order.id === action.payload.order.id
				);
				if (index !== -1) {
					state.items[index].paid = true;
					state.items[index].status = "PROCESSING"; // Move to processing
					state.items[index].paymentMethod = action.payload.order.paymentMethod;
					state.items[index].paymentDetails =
						action.payload.order.paymentDetails;
				}
			})
			.addCase(markOrderAsPaidAsync.rejected, (state, action) => {
				state.paymentLoading = false;
				state.error = action.payload as string;
			});
	},
});

export const { updateOrderState, resetPaymentState } = orderSlice.actions;
export default orderSlice.reducer;
