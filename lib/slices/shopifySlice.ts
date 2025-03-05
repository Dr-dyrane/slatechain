// src/lib/slices/shopifySlice.ts
import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from "@reduxjs/toolkit";

import type { ShopifyOrder, ShopifyState, ShopifyShop } from "@/lib/types"; // Correct import
import { apiClient } from "../api/apiClient/[...live]";

// Define API response interfaces
interface ShopifyOrdersResponse {
	success: boolean;
	orders: ShopifyOrder[];
	message?: string;
}

interface ShopifyShopResponse {
	success: boolean;
	shop: ShopifyShop;
	message?: string;
}

// Define the async thunk for fetching Shopify orders
export const fetchShopifyOrders = createAsyncThunk<
	ShopifyOrder[], // Return type
	void, // Args type (none in this case)
	{ rejectValue: string } // Typescript config
>("shopify/fetchShopifyOrders", async (_, thunkAPI) => {
	try {
		const response = await apiClient.get<ShopifyOrdersResponse>(
			"/shopify/orders"
		);
		return response.orders;
	} catch (error: any) {
		return thunkAPI.rejectWithValue(
			error.message || "Failed to fetch Shopify orders"
		);
	}
});

// Define the async thunk for fetching Shopify shop details
export const fetchShopifyShop = createAsyncThunk<
	ShopifyShop, // Return type
	void, // Args type (none in this case)
	{ rejectValue: string } // Typescript config
>("shopify/fetchShopifyShop", async (_, thunkAPI) => {
	try {
		const response =
			await apiClient.get<ShopifyShopResponse>("/shopify/shop");
		return response.shop;
	} catch (error: any) {
		return thunkAPI.rejectWithValue(
			error.message || "Failed to fetch Shopify shop details"
		);
	}
});

// Define the initial state
const initialState: ShopifyState = {
	shop: null,
	orders: [],
	totalRevenue: 0,
	loading: false,
	error: null,
	apiKey: null,
	storeUrl: null,
	integrationEnabled: false,
};

// Create the slice
const shopifySlice = createSlice({
	name: "shopify",
	initialState,
	reducers: {
		setApiKey: (state, action: PayloadAction<string | null>) => {
			state.apiKey = action.payload;
		},
		setStoreUrl: (state, action: PayloadAction<string | null>) => {
			state.storeUrl = action.payload;
		},
		setIntegrationEnabled: (state, action: PayloadAction<boolean>) => {
			state.integrationEnabled = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchShopifyOrders.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchShopifyOrders.fulfilled, (state, action) => {
				state.loading = false;
				state.orders = action.payload;
				// Calculate total revenue here instead of in the component
				state.totalRevenue = action.payload.reduce((total, order) => {
					const price = Number.parseFloat(order.total_price); // Ensure parsing as float
					return total + (isNaN(price) ? 0 : price); // Safely add to total
				}, 0);
			})
			.addCase(fetchShopifyOrders.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload || "Failed to fetch Shopify orders";
			})
			.addCase(fetchShopifyShop.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchShopifyShop.fulfilled, (state, action) => {
				state.loading = false;
				state.shop = action.payload;
			})
			.addCase(fetchShopifyShop.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload || "Failed to fetch Shopify shop details";
			});
	},
});

// Export the actions
export const { setApiKey, setStoreUrl, setIntegrationEnabled } =
	shopifySlice.actions;

// Export the reducer
export default shopifySlice.reducer;
