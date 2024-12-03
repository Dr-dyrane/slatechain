import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // This uses localStorage by default
import authReducer from "./slices/authSlice";
import inventoryReducer from "./slices/inventorySlice";
import ordersReducer from "./slices/ordersSlice";
import onboardingReducer from "./slices/onboardingSlice";
import { combineReducers } from "redux";

// Redux Persist Config
const persistConfig = {
	key: "root", // Key to store the Redux state
	storage, // You can use 'sessionStorage' instead of 'localStorage' if you prefer
	whitelist: ["auth"], // Specify which slices you want to persist (e.g., auth)
};

// Combine reducers
const rootReducer = combineReducers({
	auth: authReducer,
	inventory: inventoryReducer,
	orders: ordersReducer,
	onboarding: onboardingReducer,
});

// Create a persisted reducer using the config
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the store with the persisted reducer
export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: ["persist/PERSIST"], // Ignore specific actions
			},
		}),
});

// Create a persistor to manage the persistence of the store
export const persistor = persistStore(store);

// TypeScript types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
