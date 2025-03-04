import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api/apiClient";
import {
	Route,
	Carrier,
	Freight,
	Shipment,
	ShipmentState,
	Transport,
} from "@/lib/types";

const initialState: ShipmentState = {
	items: [],
	carriers: [],
	routes: [],
	transports: [],
	freights: [],
	loading: false,
	error: null,
};

export const fetchShipments = createAsyncThunk(
	"shipment/fetchShipments",
	async (_, thunkAPI) => {
		try {
			const response = await apiClient.get<Shipment[]>("/shipments");
			return response ?? [];
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to fetch shipments"
			);
		}
	}
);

export const addShipment = createAsyncThunk(
	"shipment/addShipment",
	async (item: Omit<Shipment, "id">, thunkAPI) => {
		try {
			const response = await apiClient.post<Shipment>("/shipments", item);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to add shipment"
			);
		}
	}
);

export const updateShipment = createAsyncThunk(
	"shipment/updateShipment",
	async (item: Shipment, thunkAPI) => {
		try {
			const response = await apiClient.put<Shipment>(
				`/shipments/${item.id}`,
				item
			);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to update shipment item"
			);
		}
	}
);

export const removeShipment = createAsyncThunk(
	"shipment/removeShipment",
	async (id: string, thunkAPI) => {
		try {
			await apiClient.delete(`/shipments/${id}`);
			return id;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to remove shipment item"
			);
		}
	}
);

export const fetchCarriers = createAsyncThunk(
	"shipment/fetchCarriers",
	async (_, thunkAPI) => {
		try {
			const response = await apiClient.get<Carrier[]>("/carriers");
			return response ?? [];
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to fetch carriers"
			);
		}
	}
);

export const addCarrier = createAsyncThunk(
	"shipment/addCarrier",
	async (carrier: Omit<Carrier, "id">, thunkAPI) => {
		try {
			const response = await apiClient.post<Carrier>("/carriers", carrier);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error.message || "Failed to add carrier");
		}
	}
);

export const updateCarrier = createAsyncThunk(
	"shipment/updateCarrier",
	async (carrier: Carrier, thunkAPI) => {
		try {
			const response = await apiClient.put<Carrier>(
				`/carriers/${carrier.id}`,
				carrier
			);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to update carrier"
			);
		}
	}
);

export const removeCarrier = createAsyncThunk(
	"shipment/removeCarrier",
	async (id: string, thunkAPI) => {
		try {
			await apiClient.delete(`/carriers/${id}`);
			return id;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to remove carrier"
			);
		}
	}
);

export const fetchRoutes = createAsyncThunk(
	"shipment/fetchRoutes",
	async (_, thunkAPI) => {
		try {
			const response = await apiClient.get<Route[]>("/routes");
			return response ?? [];
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to fetch routes"
			);
		}
	}
);

export const addRoute = createAsyncThunk(
	"shipment/addRoute",
	async (route: Omit<Route, "id">, thunkAPI) => {
		try {
			const response = await apiClient.post<Route>("/routes", route);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error.message || "Failed to add route");
		}
	}
);

export const updateRoute = createAsyncThunk(
	"shipment/updateRoute",
	async (route: Route, thunkAPI) => {
		try {
			const response = await apiClient.put<Route>(`/routes/${route.id}`, route);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to update route"
			);
		}
	}
);

export const removeRoute = createAsyncThunk(
	"shipment/removeRoute",
	async (id: string, thunkAPI) => {
		try {
			await apiClient.delete(`/routes/${id}`);
			return id;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to remove route"
			);
		}
	}
);

export const fetchTransports = createAsyncThunk(
	"shipment/fetchTransports",
	async (_, thunkAPI) => {
		try {
			const response = await apiClient.get<Transport[]>("/transports");
			return response ?? [];
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to fetch transports"
			);
		}
	}
);

export const addTransport = createAsyncThunk(
	"shipment/addTransport",
	async (transport: Omit<Transport, "id">, thunkAPI) => {
		try {
			const response = await apiClient.post<Transport>(
				"/transports",
				transport
			);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to add transport"
			);
		}
	}
);

export const updateTransport = createAsyncThunk(
	"shipment/updateTransport",
	async (transport: Transport, thunkAPI) => {
		try {
			const response = await apiClient.put<Transport>(
				`/transports/${transport.id}`,
				transport
			);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to update transport"
			);
		}
	}
);

export const removeTransport = createAsyncThunk(
	"shipment/removeTransport",
	async (id: string, thunkAPI) => {
		try {
			await apiClient.delete(`/transports/${id}`);
			return id;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to remove transport"
			);
		}
	}
);

export const fetchFreights = createAsyncThunk(
	"shipment/fetchFreights",
	async (_, thunkAPI) => {
		try {
			const response = await apiClient.get<Freight[]>("/freights");
			return response ?? [];
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to fetch freights"
			);
		}
	}
);

export const addFreight = createAsyncThunk(
	"shipment/addFreight",
	async (freight: Omit<Freight, "id">, thunkAPI) => {
		try {
			const response = await apiClient.post<Freight>("/freights", freight);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error.message || "Failed to add freight");
		}
	}
);

export const updateFreight = createAsyncThunk(
	"shipment/updateFreight",
	async (freight: Freight, thunkAPI) => {
		try {
			const response = await apiClient.put<Freight>(
				`/freights/${freight.id}`,
				freight
			);
			return response;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to update freight"
			);
		}
	}
);

export const removeFreight = createAsyncThunk(
	"shipment/removeFreight",
	async (id: string, thunkAPI) => {
		try {
			await apiClient.delete(`/freights/${id}`);
			return id;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to remove freight"
			);
		}
	}
);

const shipmentSlice = createSlice({
	name: "shipment",
	initialState,
	reducers: {
		simulateShipmentUpdate: (state, action: PayloadAction<Shipment>) => {
			const index = state.items.findIndex(
				(item) => item.id === action.payload.id
			);
			if (index !== -1) {
				state.items[index] = action.payload;
			}
		},
	},
	extraReducers: (builder) => {
		// Old reducers for shipment management
		builder
			.addCase(fetchShipments.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchShipments.fulfilled, (state, action) => {
				state.loading = false;
				state.items = action.payload ?? [];
			})
			.addCase(fetchShipments.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(addShipment.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(addShipment.fulfilled, (state, action) => {
				state.loading = false;
				state.items.push(action.payload);
			})
			.addCase(addShipment.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(updateShipment.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateShipment.fulfilled, (state, action) => {
				state.loading = false;
				const updatedItem = action.payload;
				const index = state.items.findIndex(
					(item) => item.id === updatedItem.id
				);
				if (index !== -1) {
					state.items[index] = updatedItem;
				}
			})
			.addCase(updateShipment.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(removeShipment.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(removeShipment.fulfilled, (state, action) => {
				state.loading = false;
				state.items = state.items.filter((item) => item.id !== action.payload);
			})
			.addCase(removeShipment.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});
		// New reducers for transport management
		builder
			.addCase(fetchCarriers.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchCarriers.fulfilled, (state, action) => {
				state.loading = false;
				state.carriers = action.payload ?? [];
			})
			.addCase(fetchCarriers.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(addCarrier.fulfilled, (state, action) => {
				state.carriers.push(action.payload);
			})
			.addCase(updateCarrier.fulfilled, (state, action) => {
				const index = state.carriers.findIndex(
					(carrier) => carrier.id === action.payload.id
				);
				if (index !== -1) {
					state.carriers[index] = action.payload;
				}
			})
			.addCase(removeCarrier.fulfilled, (state, action) => {
				state.carriers = state.carriers.filter(
					(carrier) => carrier.id !== action.payload
				);
			});

		builder
			.addCase(fetchRoutes.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchRoutes.fulfilled, (state, action) => {
				state.loading = false;
				state.routes = action.payload ?? [];
			})
			.addCase(fetchRoutes.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(addRoute.fulfilled, (state, action) => {
				state.routes.push(action.payload);
			})
			.addCase(updateRoute.fulfilled, (state, action) => {
				const index = state.routes.findIndex(
					(route) => route.id === action.payload.id
				);
				if (index !== -1) {
					state.routes[index] = action.payload;
				}
			})
			.addCase(removeRoute.fulfilled, (state, action) => {
				state.routes = state.routes.filter(
					(route) => route.id !== action.payload
				);
			});

		builder
			.addCase(fetchTransports.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchTransports.fulfilled, (state, action) => {
				state.loading = false;
				state.transports = action.payload ?? [];
			})
			.addCase(fetchTransports.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(addTransport.fulfilled, (state, action) => {
				state.transports.push(action.payload);
			})
			.addCase(updateTransport.fulfilled, (state, action) => {
				const index = state.transports.findIndex(
					(transport) => transport.id === action.payload.id
				);
				if (index !== -1) {
					state.transports[index] = action.payload;
				}
			})
			.addCase(removeTransport.fulfilled, (state, action) => {
				state.transports = state.transports.filter(
					(transport) => transport.id !== action.payload
				);
			});

		builder
			.addCase(fetchFreights.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchFreights.fulfilled, (state, action) => {
				state.loading = false;
				state.freights = action.payload ?? [];
			})
			.addCase(fetchFreights.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(addFreight.fulfilled, (state, action) => {
				state.freights.push(action.payload);
			})
			.addCase(updateFreight.fulfilled, (state, action) => {
				const index = state.freights.findIndex(
					(freight) => freight.id === action.payload.id
				);
				if (index !== -1) {
					state.freights[index] = action.payload;
				}
			})
			.addCase(removeFreight.fulfilled, (state, action) => {
				state.freights = state.freights.filter(
					(freight) => freight.id !== action.payload
				);
			});
	},
});

export const { simulateShipmentUpdate } = shipmentSlice.actions;

export default shipmentSlice.reducer;
