"use client"

import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/lib/store'
import { LayoutLoader } from './layout/loading'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {/* Delay rendering until the persisted state is rehydrated */}
      <PersistGate loading={<LayoutLoader/>} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}
