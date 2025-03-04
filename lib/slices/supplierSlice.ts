import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api/apiClient";
import type { Supplier, SupplierDocument, ChatMessage } from "@/lib/types";

interface SupplierState {
	items: Supplier[];
	documents: SupplierDocument[];
	chatMessages: ChatMessage[];
	loading: boolean;
	error: string | null;
}

const initialState: SupplierState = {
	items: [],
	documents: [],
	chatMessages: [],
	loading: false,
	error: null,
};

export const fetchSuppliers = createAsyncThunk(
	"supplier/fetchSuppliers",
	async (_, thunkAPI) => {
		try {
			const response = await apiClient.get<Supplier[]>("/suppliers");
			return response ?? [];
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to fetch suppliers"
			);
		}
	}
);

export const addSupplier = createAsyncThunk(
	"supplier/addSupplier",
	async (
		supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">,
		thunkAPI
	) => {
		try {
			const response = await apiClient.post<Supplier>("/suppliers", supplier);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to add supplier"
			);
		}
	}
);

export const updateSupplier = createAsyncThunk(
	"supplier/updateSupplier",
	async (supplier: Supplier, thunkAPI) => {
		try {
			const response = await apiClient.put<Supplier>(
				`/suppliers/${supplier.id}`,
				supplier
			);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to update supplier"
			);
		}
	}
);

export const deleteSupplier = createAsyncThunk(
	"supplier/deleteSupplier",
	async (id: string, thunkAPI) => {
		try {
			await apiClient.delete(`/suppliers/${id}`);
			return id;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to delete supplier"
			);
		}
	}
);

export const fetchSupplierDocuments = createAsyncThunk(
	"supplier/fetchSupplierDocuments",
	async (supplierId: string, thunkAPI) => {
		try {
			const response = await apiClient.get<SupplierDocument[]>(
				`/suppliers/${supplierId}/documents`
			);
			return response ?? [];
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to fetch supplier documents"
			);
		}
	}
);

export const addSupplierDocument = createAsyncThunk(
	"supplier/addSupplierDocument",
	async (document: Omit<SupplierDocument, "id" | "uploadedAt">, thunkAPI) => {
		try {
			const response = await apiClient.post<SupplierDocument>(
				`/suppliers/${document.supplierId}/documents`,
				document
			);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to add supplier document"
			);
		}
	}
);

export const deleteSupplierDocument = createAsyncThunk(
	"supplier/deleteSupplierDocument",
	async (
		{ supplierId, documentId }: { supplierId: string; documentId: string },
		thunkAPI
	) => {
		try {
			await apiClient.delete(
				`/suppliers/${supplierId}/documents/${documentId}`
			);
			return { supplierId, documentId };
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to delete supplier document"
			);
		}
	}
);

export const fetchChatMessages = createAsyncThunk(
	"supplier/fetchChatMessages",
	async (supplierId: string, thunkAPI) => {
		try {
			const response = await apiClient.get<ChatMessage[]>(
				`/suppliers/${supplierId}/chat`
			);
			return response ?? [];
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to fetch chat messages"
			);
		}
	}
);

export const sendChatMessage = createAsyncThunk(
	"supplier/sendChatMessage",
	async (message: Omit<ChatMessage, "id" | "timestamp">, thunkAPI) => {
		try {
			const response = await apiClient.post<ChatMessage>(
				`/suppliers/${message.supplierId}/chat`,
				message
			);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to send chat message"
			);
		}
	}
);

const supplierSlice = createSlice({
	name: "supplier",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchSuppliers.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchSuppliers.fulfilled, (state, action) => {
				state.loading = false;
				state.items = action.payload ?? [];
			})
			.addCase(fetchSuppliers.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(addSupplier.fulfilled, (state, action) => {
				state.items.push(action.payload);
			})
			.addCase(updateSupplier.fulfilled, (state, action) => {
				const index = state.items.findIndex(
					(supplier) => supplier.id === action.payload.id
				);
				if (index !== -1) {
					state.items[index] = action.payload;
				}
			})
			.addCase(deleteSupplier.fulfilled, (state, action) => {
				state.items = state.items.filter(
					(supplier) => supplier.id !== action.payload
				);
			})
			.addCase(fetchSupplierDocuments.fulfilled, (state, action) => {
				state.documents = action.payload ?? [];
			})
			.addCase(addSupplierDocument.fulfilled, (state, action) => {
				state.documents.push(action.payload);
			})
			.addCase(deleteSupplierDocument.fulfilled, (state, action) => {
				state.documents = state.documents.filter(
					(doc) =>
						!(
							doc.supplierId === action.payload.supplierId &&
							doc.id === action.payload.documentId
						)
				);
			})
			.addCase(fetchChatMessages.fulfilled, (state, action) => {
				state.chatMessages = action.payload ?? [];
			})
			.addCase(sendChatMessage.fulfilled, (state, action) => {
				state.chatMessages.push(action.payload);
			});
	},
});

export default supplierSlice.reducer;
