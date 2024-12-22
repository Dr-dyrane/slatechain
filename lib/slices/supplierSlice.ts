import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api/apiClient";
import { Supplier } from "@/lib/types";

interface SupplierState {
    items: Supplier[];
    loading: boolean;
    error: string | null;
}

const initialState: SupplierState = {
    items: [],
    loading: false,
    error: null,
};

export const fetchSuppliers = createAsyncThunk(
    "supplier/fetchSuppliers",
    async (_, thunkAPI) => {
      try {
          const response = await apiClient.get<Supplier[]>("/suppliers");
          return response
      } catch (error: any) {
        return thunkAPI.rejectWithValue(
            error.message || "Failed to fetch suppliers"
        )
      }
    }
)


export const addSupplier = createAsyncThunk(
  "supplier/addSupplier",
    async (item: Omit<Supplier, 'id'>, thunkAPI) => {
        try {
             const response = await apiClient.post<Supplier>("/suppliers", item)
             return response
        } catch(error: any) {
           return thunkAPI.rejectWithValue(
            error.message || "Failed to add a supplier"
          )
        }
    }
)

export const updateSupplier = createAsyncThunk(
  "supplier/updateSupplier",
    async (item: Supplier, thunkAPI) => {
       try {
            const response = await apiClient.put<Supplier>(`/suppliers/${item.id}`, item)
           return response
       } catch (error: any) {
           return thunkAPI.rejectWithValue(
            error.message || "Failed to update a supplier"
           )
       }
    }
)

export const removeSupplier = createAsyncThunk(
   "supplier/removeSupplier",
    async (id: string, thunkAPI) => {
         try {
            await apiClient.delete(`/suppliers/${id}`)
            return id
          } catch(error: any) {
           return thunkAPI.rejectWithValue(
            error.message || "Failed to remove a supplier"
           )
         }
    }
)

const supplierSlice = createSlice({
    name: "supplier",
    initialState,
    reducers: {},
     extraReducers: (builder) => {
        builder
        .addCase(fetchSuppliers.pending, (state) => {
            state.loading = true;
            state.error = null
        })
        .addCase(fetchSuppliers.fulfilled, (state, action) => {
            state.loading = false;
             state.items = action.payload
        })
        .addCase(fetchSuppliers.rejected, (state, action) => {
            state.loading = false;
           state.error = action.payload as string
        })
        .addCase(addSupplier.pending, (state) => {
            state.loading = true;
             state.error = null
          })
        .addCase(addSupplier.fulfilled, (state, action) => {
             state.loading = false;
             state.items.push(action.payload)
         })
        .addCase(addSupplier.rejected, (state, action) => {
              state.loading = false;
             state.error = action.payload as string;
        })
        .addCase(updateSupplier.pending, (state) => {
             state.loading = true;
            state.error = null
        })
        .addCase(updateSupplier.fulfilled, (state, action) => {
             state.loading = false;
             const updatedItem = action.payload;
             const index = state.items.findIndex((item) => item.id === updatedItem.id);
             if (index !== -1) {
                 state.items[index] = updatedItem;
            }
        })
       .addCase(updateSupplier.rejected, (state, action) => {
            state.loading = false;
           state.error = action.payload as string
         })
          .addCase(removeSupplier.pending, (state) => {
             state.loading = true;
             state.error = null
           })
        .addCase(removeSupplier.fulfilled, (state, action) => {
            state.loading = false;
           state.items = state.items.filter(item => item.id !== action.payload)
        })
         .addCase(removeSupplier.rejected, (state, action) => {
             state.loading = false;
              state.error = action.payload as string;
         })
    }
});

export default supplierSlice.reducer;