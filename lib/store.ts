import { configureStore } from "@reduxjs/toolkit";
import {
	persistStore,
	persistReducer,
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/authSlice";
import inventoryReducer from "./slices/inventorySlice";
import ordersReducer from "./slices/orderSlice";
import onboardingReducer from "./slices/onboardingSlice";
import shipmentReducer from "./slices/shipmentSlice";
import kycReducer from "./slices/kycSlice";
import kpiReducer from "./slices/kpi/kpiSlice";
import supplierReducer from "./slices/supplierSlice";
import userReducer from "./slices/user/user";
import shopifyReducer from "./slices/shopifySlice";
import customerReducer from "./slices/customerSlice";
import { combineReducers } from "redux";
import integrationReducer from "./slices/integrationSlice";
import notificationReducer from "./slices/notificationSlice";
import { useDispatch } from "react-redux";
import safeStorage from "./helpers/safeStorage";

const createPersistConfig = (userId: string | null) => ({
	key: userId ? `root-${userId}` : "root-guest",
	storage : safeStorage,
	whitelist: [
		"auth",
		"onboarding",
		"kyc",
		"user",
		"kpi",
		"integration",
		"notifications",
		"customer",
		'shopify',
		'supplier',
		'inventory',
		'orders',
		'shipment',
	],
});

const createRootReducer = () =>
	combineReducers({
		auth: authReducer,
		inventory: inventoryReducer,
		orders: ordersReducer,
		onboarding: onboardingReducer,
		kyc: kycReducer,
		shipment: shipmentReducer,
		supplier: supplierReducer,
		user: userReducer,
		kpi: kpiReducer,
		shopify: shopifyReducer,
		integration: integrationReducer,
		notifications: notificationReducer,
		customer: customerReducer,
	});

export const createStore = (userId: string | null) => {
	const persistConfig = createPersistConfig(userId);
	const rootReducer = createRootReducer();
	const persistedReducer = persistReducer(persistConfig, rootReducer);

	const store = configureStore({
		reducer: persistedReducer,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				immutableCheck: false, 
				serializableCheck: {
					ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
				},
			}),
	});

	const persistor = persistStore(store);

	return { store, persistor };
};

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;
export type AppDispatch = ReturnType<typeof createStore>["store"]["dispatch"];
export const useAppDispatch: () => AppDispatch = useDispatch;
