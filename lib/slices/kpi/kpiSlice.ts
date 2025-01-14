// src/lib/slices/kpi/kpiSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api/apiClient";
import { LucideIcon } from "lucide-react";

// Dashboard card Data
export interface CardData {
    title: string;
    icon:  string | null;
    value: string;
    description: string;
    type: "revenue" | "number" | "orders";
    sparklineData: number[] | null;
}

export interface OtherChartData {
    title: string;
    icon:  string | null;
    type: "progress" | "donut";
    progress?: number;
    label?: string;
    donutData?: number[];
    donutLabels?: string[];
   colors?: string[]
}

interface KPIState {
    cardData: CardData[] | null;
    otherChartData: OtherChartData[] | null;
    loading: boolean;
    error: string | null;
}

const initialState: KPIState = {
    cardData: null,
    otherChartData: null,
    loading: false,
    error: null,
};

export const fetchKPIs = createAsyncThunk<
    { cardData: CardData[]; otherChartData: OtherChartData[] },
    void,
    { rejectValue: string }
>("kpi/fetchKPIs", async (_, thunkAPI) => {
    try {
        const response = await apiClient.get<{ cardData: CardData[]; otherChartData: OtherChartData[] }>("/kpis");
        return response;
    } catch (error: any) {
        return thunkAPI.rejectWithValue(
            error.message || "Failed to fetch kpis"
        );
    }
}
);

const kpiSlice = createSlice({
    name: "kpi",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchKPIs.pending, (state) => {
                state.loading = true;
                state.error = null
            })
            .addCase(fetchKPIs.fulfilled, (state, action) => {
                state.loading = false;
                state.cardData = action.payload.cardData
                state.otherChartData = action.payload.otherChartData
            })
            .addCase(fetchKPIs.rejected, (state, action) => {
                 state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default kpiSlice.reducer;