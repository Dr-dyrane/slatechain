import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/authSlice";
import inventoryReducer from "./slices/inventorySlice";
import ordersReducer from "./slices/ordersSlice";
import onboardingReducer from "./slices/onboardingSlice";
import kycReducer from "./slices/kycSlice";
import { combineReducers } from "redux";

const createPersistConfig = (userId: string | null) => ({
  key: userId ? `root-${userId}` : "root-guest",
  storage,
  whitelist: ["auth", "onboarding", "kyc"],
});

const createRootReducer = () =>
  combineReducers({
    auth: authReducer,
    inventory: inventoryReducer,
    orders: ordersReducer,
    onboarding: onboardingReducer,
    kyc: kycReducer,
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

