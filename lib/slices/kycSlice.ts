import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { KYCState, KYCStatus, KYCSubmissionRequest, KYCDocument } from '@/lib/types';
import { fetchKYCStatus, startKYCProcess, uploadKYCDocument, submitKYCData } from '@/lib/api/kyc';

const initialState: KYCState = {
  status: KYCStatus.NOT_STARTED,
  documents: [],
  loading: false,
  error: null,
};

export const fetchKYCStatusThunk = createAsyncThunk<
  { status: KYCStatus; documents: KYCDocument[] },
  void,
  { rejectValue: string }
>('kyc/fetchStatus', async (_, { rejectWithValue }) => {
  try {
    return await fetchKYCStatus();
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

export const startKYCProcessThunk = createAsyncThunk<
  KYCStatus,
  void,
  { rejectValue: string }
>('kyc/start', async (_, { rejectWithValue }) => {
  try {
    return await startKYCProcess();
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

export const uploadDocumentThunk = createAsyncThunk<
  KYCDocument,
  { documentType: string; file: File },
  { rejectValue: string }
>('kyc/uploadDocument', async ({ documentType, file }, { rejectWithValue }) => {
  try {
    return await uploadKYCDocument(documentType, file);
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

export const submitKYCDataThunk = createAsyncThunk<
  { status: KYCStatus; referenceId: string },
  KYCSubmissionRequest,
  { rejectValue: string }
>('kyc/submit', async (kycData, { rejectWithValue }) => {
  try {
    return await submitKYCData(kycData);
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKYCStatusThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKYCStatusThunk.fulfilled, (state, action) => {
        state.status = action.payload.status;
        state.documents = action.payload.documents;
        state.loading = false;
      })
      .addCase(fetchKYCStatusThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch KYC status';
      })
      .addCase(startKYCProcessThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startKYCProcessThunk.fulfilled, (state, action) => {
        state.status = action.payload;
        state.loading = false;
      })
      .addCase(startKYCProcessThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to start KYC process';
      })
      .addCase(uploadDocumentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadDocumentThunk.fulfilled, (state, action) => {
        state.documents.push(action.payload);
        state.loading = false;
      })
      .addCase(uploadDocumentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to upload document';
      })
      .addCase(submitKYCDataThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitKYCDataThunk.fulfilled, (state, action) => {
        state.status = action.payload.status;
        state.loading = false;
      })
      .addCase(submitKYCDataThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to submit KYC data';
      });
  },
});

export const { clearError } = kycSlice.actions;
export default kycSlice.reducer;

