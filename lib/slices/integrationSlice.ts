import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export type IntegrationCategory = "ecommerce" | "erp_crm" | "iot" | "bi_tools"

interface IntegrationDetails {
  enabled: boolean
  service: string | null
  apiKey?: string | null
  storeUrl?: string | null
}

export interface IntegrationState {
  ecommerce: IntegrationDetails
  erp_crm: IntegrationDetails
  iot: IntegrationDetails
  bi_tools: IntegrationDetails
}

const initialState: IntegrationState = {
  ecommerce: { enabled: false, service: null },
  erp_crm: { enabled: false, service: null },
  iot: { enabled: false, service: null },
  bi_tools: { enabled: false, service: null },
}

interface SetIntegrationPayload {
  category: IntegrationCategory
  service: string | null
  apiKey?: string
  storeUrl?: string
}

const integrationSlice = createSlice({
  name: "integration",
  initialState,
  reducers: {
    setIntegration: (state, action: PayloadAction<SetIntegrationPayload>) => {
      const { category, service, apiKey, storeUrl } = action.payload
      state[category] = {
        enabled: true,
        service,
        apiKey: apiKey || null,
        storeUrl: storeUrl || null,
      }
    },
    toggleIntegration: (state, action: PayloadAction<IntegrationCategory>) => {
      const category = action.payload
      state[category].enabled = !state[category].enabled
    },
  },
})

export const { setIntegration, toggleIntegration } = integrationSlice.actions
export default integrationSlice.reducer

