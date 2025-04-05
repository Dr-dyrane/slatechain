import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Supplier, SupplierDocument, ChatMessage } from "@/lib/types";
import { apiClient } from "../api/apiClient/[...live]";

interface SupplierState {
	items: Supplier[];
	documents: SupplierDocument[];
	chatMessagesBySupplier: { [key: string]: ChatMessage[] };
	selectedSupplier: Supplier | null;
	loading: boolean;
	chatLoading: boolean;
	error: string | null;
}

const initialState: SupplierState = {
	items: [],
	documents: [],
	chatMessagesBySupplier: {},
	selectedSupplier: null,
	loading: false,
	chatLoading: false,
	error: null,
};

export const fetchSuppliers = createAsyncThunk(
	"supplier/fetchSuppliers",
	async (_, thunkAPI) => {
		try {
			// This API now returns users with supplier role
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
			// This now creates a user with supplier role or updates an existing user
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
			// This now updates a user with supplier role
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
			// This now changes a user's role from supplier to customer
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
	async (
		payload: {
			supplierId: string;
			file?: File;
			documentType?: string;
			document?: Omit<SupplierDocument, "id" | "uploadedAt">;
		},
		thunkAPI
	) => {
		try {
			let response;

			// Handle file upload with FormData
			if (payload.file) {
				const formData = new FormData();
				formData.append("document", payload.file);
				formData.append("type", payload.documentType || "OTHER");

				response = await apiClient.post<SupplierDocument>(
					`/suppliers/${payload.supplierId}/documents`,
					formData,
					{
						headers: { "Content-Type": "multipart/form-data" },
					}
				);
			}
			// Handle document object
			else if (payload.document) {
				response = await apiClient.post<SupplierDocument>(
					`/suppliers/${payload.supplierId}/documents`,
					payload.document
				);
			} else {
				throw new Error("Either file or document must be provided");
			}

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

export const viewSupplierDocument = createAsyncThunk(
	"supplier/viewSupplierDocument",
	async (
		{ supplierId, documentId }: { supplierId: string; documentId: string },
		thunkAPI
	) => {
		try {
			const response = await apiClient.get<SupplierDocument>(
				`/suppliers/${supplierId}/documents/${documentId}`
			);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to view supplier document"
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
			return { supplierId, messages: response ?? [] };
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
			return { supplierId: message.supplierId, message: response };
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to send chat message"
			);
		}
	}
);

export const fetchSupplier = createAsyncThunk(
	"supplier/fetchSupplier",
	async (supplierId: string, thunkAPI) => {
		try {
			const response = await apiClient.get<Supplier>(
				`/suppliers/${supplierId}/invoice/`
			);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to fetch supplier invoices"
			);
		}
	}
);

const supplierSlice = createSlice({
	name: "supplier",
	initialState,
	reducers: {
		setSelectedSupplier: (state, action) => {
			state.selectedSupplier = action.payload;
		},
		clearSelectedSupplier: (state) => {
			state.selectedSupplier = null;
		},
		clearChatMessagesBySupplier: (state, action) => {
			delete state.chatMessagesBySupplier[action.payload];
		},
		setChatLoading: (state, action) => {
			state.chatLoading = action.payload;
		},
		clearError: (state) => {
			state.error = null;
		},
	},
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
			.addCase(fetchSupplierDocuments.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchSupplierDocuments.fulfilled, (state, action) => {
				state.loading = false;
				state.documents = action.payload ?? [];
			})
			.addCase(fetchSupplierDocuments.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(addSupplierDocument.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(addSupplierDocument.fulfilled, (state, action) => {
				state.loading = false;
				state.documents.push(action.payload);
			})
			.addCase(addSupplierDocument.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
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
			.addCase(viewSupplierDocument.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(viewSupplierDocument.fulfilled, (state) => {
				state.loading = false;
				// No state changes needed, just loading state management
			})
			.addCase(viewSupplierDocument.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			// Chat fetching actions
			.addCase(fetchChatMessages.pending, (state) => {
				state.chatLoading = true; // Set loading state to true when fetching
			})
			.addCase(fetchChatMessages.fulfilled, (state, action) => {
				state.chatLoading = false; // Set loading state to false after fetching
				// Ensure chatMessagesBySupplier is initialized before assigning messages
				if (!state.chatMessagesBySupplier) {
					state.chatMessagesBySupplier = {}; // Initialize if undefined
				}

				// Ensure that only the corresponding supplier's messages are updated
				if (action.payload.supplierId) {
					state.chatMessagesBySupplier[action.payload.supplierId] =
						action.payload.messages || [];
				}
			})
			.addCase(fetchChatMessages.rejected, (state, action) => {
				state.chatLoading = false; // Set loading state to false on error
				state.error = action.payload as string;
			})

			// Chat sending actions
			.addCase(sendChatMessage.pending, (state) => {
				state.chatLoading = true; // Set loading state to true when sending
			})
			.addCase(sendChatMessage.fulfilled, (state, action) => {
				state.chatLoading = false; // Set loading state to false after sending
				const { supplierId, message } = action.payload;

				// Ensure chatMessagesBySupplier is initialized before pushing new messages
				if (!state.chatMessagesBySupplier) {
					state.chatMessagesBySupplier = {}; // Initialize if undefined
				}

				// Ensure the supplier has a message array before pushing new messages
				if (!state.chatMessagesBySupplier[supplierId]) {
					state.chatMessagesBySupplier[supplierId] = [];
				}

				state.chatMessagesBySupplier[supplierId].push(message);
			})
			.addCase(sendChatMessage.rejected, (state, action) => {
				state.chatLoading = false; // Set loading state to false on error
				state.error = action.payload as string;
			})
			.addCase(fetchSupplier.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchSupplier.fulfilled, (state, action) => {
				state.loading = false;
				state.selectedSupplier = action.payload as Supplier;
			})
			.addCase(fetchSupplier.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});
	},
});

export const {
	setSelectedSupplier,
	clearSelectedSupplier,
	clearChatMessagesBySupplier,
	setChatLoading,
	clearError,
} = supplierSlice.actions;

export default supplierSlice.reducer;
