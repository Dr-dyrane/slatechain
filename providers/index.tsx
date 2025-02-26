"use client";

import React, { useMemo } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { createStore } from "@/lib/store";
import { ThemeProvider } from "./ThemeProvider";
import ErrorBoundary from "./ErrorBoundary";
import LayoutLoader from "@/components/layout/loading";
import { AuthWrapper } from "./AuthWrapper";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const storeConfig = useMemo(() => {
    if (typeof window === "undefined") return null; // Ensure client-side execution
    const userId = localStorage.getItem("userId") || null;
    return createStore(userId);
  }, []);

  if (!storeConfig) return <LayoutLoader />;

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
