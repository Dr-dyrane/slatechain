import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import inventoryReducer from './slices/inventorySlice'
import ordersReducer from './slices/ordersSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    inventory: inventoryReducer,
    orders: ordersReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
