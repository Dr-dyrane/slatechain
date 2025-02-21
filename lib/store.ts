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
import { combineReducers } from "redux";
import integrationReducer from "./slices/integrationSlice";
import notificationReducer from "./slices/notificationSlice";


const createPersistConfig = (userId: string | null) => ({
	key: userId ? `root-${userId}` : "root-guest",
	storage,
	whitelist: ["auth", "onboarding", "kyc", "user", "kpi", 'integration', 'notification'],
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
		notification: notificationReducer,
	});

export const createStore = (userId: string | null) => {
	const persistConfig = createPersistConfig(userId);
	const rootReducer = createRootReducer();
	const persistedReducer = persistReducer(persistConfig, rootReducer);

	const store = configureStore({
		reducer: persistedReducer,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
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
