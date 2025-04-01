// lib/slices/returnSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type {
    ReturnRequest,
    ReturnReason,
    ReturnType,
    ReturnRequestStatus,
    ItemCondition,
    ReturnDisposition,
    ReturnResolution
} from '@/lib/types';
import { apiClient } from "../api/apiClient/[...live]";

// --- Define State Interface ---
interface ReturnState {
    items: ReturnRequest[]; // For list views (role filtering handled by API/selectors)
    currentReturn: ReturnRequest | null; // For detail view
    loading: boolean; // Loading lists or single details
    updateLoading: boolean; // Loading updates or resolutions
    error: string | null;
    successMessage: string | null; // Optional: For success feedback
}

// --- Define Initial State ---
const initialState: ReturnState = {
    items: [],
    currentReturn: null,
    loading: false,
    updateLoading: false,
    error: null,
    successMessage: null,
};

// --- Define Thunk Input/Payload Types (Optional but helpful) ---
interface CreateReturnPayload {
    orderId: string;
    items: { orderItemId: string; quantity: number }[];
    returnReason: ReturnReason;
    reasonDetails?: string;
    preferredReturnType: ReturnType;
    proofImages?: string[];
}

interface UpdateReturnPayload {
    id: string;
    updateData: {
        status?: ReturnRequestStatus;
        staffComments?: string;
        itemsToUpdate?: {
            returnItemId: string;
            quantityReceived?: number;
            itemCondition?: ItemCondition;
            disposition?: ReturnDisposition;
            returnTrackingNumber?: string;
            shippingLabelUrl?: string;
        }[];
    };
}

interface ResolveReturnPayload {
    id: string;
    resolutionData: {
        resolutionType: ReturnType;
        notes?: string;
        refundAmount?: number; // Required if type is REFUND
        replacementItems?: { productId: string, quantity: number, price: number }[]; // Required if type is REPLACEMENT
        // Add fields for Store Credit/Exchange if needed
    };
}

// --- Async Thunks ---

// Fetch return requests (API handles role-based filtering)
export const fetchReturns = createAsyncThunk(
    "returns/fetchReturns",
    async (filters: { status?: string; orderId?: string; customerId?: string }, thunkAPI) => {
        try {
            // Pass filters as query params
            const response = await apiClient.get<ReturnRequest[]>("/returns", { params: filters });
            return response ?? []; // Handle null/undefined response
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.message || "Failed to fetch returns");
        }
    }
);

// Fetch a single return request by ID
export const fetchReturnById = createAsyncThunk(
    "returns/fetchReturnById",
    async (id: string, thunkAPI) => {
        try {
            const response = await apiClient.get<ReturnRequest>(`/returns/${id}`);
            return response ?? thunkAPI.rejectWithValue("Return request not found");
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.message || "Failed to fetch return details");
        }
    }
);

// Create a new return request
export const createReturnRequest = createAsyncThunk(
    "returns/createReturnRequest",
    async (returnData: CreateReturnPayload, thunkAPI) => {
        try {
            const response = await apiClient.post<ReturnRequest>("/returns", returnData);
            return response ?? thunkAPI.rejectWithValue("Invalid response from server");
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.message || "Failed to create return request");
        }
    }
);

// Update a return request (status, comments, item details)
export const updateReturnRequest = createAsyncThunk(
    "returns/updateReturnRequest",
    async ({ id, updateData }: UpdateReturnPayload, thunkAPI) => {
        try {
            const response = await apiClient.put<ReturnRequest>(`/returns/${id}`, updateData);
            return response ?? thunkAPI.rejectWithValue("Invalid response from server");
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.message || "Failed to update return request");
        }
    }
);

// Resolve a return request (final action)
export const resolveReturnRequest = createAsyncThunk(
    "returns/resolveReturnRequest",
    async ({ id, resolutionData }: ResolveReturnPayload, thunkAPI) => {
        try {
            // Use the dedicated resolve endpoint
            const response = await apiClient.post<ReturnRequest>(`/returns/${id}/resolve`, resolutionData);
            return response ?? thunkAPI.rejectWithValue("Invalid response from server");
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.message || "Failed to resolve return request");
        }
    }
);

// --- Slice Definition ---
const returnSlice = createSlice({
    name: "returns",
    initialState,
    reducers: {
        // Synchronous action to clear errors or messages
        clearReturnFeedback: (state) => {
            state.error = null;
            state.successMessage = null;
        },
        // Optionally set current return locally if needed without fetching
        setCurrentReturnLocal: (state, action: PayloadAction<ReturnRequest | null>) => {
            state.currentReturn = action.payload;
            state.error = null; // Clear error when setting a new one
        },
    },
    extraReducers: (builder) => {
        builder
            // --- Fetch Returns ---
            .addCase(fetchReturns.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReturns.fulfilled, (state, action: PayloadAction<ReturnRequest[]>) => {
                state.loading = false;
                state.items = action.payload || []; // Ensure array
            })
            .addCase(fetchReturns.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.items = []; // Clear on error
            })

            // --- Fetch Return By ID ---
            .addCase(fetchReturnById.pending, (state) => {
                state.loading = true;
                state.currentReturn = null; // Clear previous detail
                state.error = null;
            })
            .addCase(fetchReturnById.fulfilled, (state, action: PayloadAction<ReturnRequest>) => {
                state.loading = false;
                state.currentReturn = action.payload;
            })
            .addCase(fetchReturnById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.currentReturn = null;
            })

            // --- Create Return Request ---
            .addCase(createReturnRequest.pending, (state) => {
                state.updateLoading = true; // Use updateLoading for actions
                state.error = null;
                state.successMessage = null;
            })
            .addCase(createReturnRequest.fulfilled, (state, action: PayloadAction<ReturnRequest>) => {
                state.updateLoading = false;
                state.items.unshift(action.payload); // Add to the beginning of the list
                state.successMessage = `Return request #${action.payload.returnRequestNumber} submitted.`;
            })
            .addCase(createReturnRequest.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload as string;
            })

            // --- Update Return Request ---
            .addCase(updateReturnRequest.pending, (state) => {
                state.updateLoading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(updateReturnRequest.fulfilled, (state, action: PayloadAction<ReturnRequest>) => {
                state.updateLoading = false;
                const updatedReturn = action.payload;
                state.successMessage = `Return request #${updatedReturn.returnRequestNumber} updated.`;
                // Update in the main list
                const index = state.items.findIndex(item => item.id === updatedReturn.id);
                if (index !== -1) {
                    state.items[index] = updatedReturn;
                }
                // Update in the detail view if it's the current one
                if (state.currentReturn?.id === updatedReturn.id) {
                    state.currentReturn = updatedReturn;
                }
            })
            .addCase(updateReturnRequest.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload as string;
            })

             // --- Resolve Return Request ---
            .addCase(resolveReturnRequest.pending, (state) => {
                state.updateLoading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(resolveReturnRequest.fulfilled, (state, action: PayloadAction<ReturnRequest>) => {
                state.updateLoading = false;
                const resolvedReturn = action.payload;
                state.successMessage = `Return request #${resolvedReturn.returnRequestNumber} resolved.`;
                 // Update in the main list
                const index = state.items.findIndex(item => item.id === resolvedReturn.id);
                if (index !== -1) {
                    state.items[index] = resolvedReturn;
                }
                 // Update in the detail view if it's the current one
                if (state.currentReturn?.id === resolvedReturn.id) {
                    state.currentReturn = resolvedReturn;
                }
            })
            .addCase(resolveReturnRequest.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload as string;
            });
    },
});

// Export actions and reducer
export const { clearReturnFeedback, setCurrentReturnLocal } = returnSlice.actions;
export default returnSlice.reducer;