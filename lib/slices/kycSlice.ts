import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchKYCStatus, updateKYCStatus } from "@/lib/api/kyc";
import { KYCStatus } from "@/lib/types/user";

interface KYCState extends KYCStatus {
  error: string | null;
  isLoading: boolean;
}

const initialState: KYCState = {
  status: "PENDING",
  documents: {},
  error: null,
  isLoading: false,
};

export const fetchKYC = createAsyncThunk<
  KYCStatus,
  string,
  { rejectValue: string }
>(
  "kyc/fetchKYC",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetchKYCStatus(userId);
      return response;
    } catch (error: any) {
      return rejectWithValue("Failed to fetch KYC status.");
    }
  }
);

export const updateKYC = createAsyncThunk<
  KYCStatus,
  { userId: string; documents: { [key: string]: string } },
  { rejectValue: string }
>(
  "kyc/updateKYC",
  async (kycData, { rejectWithValue }) => {
    try {
      const response = await updateKYCStatus(kycData.userId, kycData.documents);
      return response;
    } catch (error: any) {
      return rejectWithValue("Failed to update KYC.");
    }
  }
);

const kycSlice = createSlice({
  name: "kyc",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKYC.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchKYC.fulfilled, (state, action: PayloadAction<KYCStatus>) => {
        state.status = action.payload.status;
        state.documents = action.payload.documents;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchKYC.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to fetch KYC status.";
      })
      .addCase(updateKYC.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateKYC.fulfilled, (state, action: PayloadAction<KYCStatus>) => {
        state.status = action.payload.status;
        state.documents = action.payload.documents;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updateKYC.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to update KYC.";
      });
  },
});

export const { clearError } = kycSlice.actions;
export default kycSlice.reducer;

