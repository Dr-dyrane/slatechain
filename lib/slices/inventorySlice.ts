import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InventoryItem {
	id: number;
	name: string;
	sku: string;
	quantity: number;
	location: string;
}

interface InventoryState {
	items: InventoryItem[];
}

const initialState: InventoryState = {
	items: [],
};

const inventorySlice = createSlice({
	name: "inventory",
	initialState,
	reducers: {
		setInventory: (state, action: PayloadAction<InventoryItem[]>) => {
			state.items = action.payload;
		},
		addInventoryItem: (state, action: PayloadAction<InventoryItem>) => {
			state.items.push(action.payload);
		},
		updateInventoryItem: (state, action: PayloadAction<InventoryItem>) => {
			const index = state.items.findIndex(
				(item) => item.id === action.payload.id
			);
			if (index !== -1) {
				state.items[index] = action.payload;
			}
		},
		removeInventoryItem: (state, action: PayloadAction<number>) => {
			state.items = state.items.filter((item) => item.id !== action.payload);
		},
	},
});

export const {
	setInventory,
	addInventoryItem,
	updateInventoryItem,
	removeInventoryItem,
} = inventorySlice.actions;
export default inventorySlice.reducer;
