"use client";

import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { createStore } from "@/lib/store";
import { ThemeProvider } from "./ThemeProvider";
import ErrorBoundary from "./ErrorBoundary";
import LayoutLoader from "@/components/layout/loading";
import { AuthWrapper } from "./AuthWrapper";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [storeConfig, setStoreConfig] = useState<{
    store: ReturnType<typeof createStore>["store"];
    persistor: ReturnType<typeof createStore>["persistor"];
  } | null>(null);

  useEffect(() => {
    // Dynamically fetch or set userId here
    const userId = localStorage.getItem("userId") || null; // Example logic
    const config = createStore(userId); // Dynamically create store based on userId
    setStoreConfig(config);
  }, []);

  if (!storeConfig) {
    return <LayoutLoader />; // Render loader until store is initialized
  }

  const { store, persistor } = storeConfig;

  return (
    <Provider store={store}>
      <PersistGate loading={<LayoutLoader />} persistor={persistor}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ErrorBoundary>
              <AuthWrapper>{children}</AuthWrapper>
            </ErrorBoundary>
          </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

