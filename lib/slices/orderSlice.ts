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
			const order = state.items.find((order) => order.id === action.payload);
			if (order) {
				order.status = "PROCESSING"; // Move to processing after payment
				order.paid = true;
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
				state.items = action.payload;
			})
			.addCase(fetchOrders.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(addOrder.fulfilled, (state, action) => {
				state.items.push(action.payload);
			})
			.addCase(updateOrder.fulfilled, (state, action) => {
				const index = state.items.findIndex(
					(order) => order.id === action.payload.id
				);
				if (index !== -1) {
					state.items[index] = action.payload;
				}
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
