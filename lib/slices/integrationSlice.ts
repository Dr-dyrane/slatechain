import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "../api/apiClient/[...live]";

export type IntegrationCategory = "ecommerce" | "erp_crm" | "iot" | "bi_tools";

interface IntegrationDetails {
	enabled: boolean;
	service: string | null;
	apiKey?: string | null;
	storeUrl?: string | null;
}

export interface IntegrationState {
	ecommerce: IntegrationDetails;
	erp_crm: IntegrationDetails;
	iot: IntegrationDetails;
	bi_tools: IntegrationDetails;
	loading: boolean;
	error: string | null;
}

const initialState: IntegrationState = {
	ecommerce: { enabled: false, service: null },
	erp_crm: { enabled: false, service: null },
	iot: { enabled: false, service: null },
	bi_tools: { enabled: false, service: null },
	loading: false,
	error: null,
};

// Define API response interfaces
interface IntegrationResponse {
  success: boolean;
  integration: IntegrationDetails;
  message: string;
}

// **Thunk: Update Integration**
export const setIntegration = createAsyncThunk<
	{ category: IntegrationCategory; integration: IntegrationDetails },
	{
		category: IntegrationCategory;
		service: string;
		apiKey?: string;
		storeUrl?: string;
	},
	{ rejectValue: string }
>(
	"integration/updateIntegration",
	async ({ category, service, apiKey, storeUrl }, { rejectWithValue }) => {
		try {
			const payload = {
				service,
				enabled: true,
				apiKey,
				...(storeUrl ? { storeUrl } : {}),
			};

			const response = await apiClient.put<IntegrationResponse>(
				`/integrations/${category}`,
				payload
			);
			return { category, integration: response.integration }; // Ensure you use response.data
		} catch (error: any) {
			return rejectWithValue(error.message || `Failed to update ${category} integration`);
		}
	}
);

// **Thunk: Toggle Integration Status**
export const toggleIntegration = createAsyncThunk<
	{ category: IntegrationCategory; integration: IntegrationDetails },
	{ category: IntegrationCategory; enabled: boolean },
	{ rejectValue: string; state: { integration: IntegrationState } }
>(
	"integration/toggleStatus",
	async ({ category, enabled }, { rejectWithValue, getState }) => {
		try {
			const state = getState();
			const currentIntegration = state.integration[category];

			if (!currentIntegration.service) {
				return rejectWithValue("No service selected for this integration");
			}

			const payload = {
				...currentIntegration,
				enabled,
			};

			const response = await apiClient.put<IntegrationResponse>(
				`/integrations/${category}`,
				payload
			);
			return { category, integration: response.integration };
		} catch (error: any) {
			return rejectWithValue(error.message || `Failed to toggle ${category} integration`);
		}
	}
);

// **Slice**
const integrationSlice = createSlice({
	name: "integration",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			// **Handle setIntegration Thunk**
			.addCase(setIntegration.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(setIntegration.fulfilled, (state, action) => {
				const { category, integration } = action.payload;
				state[category] = integration;
				state.loading = false;
			})
			.addCase(setIntegration.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload || "Failed to update integration";
			})

			// **Handle toggleIntegration Thunk**
			.addCase(toggleIntegration.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(toggleIntegration.fulfilled, (state, action) => {
				const { category, integration } = action.payload;
				state[category] = integration;
				state.loading = false;
			})
			.addCase(toggleIntegration.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload || "Failed to toggle integration status";
			});
	},
});

export default integrationSlice.reducer;
