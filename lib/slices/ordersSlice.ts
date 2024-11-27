import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Order {
  id: number
  orderNumber: string
  customer: string
  status: string
  total: number
}

interface OrdersState {
  orders: Order[]
}

const initialState: OrdersState = {
  orders: [],
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.push(action.payload)
    },
    updateOrder: (state, action: PayloadAction<Order>) => {
      const index = state.orders.findIndex(order => order.id === action.payload.id)
      if (index !== -1) {
        state.orders[index] = action.payload
      }
    },
    removeOrder: (state, action: PayloadAction<number>) => {
      state.orders = state.orders.filter(order => order.id !== action.payload)
    },
  },
})

export const { setOrders, addOrder, updateOrder, removeOrder } = ordersSlice.actions
export default ordersSlice.reducer
