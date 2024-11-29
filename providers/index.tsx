"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/lib/store";
import { ThemeProvider } from "./ThemeProvider";
import ErrorBoundary from "./ErrorBoundary";
import LayoutLoader from "@/components/layout/loading";
import { AuthWrapper } from "./AuthWrapper";

export const Providers = ({ children }: { children: React.ReactNode }) => {
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
