import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api/apiClient";
import { Shipment } from "@/lib/types";

interface ShipmentState {
    items: Shipment[];
    loading: boolean;
    error: string | null;
}

const initialState: ShipmentState = {
    items: [],
    loading: false,
    error: null,
};

export const fetchShipments = createAsyncThunk(
    "shipment/fetchShipments",
    async (_, thunkAPI) => {
        try {
            const response = await apiClient.get<Shipment[]>("/shipments");
            return response;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.message || "Failed to fetch shipments"
            );
        }
    }
);

export const addShipment = createAsyncThunk(
    "shipment/addShipment",
    async (item: Omit<Shipment, 'id'>, thunkAPI) => {
        try {
            const response = await apiClient.post<Shipment>("/shipments", item);
            return response;
        } catch (error: any) {
           return thunkAPI.rejectWithValue(
               error.message || "Failed to add shipment"
            );
        }
    }
)

export const updateShipment = createAsyncThunk(
    "shipment/updateShipment",
    async (item: Shipment, thunkAPI) => {
      try {
         const response = await apiClient.put<Shipment>(`/shipments/${item.id}`, item)
          return response
      } catch(error: any) {
          return thunkAPI.rejectWithValue(
              error.message || "Failed to update shipment item"
          )
      }
    }
)


export const removeShipment = createAsyncThunk(
    "shipment/removeShipment",
    async (id: string, thunkAPI) => {
        try {
            await apiClient.delete(`/shipments/${id}`)
            return id
        } catch (error: any) {
             return thunkAPI.rejectWithValue(
                 error.message || "Failed to remove shipment item"
             )
        }
    }
)

const shipmentSlice = createSlice({
    name: "shipment",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchShipments.pending, (state) => {
            state.loading = true;
            state.error = null
        })
        .addCase(fetchShipments.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload
        })
        .addCase(fetchShipments.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string
        })
        .addCase(addShipment.pending, (state) => {
             state.loading = true;
            state.error = null
         })
         .addCase(addShipment.fulfilled, (state, action) => {
             state.loading = false;
             state.items.push(action.payload)
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
              const index = state.items.findIndex((item) => item.id === updatedItem.id);
              if (index !== -1) {
                  state.items[index] = updatedItem;
              }
         })
         .addCase(updateShipment.rejected, (state, action) => {
            state.loading = false;
             state.error = action.payload as string
          })
           .addCase(removeShipment.pending, (state) => {
              state.loading = true;
              state.error = null
            })
         .addCase(removeShipment.fulfilled, (state, action) => {
             state.loading = false;
             state.items = state.items.filter((item) => item.id !== action.payload)
          })
         .addCase(removeShipment.rejected, (state, action) => {
              state.loading = false;
             state.error = action.payload as string
          })
    },
});

export default shipmentSlice.reducer;