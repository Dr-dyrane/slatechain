// src/lib/helpers/appInitializer.ts
import { AppDispatch } from "@/lib/store";
import { fetchInventory } from "@/lib/slices/inventorySlice"; // use the updated path
import { fetchOrders } from "@/lib/slices/orderSlice"; // Example for orders slice, import the correct path for your order slice
import { fetchProgress } from "../slices/onboardingSlice";
import { fetchKYCStatusThunk } from "../slices/kycSlice";
import { fetchShipments } from "../slices/shipmentSlice";
import { fetchSuppliers } from "../slices/supplierSlice";
import { fetchUser } from "../slices/authSlice";
import { fetchUsers } from "../slices/user/user";
import { fetchNotifications } from "../slices/notificationSlice";
// Import other slices and actions that you want to initialize
// import {  AuthResponse } from "@/lib/types";
// import { setTokens } from "@/lib/slices/authSlice";

export const initializeApp = async (dispatch: AppDispatch) => {
	// Dispatch the fetch actions here
	dispatch(fetchInventory());
	dispatch(fetchOrders());
	dispatch(fetchProgress());
	dispatch(fetchKYCStatusThunk());
	dispatch(fetchShipments());
	dispatch(fetchSuppliers());
	dispatch(fetchUser());
	dispatch(fetchUsers());
	dispatch(fetchNotifications());
	// Dispatch other slice actions
	console.log("App Initialized: Data fetch started");
};
