import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
	type KYCState,
	KYCStatus,
	type KYCSubmissionRequest,
	type KYCDocument,
} from "@/lib/types";
import {
	fetchKYCStatus,
	startKYCProcess,
	uploadKYCDocument,
	submitKYCData,
	getKYCDocument,
	deleteKYCDocument,
	verifyKYCSubmission,
	listPendingKYCSubmissions,
} from "@/lib/api/kyc";
import { IKYCSubmission } from "@/app/api/models/KYCSubmission";

// Extended KYC state to include admin submissions
interface ExtendedKYCState extends KYCState {
	submissions?: IKYCSubmission[];
}

const initialState: ExtendedKYCState = {
	status: KYCStatus.NOT_STARTED,
	documents: [],
	submissions: [],
	loading: false,
	error: null,
};

// Existing thunks
export const fetchKYCStatusThunk = createAsyncThunk<
	{ status: KYCStatus; documents: KYCDocument[] },
	void,
	{ rejectValue: string }
>("kyc/fetchStatus", async (_, { rejectWithValue }) => {
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
>("kyc/start", async (_, { rejectWithValue }) => {
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
>("kyc/uploadDocument", async ({ documentType, file }, { rejectWithValue }) => {
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
>("kyc/submit", async (kycData, { rejectWithValue }) => {
	try {
		return await submitKYCData(kycData);
	} catch (error) {
		return rejectWithValue((error as Error).message);
	}
});

// New document thunks
export const getKYCDocumentThunk = createAsyncThunk<
	KYCDocument,
	string,
	{ rejectValue: string }
>("kyc/getDocument", async (documentId, { rejectWithValue }) => {
	try {
		return await getKYCDocument(documentId);
	} catch (error) {
		return rejectWithValue((error as Error).message);
	}
});

export const deleteKYCDocumentThunk = createAsyncThunk<
	{ success: boolean },
	string,
	{ rejectValue: string }
>("kyc/deleteDocument", async (documentId, { rejectWithValue }) => {
	try {
		return await deleteKYCDocument(documentId);
	} catch (error) {
		return rejectWithValue((error as Error).message);
	}
});

// Admin thunks
export const verifyKYCSubmissionThunk = createAsyncThunk<
	{ success: boolean },
	{
		submissionId: string;
		status: "APPROVED" | "REJECTED";
		rejectionReason?: string;
	},
	{ rejectValue: string }
>(
	"kyc/verifySubmission",
	async ({ submissionId, status, rejectionReason }, { rejectWithValue }) => {
		try {
			return await verifyKYCSubmission(submissionId, status, rejectionReason);
		} catch (error) {
			return rejectWithValue((error as Error).message);
		}
	}
);

export const listPendingKYCSubmissionsThunk = createAsyncThunk<
	IKYCSubmission[], // Return type is now IKYCSubmission[]
	void,
	{ rejectValue: string }
>("kyc/listPendingSubmissions", async (_, { rejectWithValue }) => {
	try {
		const response = await listPendingKYCSubmissions(); // Await the API call

		return response.submissions as any; // Extract the submissions array and cast
	} catch (error) {
		return rejectWithValue((error as Error).message);
	}
});

const kycSlice = createSlice({
	name: "kyc",
	initialState,
	reducers: {
		clearError: (state) => {
			state.error = null;
		},
		clearSubmissions: (state) => {
			state.submissions = [];
		},
		setLoading: (state, action) => {
			state.loading = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			// Existing cases
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
				state.error = action.payload ?? "Failed to fetch KYC status";
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
				state.error = action.payload ?? "Failed to start KYC process";
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
				state.error = action.payload ?? "Failed to upload document";
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
				state.error = action.payload ?? "Failed to submit KYC data";
			})
			// New document cases
			.addCase(getKYCDocumentThunk.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(getKYCDocumentThunk.fulfilled, (state, action) => {
				const index = state.documents.findIndex(
					(doc) => doc.id === action.payload.id
				);
				if (index !== -1) {
					state.documents[index] = action.payload;
				} else {
					state.documents.push(action.payload);
				}
				state.loading = false;
			})
			.addCase(getKYCDocumentThunk.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload ?? "Failed to get document";
			})
			.addCase(deleteKYCDocumentThunk.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(deleteKYCDocumentThunk.fulfilled, (state, action) => {
				state.documents = state.documents.filter(
					(doc) => doc.id !== action.meta.arg
				);
				state.loading = false;
			})
			.addCase(deleteKYCDocumentThunk.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload ?? "Failed to delete document";
			})
			// Admin cases
			.addCase(verifyKYCSubmissionThunk.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(verifyKYCSubmissionThunk.fulfilled, (state) => {
				state.loading = false;
			})
			.addCase(verifyKYCSubmissionThunk.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload ?? "Failed to verify submission";
			})
			.addCase(listPendingKYCSubmissionsThunk.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(listPendingKYCSubmissionsThunk.fulfilled, (state, action) => {
				state.submissions = action.payload;
				state.loading = false;
			})
			.addCase(listPendingKYCSubmissionsThunk.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload ?? "Failed to list submissions";
			});
	},
});

export const { clearError, clearSubmissions, setLoading } = kycSlice.actions;
export default kycSlice.reducer;
