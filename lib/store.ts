import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/authSlice";
import inventoryReducer from "./slices/inventorySlice";
import ordersReducer from "./slices/ordersSlice";
import onboardingReducer from "./slices/onboardingSlice";
import { combineReducers } from "redux";

const createPersistConfig = (userId: string | null) => ({
	key: userId ? `root-${userId}` : "root-guest",
	storage,
	whitelist: ["auth", "onboarding"],
});

const createRootReducer = () =>
	combineReducers({
		auth: authReducer,
		inventory: inventoryReducer,
		orders: ordersReducer,
		onboarding: onboardingReducer,
	});

// Function to create the store dynamically based on the user
export const createStore = (userId: string | null) => {
	const persistConfig = createPersistConfig(userId);
	const rootReducer = createRootReducer();
	const persistedReducer = persistReducer(persistConfig, rootReducer);

	const store = configureStore({
		reducer: persistedReducer,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				serializableCheck: {
					ignoredActions: ["persist/PERSIST"],
				},
			}),
	});

	const persistor = persistStore(store);

	return { store, persistor };
};

// TypeScript types
export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;
export type AppDispatch = ReturnType<typeof createStore>["store"]["dispatch"];

