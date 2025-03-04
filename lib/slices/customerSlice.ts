import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../api/apiClient/[...live]";

// Define types for the customer dashboard data
interface MarketTrends {
	areaChartData: {
		title: string;
		data: any[];
		xAxisKey: string;
		yAxisKey: string;
		upperKey: string;
		lowerKey: string;
	};
}

interface RecommendedProducts {
	recommendedProducts: any[];
	frequentlyPurchased: any[];
	newArrivals: any[];
}

interface OrderSummary {
	totalOrders: number;
	totalSpent: number;
	ordersByStatus: {
		PENDING: number;
		PROCESSING: number;
		SHIPPED: number;
		DELIVERED: number;
		CANCELLED: number;
	};
	monthlySpending: Array<{
		month: string;
		amount: number;
	}>;
	activeOrders: number;
}

// Define the state interface
interface CustomerState {
	marketTrends: MarketTrends | null;
	recommendedProducts: RecommendedProducts | null;
	orderSummary: OrderSummary | null;
	loading: {
		marketTrends: boolean;
		recommendedProducts: boolean;
		orderSummary: boolean;
	};
	error: {
		marketTrends: string | null;
		recommendedProducts: string | null;
		orderSummary: string | null;
	};
}

// Initial state
const initialState: CustomerState = {
	marketTrends: null,
	recommendedProducts: null,
	orderSummary: null,
	loading: {
		marketTrends: false,
		recommendedProducts: false,
		orderSummary: false,
	},
	error: {
		marketTrends: null,
		recommendedProducts: null,
		orderSummary: null,
	},
};

// Thunks for fetching customer data
export const fetchMarketTrends = createAsyncThunk(
	"customer/fetchMarketTrends",
	async (params: { category?: string; months?: number } = {}, thunkAPI) => {
		try {
			const queryParams = new URLSearchParams();
			if (params.category) queryParams.append("category", params.category);
			if (params.months) queryParams.append("months", params.months.toString());

			const response = await apiClient.get<MarketTrends>(
				`/customer/market-trends?${queryParams.toString()}`
			);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to fetch market trends"
			);
		}
	}
);

export const fetchRecommendedProducts = createAsyncThunk(
	"customer/fetchRecommendedProducts",
	async (_, thunkAPI) => {
		try {
			const response = await apiClient.get<RecommendedProducts>(
				"/customer/recommended-products"
			);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to fetch recommended products"
			);
		}
	}
);

export const fetchOrderSummary = createAsyncThunk(
	"customer/fetchOrderSummary",
	async (_, thunkAPI) => {
		try {
			const response = await apiClient.get<OrderSummary>(
				"/customer/order-summary"
			);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to fetch order summary"
			);
		}
	}
);

// Create the slice
const customerSlice = createSlice({
	name: "customer",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		// Market Trends
		builder
			.addCase(fetchMarketTrends.pending, (state) => {
				state.loading.marketTrends = true;
				state.error.marketTrends = null;
			})
			.addCase(fetchMarketTrends.fulfilled, (state, action) => {
				state.loading.marketTrends = false;
				state.marketTrends = action.payload;
			})
			.addCase(fetchMarketTrends.rejected, (state, action) => {
				state.loading.marketTrends = false;
				state.error.marketTrends = action.payload as string;
			});

		// Recommended Products
		builder
			.addCase(fetchRecommendedProducts.pending, (state) => {
				state.loading.recommendedProducts = true;
				state.error.recommendedProducts = null;
			})
			.addCase(fetchRecommendedProducts.fulfilled, (state, action) => {
				state.loading.recommendedProducts = false;
				state.recommendedProducts = action.payload;
			})
			.addCase(fetchRecommendedProducts.rejected, (state, action) => {
				state.loading.recommendedProducts = false;
				state.error.recommendedProducts = action.payload as string;
			});

		// Order Summary
		builder
			.addCase(fetchOrderSummary.pending, (state) => {
				state.loading.orderSummary = true;
				state.error.orderSummary = null;
			})
			.addCase(fetchOrderSummary.fulfilled, (state, action) => {
				state.loading.orderSummary = false;
				state.orderSummary = action.payload;
			})
			.addCase(fetchOrderSummary.rejected, (state, action) => {
				state.loading.orderSummary = false;
				state.error.orderSummary = action.payload as string;
			});
	},
});

export default customerSlice.reducer;
