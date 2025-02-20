// src/lib/slices/kpi/kpiSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api/apiClient";
import { LucideIcon } from "lucide-react";
import { AreaChartData, DemandForecast, DemandPlanningKPIs } from "@/lib/types";

// Dashboard card Data
export interface CardData {
	title: string;
	icon: string | null;
	value: string;
	description: string;
	type: "revenue" | "number" | "orders" | "demand";
	sparklineData: number[] | null;
}

export interface OtherChartData {
	title: string;
	icon: string | null;
	type: "progress" | "donut";
	progress?: number;
	description?: string;
	label?: string;
	donutData?: number[];
	donutLabels?: string[];
	colors?: string[];
}


interface KPIState {
	cardData: CardData[] | null;
	otherChartData: OtherChartData[] | null;
	demandPlanningKPIs: DemandPlanningKPIs | null;
	demandForecasts: DemandForecast[] | null;
	areaChartData: AreaChartData | null; // NEW: Area Chart Data
	loading: boolean;
	error: string | null;
}

const initialState: KPIState = {
	cardData: null,
	otherChartData: null,
	demandPlanningKPIs: null,
	demandForecasts: null,
	areaChartData: null,
	loading: false,
	error: null,
};

export const fetchKPIs = createAsyncThunk<
	{ cardData: CardData[]; otherChartData: OtherChartData[] },
	void,
	{ rejectValue: string }
>("kpi/fetchKPIs", async (_, thunkAPI) => {
	try {
		const response = await apiClient.get<{
			cardData: CardData[];
			otherChartData: OtherChartData[];
		}>("/kpis");
		return response;
	} catch (error: any) {
		return thunkAPI.rejectWithValue(error.message || "Failed to fetch kpis");
	}
});

export const fetchDemandPlanningData = createAsyncThunk<
	{ demandPlanningKPIs: DemandPlanningKPIs; demandForecasts: DemandForecast[] },
	void,
	{ rejectValue: string }
>("kpi/fetchDemandPlanningData", async (_, thunkAPI) => {
	try {
		const response = await apiClient.get<{
			demandPlanningKPIs: DemandPlanningKPIs;
			demandForecasts: DemandForecast[];
		}>("/demand-planning");
		return response;
	} catch (error: any) {
		return thunkAPI.rejectWithValue(
			error.message || "Failed to fetch demand planning data"
		);
	}
});

export const fetchAreaChartData = createAsyncThunk<
	{ areaChartData: AreaChartData },
	void,
	{ rejectValue: string }
>("kpi/fetchAreaChartData", async (_, thunkAPI) => {
	try {
		const response = await apiClient.get<{ areaChartData: AreaChartData }>(
			"/area-chart"
		);
		return response;
	} catch (error: any) {
		return thunkAPI.rejectWithValue(
			error.message || "Failed to fetch area chart data"
		);
	}
});

const kpiSlice = createSlice({
	name: "kpi",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchKPIs.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchKPIs.fulfilled, (state, action) => {
				state.loading = false;
				state.cardData = action.payload.cardData;
				state.otherChartData = action.payload.otherChartData;
			})
			.addCase(fetchKPIs.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(fetchDemandPlanningData.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchDemandPlanningData.fulfilled, (state, action) => {
				state.loading = false;
				state.demandPlanningKPIs = action.payload.demandPlanningKPIs;
				state.demandForecasts = action.payload.demandForecasts;
			})
			.addCase(fetchDemandPlanningData.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(fetchAreaChartData.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchAreaChartData.fulfilled, (state, action) => {
				state.loading = false;
				state.areaChartData = action.payload.areaChartData;
			})
			.addCase(fetchAreaChartData.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});
	},
});

export default kpiSlice.reducer;