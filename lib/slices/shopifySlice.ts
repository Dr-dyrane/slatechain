// src/lib/slices/shopifySlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api/apiClient"; // Make sure this is correctly set up
import { ShopifyOrder, ShopifyState, ShopifyShop } from "@/lib/types"; // Correct import
import { set } from "date-fns";

// Define the async thunk for fetching Shopify orders
export const fetchShopifyOrders = createAsyncThunk<
    ShopifyOrder[], // Return type
    void,           // Args type (none in this case)
    { rejectValue: string } // Typescript config
>("shopify/fetchShopifyOrders", async (_, thunkAPI) => {
    try {
        const response = await apiClient.get<ShopifyOrder[]>("/shopify/orders");
        return response;
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.message || "Failed to fetch Shopify orders");
    }
});

// Define the async thunk for fetching Shopify shop details
export const fetchShopifyShop = createAsyncThunk<
    ShopifyShop, // Return type
    void,           // Args type (none in this case)
    { rejectValue: string } // Typescript config
>("shopify/fetchShopifyShop", async (_, thunkAPI) => {
    try {
        const response = await apiClient.get<ShopifyShop>("/shopify/shop");
        return response;
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.message || "Failed to fetch Shopify shop details");
    }
});

// Define the initial state - ENSURE DATA FOR ALL STATE
const initialState: ShopifyState = {
    shop: {
        id: 0,
        name: "",
        email: "",
        domain: "",
      },
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
                    const price = parseFloat(order.total_price); // Ensure parsing as float
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
export const { setApiKey, setStoreUrl, setIntegrationEnabled } = shopifySlice.actions;

// Export the reducer
export default shopifySlice.reducer;