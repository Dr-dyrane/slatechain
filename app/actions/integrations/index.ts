import type { IntegrationCategory } from "@/lib/slices/integrationSlice"
import { handleErpIntegration } from "./erp-integration"
import { handleIoTIntegration } from "./iot-integration"
import { handleBIToolsIntegration } from "./bi-tools-integration"
import { handleEcommerceIntegration } from "./ecommerce-integration"

/**
 * Handles integration activation based on category and service
 */
export async function handleIntegrationActivation(
  userId: string,
  category: IntegrationCategory,
  service: string,
  enabled: boolean,
  apiKey: string,
  storeUrl?: string,
) {
  try {
    // If integration is being disabled, no need to proceed with activation
    if (!enabled) {
      return { success: true, message: `${category} integration disabled successfully` }
    }

    // Handle different integration categories
    switch (category) {
      case "erp_crm":
        return await handleErpIntegration(userId, service, apiKey)

      case "iot":
        return await handleIoTIntegration(userId, service, apiKey)

      case "bi_tools":
        return await handleBIToolsIntegration(userId, service, apiKey)

      case "ecommerce":
        return await handleEcommerceIntegration(userId, service, apiKey, storeUrl)

      default:
        return {
          success: false,
          message: `Unknown integration category: ${category}`,
        }
    }
  } catch (error: any) {
    console.error(`Error handling ${category} integration:`, error)
    return {
      success: false,
      message: error.message || `Failed to handle ${category} integration`,
    }
  }
}

