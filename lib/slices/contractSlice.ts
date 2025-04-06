import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Contract, Bid, ContractStatus, BidStatus } from "@/lib/types";
import { apiClient } from "../api/apiClient/[...live]";
import { generateReferenceNumber } from "@/lib/utils";

interface ContractState {
	contracts: Contract[];
	bids: Bid[];
	selectedContract: Contract | null;
	selectedBid: Bid | null;
	loading: boolean;
	bidLoading: boolean;
	error: string | null;
	pendingActions: {
		contractCreation: boolean;
		contractUpdate: boolean;
		contractDeletion: string[];
		bidCreation: boolean;
		bidUpdate: boolean;
		bidDeletion: string[];
		contractSigning: string[];
	};
}

const initialState: ContractState = {
	contracts: [],
	bids: [],
	selectedContract: null,
	selectedBid: null,
	loading: false,
	bidLoading: false,
	error: null,
	pendingActions: {
		contractCreation: false,
		contractUpdate: false,
		contractDeletion: [],
		bidCreation: false,
		bidUpdate: false,
		bidDeletion: [],
		contractSigning: [],
	},
};

// Contract Thunks
export const fetchContracts = createAsyncThunk(
	"contracts/fetchAll",
	async (_, thunkAPI) => {
		try {
			const response = await apiClient.get<Contract[]>("/contracts");
			return response || [];
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to fetch contracts"
			);
		}
	}
);

export const fetchSupplierContracts = createAsyncThunk(
	"contracts/fetchSupplierContracts",
	async (supplierId: string, thunkAPI) => {
		try {
			const response = await apiClient.get<Contract[]>(
				`/contracts/supplier/${supplierId}`
			);
			return response || [];
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to fetch supplier contracts"
			);
		}
	}
);

export const fetchContractById = createAsyncThunk(
	"contracts/fetchById",
	async (contractId: string, thunkAPI) => {
		try {
			const response = await apiClient.get<Contract>(
				`/contracts/${contractId}`
			);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to fetch contract"
			);
		}
	}
);

export const createContract = createAsyncThunk(
	"contracts/create",
	async (contractData: Partial<Contract>, thunkAPI) => {
		try {
			// Generate contract number if not provided
			if (!contractData.contractNumber) {
				contractData.contractNumber = generateReferenceNumber("CNT");
			}

			const response = await apiClient.post<Contract>(
				"/contracts",
				contractData
			);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to create contract"
			);
		}
	}
);

export const updateContract = createAsyncThunk(
	"contracts/update",
	async ({ id, data }: { id: string; data: Partial<Contract> }, thunkAPI) => {
		try {
			// Remove the contractNumber from the data to avoid duplicate key error
			const { contractNumber, ...updateData } = data;

			// Send the update request with the filtered data (contractNumber excluded)
			const response = await apiClient.put<Contract>(
				`/contracts/${id}`,
				updateData
			);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to update contract"
			);
		}
	}
);

export const deleteContract = createAsyncThunk(
	"contracts/delete",
	async (id: string, thunkAPI) => {
		try {
			await apiClient.delete(`/contracts/${id}`);
			return id;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to delete contract"
			);
		}
	}
);

export const signContract = createAsyncThunk(
	"contracts/sign",
	async ({ id, isSupplier }: { id: string; isSupplier: boolean }, thunkAPI) => {
		try {
			const field = isSupplier ? "signedBySupplier" : "signedByAdmin";
			const response = await apiClient.put<Contract>(`/contracts/${id}`, {
				[field]: true,
			});
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to sign contract"
			);
		}
	}
);

export const terminateContract = createAsyncThunk(
	"contracts/terminate",
	async ({ id, reason }: { id: string; reason: string }, thunkAPI) => {
		try {
			const response = await apiClient.put<Contract>(`/contracts/${id}`, {
				status: "terminated",
				isTerminated: true,
				terminationReason: reason,
			});
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to terminate contract"
			);
		}
	}
);

// Bid Thunks
export const fetchBids = createAsyncThunk(
	"bids/fetchAll",
	async (_, thunkAPI) => {
		try {
			const response = await apiClient.get<Bid[]>("/bids");
			return response || [];
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error.message || "Failed to fetch bids");
		}
	}
);

export const fetchContractBids = createAsyncThunk(
	"bids/fetchContractBids",
	async (contractId: string, thunkAPI) => {
		try {
			const response = await apiClient.get<Bid[]>(
				`/contracts/${contractId}/bids`
			);
			return response || [];
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to fetch contract bids"
			);
		}
	}
);

export const fetchBidById = createAsyncThunk(
	"bids/fetchById",
	async (bidId: string, thunkAPI) => {
		try {
			const response = await apiClient.get<Bid>(`/contracts/bid/${bidId}`);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error.message || "Failed to fetch bid");
		}
	}
);

export const createBid = createAsyncThunk(
	"bids/create",
	async (bidData: Partial<Bid>, thunkAPI) => {
		try {
			// Generate reference number if not provided
			if (!bidData.referenceNumber) {
				bidData.referenceNumber = generateReferenceNumber("BID");
			}

			const response = await apiClient.post<Bid>(
				`/contracts/${bidData.linkedContractId}/bids`,
				bidData
			);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error.message || "Failed to create bid");
		}
	}
);

export const updateBid = createAsyncThunk(
	"bids/update",
	async ({ id, data }: { id: string; data: Partial<Bid> }, thunkAPI) => {
		try {
			const response = await apiClient.put<Bid>(`/contracts/bid/${id}`, data);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error.message || "Failed to update bid");
		}
	}
);

export const deleteBid = createAsyncThunk(
	"bids/delete",
	async (id: string, thunkAPI) => {
		try {
			await apiClient.delete(`/contracts/bid/${id}`);
			return id;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error.message || "Failed to delete bid");
		}
	}
);

export const acceptBid = createAsyncThunk(
	"bids/accept",
	async (bidId: string, thunkAPI) => {
		try {
			// First update the bid status
			const bidResponse = await apiClient.put<Bid>(`/contracts/bid/${bidId}`, {
				status: "accepted" as BidStatus,
			});

			// Then update the contract with the bid ID and change status to active
			if (bidResponse.linkedContractId) {
				const contractResponse = await apiClient.put<Contract>(
					`/contracts/${bidResponse.linkedContractId}`,
					{
						bidId: bidId,
						status: "active" as ContractStatus,
					}
				);

				return { bid: bidResponse, contract: contractResponse };
			}

			return { bid: bidResponse, contract: null };
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error.message || "Failed to accept bid");
		}
	}
);

export const rejectBid = createAsyncThunk(
	"bids/reject",
	async (bidId: string, thunkAPI) => {
		try {
			const response = await apiClient.put<Bid>(`/contracts/bid/${bidId}`, {
				status: "rejected" as BidStatus,
			});
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error.message || "Failed to reject bid");
		}
	}
);

const contractSlice = createSlice({
	name: "contracts",
	initialState,
	reducers: {
		setLoading: (state, action) => {
			state.loading = action.payload;
		},
		setSelectedContract: (state, action) => {
			state.selectedContract = action.payload;
		},
		clearSelectedContract: (state) => {
			state.selectedContract = null;
		},
		setSelectedBid: (state, action) => {
			state.selectedBid = action.payload;
		},
		clearSelectedBid: (state) => {
			state.selectedBid = null;
		},
		clearError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			// Fetch Contracts
			.addCase(fetchContracts.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchContracts.fulfilled, (state, action) => {
				state.loading = false;
				state.contracts = action.payload;
			})
			.addCase(fetchContracts.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})

			// Fetch Supplier Contracts
			.addCase(fetchSupplierContracts.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchSupplierContracts.fulfilled, (state, action) => {
				state.loading = false;
				state.contracts = action.payload;
			})
			.addCase(fetchSupplierContracts.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})

			// Fetch Contract By ID
			.addCase(fetchContractById.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchContractById.fulfilled, (state, action) => {
				state.loading = false;
				state.selectedContract = action.payload;
			})
			.addCase(fetchContractById.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})

			// Create Contract
			.addCase(createContract.pending, (state) => {
				state.loading = true;
				state.pendingActions.contractCreation = true;
				state.error = null;
			})
			.addCase(createContract.fulfilled, (state, action) => {
				state.loading = false;
				state.pendingActions.contractCreation = false;
				state.contracts.push(action.payload);
			})
			.addCase(createContract.rejected, (state, action) => {
				state.loading = false;
				state.pendingActions.contractCreation = false;
				state.error = action.payload as string;
			})

			// Update Contract
			.addCase(updateContract.pending, (state) => {
				state.loading = true;
				state.pendingActions.contractUpdate = true;
				state.error = null;
			})
			.addCase(updateContract.fulfilled, (state, action) => {
				state.loading = false;
				state.pendingActions.contractUpdate = false;
				const index = state.contracts.findIndex(
					(c) => c.id === action.payload.id
				);
				if (index !== -1) {
					state.contracts[index] = action.payload;
				}
				if (state.selectedContract?.id === action.payload.id) {
					state.selectedContract = action.payload;
				}
			})
			.addCase(updateContract.rejected, (state, action) => {
				state.loading = false;
				state.pendingActions.contractUpdate = false;
				state.error = action.payload as string;
			})

			// Delete Contract
			.addCase(deleteContract.pending, (state, action) => {
				state.loading = true;
				state.pendingActions.contractDeletion.push(action.meta.arg);
				state.error = null;
			})
			.addCase(deleteContract.fulfilled, (state, action) => {
				state.loading = false;
				state.pendingActions.contractDeletion =
					state.pendingActions.contractDeletion.filter(
						(id) => id !== action.payload
					);
				state.contracts = state.contracts.filter(
					(c) => c.id !== action.payload
				);
				if (state.selectedContract?.id === action.payload) {
					state.selectedContract = null;
				}
			})
			.addCase(deleteContract.rejected, (state, action) => {
				state.loading = false;
				state.pendingActions.contractDeletion =
					state.pendingActions.contractDeletion.filter(
						(id) => id !== action.meta.arg
					);
				state.error = action.payload as string;
			})

			// Sign Contract
			.addCase(signContract.pending, (state, action) => {
				state.loading = true;
				state.pendingActions.contractSigning.push(action.meta.arg.id);
				state.error = null;
			})
			.addCase(signContract.fulfilled, (state, action) => {
				state.loading = false;
				state.pendingActions.contractSigning =
					state.pendingActions.contractSigning.filter(
						(id) => id !== action.payload.id
					);
				const index = state.contracts.findIndex(
					(c) => c.id === action.payload.id
				);
				if (index !== -1) {
					state.contracts[index] = action.payload;
				}
				if (state.selectedContract?.id === action.payload.id) {
					state.selectedContract = action.payload;
				}
			})
			.addCase(signContract.rejected, (state, action) => {
				state.loading = false;
				state.pendingActions.contractSigning =
					state.pendingActions.contractSigning.filter(
						(id) => id !== action.meta.arg.id
					);
				state.error = action.payload as string;
			})

			// Terminate Contract
			.addCase(terminateContract.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(terminateContract.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.contracts.findIndex(
					(c) => c.id === action.payload.id
				);
				if (index !== -1) {
					state.contracts[index] = action.payload;
				}
				if (state.selectedContract?.id === action.payload.id) {
					state.selectedContract = action.payload;
				}
			})
			.addCase(terminateContract.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})

			// Fetch Bids
			.addCase(fetchBids.pending, (state) => {
				state.bidLoading = true;
				state.error = null;
			})
			.addCase(fetchBids.fulfilled, (state, action) => {
				state.bidLoading = false;
				state.bids = action.payload;
			})
			.addCase(fetchBids.rejected, (state, action) => {
				state.bidLoading = false;
				state.error = action.payload as string;
			})

			// Fetch Contract Bids
			.addCase(fetchContractBids.pending, (state) => {
				state.bidLoading = true;
				state.error = null;
			})
			.addCase(fetchContractBids.fulfilled, (state, action) => {
				state.bidLoading = false;
				state.bids = action.payload;
			})
			.addCase(fetchContractBids.rejected, (state, action) => {
				state.bidLoading = false;
				state.error = action.payload as string;
			})

			// Fetch Bid By ID
			.addCase(fetchBidById.pending, (state) => {
				state.bidLoading = true;
				state.error = null;
			})
			.addCase(fetchBidById.fulfilled, (state, action) => {
				state.bidLoading = false;
				state.selectedBid = action.payload;
			})
			.addCase(fetchBidById.rejected, (state, action) => {
				state.bidLoading = false;
				state.error = action.payload as string;
			})

			// Create Bid
			.addCase(createBid.pending, (state) => {
				state.bidLoading = true;
				state.pendingActions.bidCreation = true;
				state.error = null;
			})
			.addCase(createBid.fulfilled, (state, action) => {
				state.bidLoading = false;
				state.pendingActions.bidCreation = false;
				state.bids.push(action.payload);
			})
			.addCase(createBid.rejected, (state, action) => {
				state.bidLoading = false;
				state.pendingActions.bidCreation = false;
				state.error = action.payload as string;
			})

			// Update Bid
			.addCase(updateBid.pending, (state) => {
				state.bidLoading = true;
				state.pendingActions.bidUpdate = true;
				state.error = null;
			})
			.addCase(updateBid.fulfilled, (state, action) => {
				state.bidLoading = false;
				state.pendingActions.bidUpdate = false;
				const index = state.bids.findIndex((b) => b.id === action.payload.id);
				if (index !== -1) {
					state.bids[index] = action.payload;
				}
				if (state.selectedBid?.id === action.payload.id) {
					state.selectedBid = action.payload;
				}
			})
			.addCase(updateBid.rejected, (state, action) => {
				state.bidLoading = false;
				state.pendingActions.bidUpdate = false;
				state.error = action.payload as string;
			})

			// Delete Bid
			.addCase(deleteBid.pending, (state, action) => {
				state.bidLoading = true;
				state.pendingActions.bidDeletion.push(action.meta.arg);
				state.error = null;
			})
			.addCase(deleteBid.fulfilled, (state, action) => {
				state.bidLoading = false;
				state.pendingActions.bidDeletion =
					state.pendingActions.bidDeletion.filter(
						(id) => id !== action.payload
					);
				state.bids = state.bids.filter((b) => b.id !== action.payload);
				if (state.selectedBid?.id === action.payload) {
					state.selectedBid = null;
				}
			})
			.addCase(deleteBid.rejected, (state, action) => {
				state.bidLoading = false;
				state.pendingActions.bidDeletion =
					state.pendingActions.bidDeletion.filter(
						(id) => id !== action.meta.arg
					);
				state.error = action.payload as string;
			})

			// Accept Bid
			.addCase(acceptBid.pending, (state) => {
				state.bidLoading = true;
				state.error = null;
			})
			.addCase(acceptBid.fulfilled, (state, action) => {
				state.bidLoading = false;

				// Update bid
				if (action.payload.bid) {
					const bidIndex = state.bids.findIndex(
						(b) => b.id === action.payload.bid.id
					);
					if (bidIndex !== -1) {
						state.bids[bidIndex] = action.payload.bid;
					}
					if (state.selectedBid?.id === action.payload.bid.id) {
						state.selectedBid = action.payload.bid;
					}
				}

				// Update contract
				// Update contract
				const updatedContract = action?.payload?.contract;
				if (updatedContract) {
					const contractIndex = state.contracts.findIndex(
						(c) => c.id === updatedContract.id
					);
					if (contractIndex !== -1) {
						state.contracts[contractIndex] = updatedContract;
					}
					if (state.selectedContract?.id === updatedContract.id) {
						state.selectedContract = updatedContract;
					}
				}
			})
			.addCase(acceptBid.rejected, (state, action) => {
				state.bidLoading = false;
				state.error = action.payload as string;
			})

			// Reject Bid
			.addCase(rejectBid.pending, (state) => {
				state.bidLoading = true;
				state.error = null;
			})
			.addCase(rejectBid.fulfilled, (state, action) => {
				state.bidLoading = false;
				const index = state.bids.findIndex((b) => b.id === action.payload.id);
				if (index !== -1) {
					state.bids[index] = action.payload;
				}
				if (state.selectedBid?.id === action.payload.id) {
					state.selectedBid = action.payload;
				}
			})
			.addCase(rejectBid.rejected, (state, action) => {
				state.bidLoading = false;
				state.error = action.payload as string;
			});
	},
});

export const {
	setSelectedContract,
	clearSelectedContract,
	setSelectedBid,
	clearSelectedBid,
	clearError,
	setLoading,
} = contractSlice.actions;

export default contractSlice.reducer;
