import Inventory from "@/app/api/models/Inventory"
import User from "@/app/api/models/User"
import { createNotification } from "@/app/actions/notifications"
import integrationService from "@/lib/services/integration-service"
import axios from "axios"

// Shopify API endpoints
const SHOPIFY_API_VERSION = "2023-07"
const SHOPIFY_API_ENDPOINTS = {
  PRODUCTS: "/admin/api/{version}/products.json",
  ORDERS: "/admin/api/{version}/orders.json",
  SHOP: "/admin/api/{version}/shop.json",
  WEBHOOKS: "/admin/api/{version}/webhooks.json",
  INVENTORY_LEVELS: "/admin/api/{version}/inventory_levels.json",
  INVENTORY_ITEMS: "/admin/api/{version}/inventory_items.json",
}

/**
 * Handles Ecommerce integration (Shopify)
 */
export async function handleEcommerceIntegration(userId: string, service: string, apiKey: string, storeUrl?: string) {
  try {
    // Only handle Shopify integration for now
    if (service !== "shopify") {
      return {
        success: false,
        message: `Unsupported ecommerce service: ${service}. Currently only Shopify is supported.`,
      }
    }

    // Verify the user exists
    const user = await User.findById(userId)
    if (!user) {
      return { success: false, message: "User not found" }
    }

    // Check if store URL is provided
    if (!storeUrl) {
      return { success: false, message: "Store URL is required for Shopify integration" }
    }

    // Log integration start
    await integrationService.logIntegrationActivity(userId, "ecommerce", service, "INTEGRATION_START", "success")

    // Create Shopify API client
    const shopifyClient = createShopifyClient(apiKey, storeUrl)

    // 1. Verify Shopify credentials by fetching shop details
    const shopResult = await verifyShopifyCredentials(shopifyClient)

    // 2. Sync inventory with Shopify
    const inventoryResult = await syncInventoryWithShopify(userId, shopifyClient)

    // 3. Set up order synchronization
    const orderResult = await setupOrderSynchronization(userId, shopifyClient, storeUrl)

    // 4. Set up scheduled sync jobs
    await setupShopifySyncJobs(userId, service)

    // 5. Register webhooks for real-time updates
    await setupShopifyWebhooks(userId, service, apiKey, storeUrl)

    // Create notification about the integration
    await createNotification(
      userId,
      "INTEGRATION_SYNC",
      "Shopify Integration Active",
      "Your Shopify integration is now active. Inventory and orders will be synchronized automatically.",
      {
        service: "shopify",
        shopName: shopResult.shop.name,
        inventorySynced: inventoryResult.success,
        orderSyncSetup: orderResult.success,
      },
    )

    // Log integration completion
    await integrationService.logIntegrationActivity(userId, "ecommerce", service, "INTEGRATION_COMPLETE", "success", {
      shopName: shopResult.shop.name,
      inventorySynced: inventoryResult.success,
      orderSyncSetup: orderResult.success,
    })

    return {
      success: true,
      message: "Shopify integration activated successfully",
      details: {
        shop: shopResult,
        inventory: inventoryResult,
        orders: orderResult,
      },
    }
  } catch (error: any) {
    console.error("Error in Ecommerce integration:", error)

    // Log integration error
    await integrationService.logIntegrationActivity(userId, "ecommerce", service, "INTEGRATION_ERROR", "error", {
      error: error.message,
    })

    return { success: false, message: error.message || "Failed to activate Shopify integration" }
  }
}

/**
 * Creates a Shopify API client
 */
function createShopifyClient(apiKey: string, storeUrl: string) {
  // Ensure storeUrl is properly formatted
  const baseUrl = storeUrl.endsWith("/") ? storeUrl.slice(0, -1) : storeUrl

  return axios.create({
    baseURL: baseUrl,
    headers: {
      "X-Shopify-Access-Token": apiKey,
      "Content-Type": "application/json",
    },
  })
}

/**
 * Verifies Shopify credentials by fetching shop details
 */
async function verifyShopifyCredentials(shopifyClient: any) {
  try {
    const endpoint = SHOPIFY_API_ENDPOINTS.SHOP.replace("{version}", SHOPIFY_API_VERSION)
    const response = await shopifyClient.get(endpoint)

    return {
      success: true,
      shop: response.data.shop,
    }
  } catch (error: any) {
    console.error("Error verifying Shopify credentials:", error)
    throw new Error(`Failed to verify Shopify credentials: ${error.message}`)
  }
}

/**
 * Syncs inventory with Shopify
 */
async function syncInventoryWithShopify(userId: string, shopifyClient: any) {
  try {
    // Log sync start
    await integrationService.logIntegrationActivity(userId, "ecommerce", "shopify", "INVENTORY_SYNC_START", "success")

    // 1. Get inventory items from our database
    const inventoryItems = await Inventory.find({ supplierId: userId })

    // 2. Get existing products from Shopify
    const productsEndpoint = SHOPIFY_API_ENDPOINTS.PRODUCTS.replace("{version}", SHOPIFY_API_VERSION)
    const existingProductsResponse = await shopifyClient.get(productsEndpoint)
    const existingProducts = existingProductsResponse.data.products

    // Create a map of SKU to Shopify product ID
    const skuToProductMap = {}
    for (const product of existingProducts) {
      for (const variant of product.variants) {
        if (variant.sku) {
          skuToProductMap[variant.sku] = {
            productId: product.id,
            variantId: variant.id,
            inventoryItemId: variant.inventory_item_id,
          }
        }
      }
    }

    // 3. Process each inventory item
    const results = []

    for (const item of inventoryItems) {
      try {
        let shopifyProductId
        let shopifyVariantId
        let shopifyInventoryItemId

        // Check if product already exists in Shopify
        if (skuToProductMap[item.sku]) {
          // Update existing product
          shopifyProductId = skuToProductMap[item.sku].productId
          shopifyVariantId = skuToProductMap[item.sku].variantId
          shopifyInventoryItemId = skuToProductMap[item.sku].inventoryItemId

          // Update product details
          await shopifyClient.put(`${productsEndpoint.replace(".json", "")}/${shopifyProductId}.json`, {
            product: {
              id: shopifyProductId,
              title: item.name,
              body_html: item.description,
              variants: [
                {
                  id: shopifyVariantId,
                  price: item.price.toString(),
                  sku: item.sku,
                },
              ],
            },
          })
        } else {
          // Create new product
          const newProductResponse = await shopifyClient.post(productsEndpoint, {
            product: {
              title: item.name,
              body_html: item.description,
              vendor: "SlateChain",
              product_type: item.category,
              variants: [
                {
                  price: item.price.toString(),
                  sku: item.sku,
                  inventory_management: "shopify",
                },
              ],
            },
          })

          const newProduct = newProductResponse.data.product
          shopifyProductId = newProduct.id
          shopifyVariantId = newProduct.variants[0].id
          shopifyInventoryItemId = newProduct.variants[0].inventory_item_id
        }

        // Update inventory levels
        const inventoryLevelsEndpoint = SHOPIFY_API_ENDPOINTS.INVENTORY_LEVELS.replace("{version}", SHOPIFY_API_VERSION)
        await shopifyClient.post(inventoryLevelsEndpoint, {
          inventory_level: {
            inventory_item_id: shopifyInventoryItemId,
            location_id: process.env.SHOPIFY_LOCATION_ID, // You need to get this from Shopify
            available: item.quantity,
          },
        })

        // Update our inventory item with Shopify IDs
        await Inventory.findByIdAndUpdate(item._id, {
          $set: {
            "metadata.syncedWithShopify": true,
            "metadata.lastShopifySync": new Date(),
            "metadata.shopifyProductId": shopifyProductId,
            "metadata.shopifyVariantId": shopifyVariantId,
            "metadata.shopifyInventoryItemId": shopifyInventoryItemId,
          },
        })

        results.push({
          inventoryId: item._id,
          sku: item.sku,
          name: item.name,
          shopifyProductId,
          shopifyVariantId,
          shopifyInventoryItemId,
          success: true,
        })
      } catch (itemError) {
        console.error(`Error syncing inventory item ${item.sku}:`, itemError)
        results.push({
          inventoryId: item._id,
          sku: item.sku,
          name: item.name,
          success: false,
          error: itemError.message,
        })
      }
    }

    // Log sync success
    await integrationService.logIntegrationActivity(
      userId,
      "ecommerce",
      "shopify",
      "INVENTORY_SYNC_COMPLETE",
      "success",
      {
        totalItems: inventoryItems.length,
        successCount: results.filter((r) => r.success).length,
        failureCount: results.filter((r) => !r.success).length,
      },
    )

    return {
      success: true,
      message: `Successfully synced ${results.filter((r) => r.success).length} of ${inventoryItems.length} inventory items with Shopify`,
      results,
    }
  } catch (error: any) {
    console.error("Error syncing inventory with Shopify:", error)

    // Log sync error
    await integrationService.logIntegrationActivity(userId, "ecommerce", "shopify", "INVENTORY_SYNC_ERROR", "error", {
      error: error.message,
    })

    return { success: false, message: error.message || "Failed to sync inventory with Shopify" }
  }
}

/**
 * Sets up order synchronization with Shopify
 */
async function setupOrderSynchronization(userId: string, shopifyClient: any, storeUrl: string) {
  try {
    // Log order sync setup start
    await integrationService.logIntegrationActivity(userId, "ecommerce", "shopify", "ORDER_SYNC_SETUP_START", "success")

    // 1. Set up webhooks to receive order notifications from Shopify
    const webhooksEndpoint = SHOPIFY_API_ENDPOINTS.WEBHOOKS.replace("{version}", SHOPIFY_API_VERSION)
    const baseUrl = '/api'

    // Create webhook for order creation
    const orderCreateWebhookResponse = await shopifyClient.post(webhooksEndpoint, {
      webhook: {
        topic: "orders/create",
        address: `${baseUrl}/api/webhooks/shopify/orders/create`,
        format: "json",
      },
    })

    // Create webhook for order updates
    const orderUpdateWebhookResponse = await shopifyClient.post(webhooksEndpoint, {
      webhook: {
        topic: "orders/updated",
        address: `${baseUrl}/api/webhooks/shopify/orders/update`,
        format: "json",
      },
    })

    // Create webhook for order cancellation
    const orderCancelWebhookResponse = await shopifyClient.post(webhooksEndpoint, {
      webhook: {
        topic: "orders/cancelled",
        address: `${baseUrl}/api/webhooks/shopify/orders/cancel`,
        format: "json",
      },
    })

    // Create webhook for inventory updates
    const inventoryUpdateWebhookResponse = await shopifyClient.post(webhooksEndpoint, {
      webhook: {
        topic: "inventory_levels/update",
        address: `${baseUrl}/api/webhooks/shopify/inventory/update`,
        format: "json",
      },
    })

    // 2. Store webhook IDs in user metadata
    await User.findByIdAndUpdate(userId, {
      $set: {
        "metadata.shopifyOrderSync": {
          enabled: true,
          lastSetup: new Date(),
          webhooks: {
            orderCreate: orderCreateWebhookResponse.data.webhook.id,
            orderUpdate: orderUpdateWebhookResponse.data.webhook.id,
            orderCancel: orderCancelWebhookResponse.data.webhook.id,
            inventoryUpdate: inventoryUpdateWebhookResponse.data.webhook.id,
          },
          syncFrequency: "realtime",
        },
      },
    })

    // Log order sync setup success
    await integrationService.logIntegrationActivity(
      userId,
      "ecommerce",
      "shopify",
      "ORDER_SYNC_SETUP_COMPLETE",
      "success",
      {
        webhooksCreated: 4,
      },
    )

    return {
      success: true,
      message: "Successfully set up order synchronization with Shopify",
      webhooks: {
        orderCreate: orderCreateWebhookResponse.data.webhook.id,
        orderUpdate: orderUpdateWebhookResponse.data.webhook.id,
        orderCancel: orderCancelWebhookResponse.data.webhook.id,
        inventoryUpdate: inventoryUpdateWebhookResponse.data.webhook.id,
      },
    }
  } catch (error: any) {
    console.error("Error setting up order synchronization with Shopify:", error)

    // Log order sync setup error
    await integrationService.logIntegrationActivity(userId, "ecommerce", "shopify", "ORDER_SYNC_SETUP_ERROR", "error", {
      error: error.message,
    })

    return { success: false, message: error.message || "Failed to set up order synchronization with Shopify" }
  }
}

/**
 * Sets up scheduled sync jobs for Shopify
 */
async function setupShopifySyncJobs(userId: string, service: string) {
  try {
    // Schedule inventory sync job (hourly)
    await integrationService.scheduleSync(userId, "ecommerce", service, "INVENTORY", "hourly")

    // Schedule order sync job (hourly)
    await integrationService.scheduleSync(userId, "ecommerce", service, "ORDERS", "hourly")

    return { success: true, message: "Successfully set up Shopify sync jobs" }
  } catch (error: any) {
    console.error("Error setting up Shopify sync jobs:", error)
    return { success: false, message: error.message || "Failed to set up Shopify sync jobs" }
  }
}

/**
 * Sets up webhooks for Shopify updates
 */
async function setupShopifyWebhooks(userId: string, service: string, apiKey: string, storeUrl: string) {
  try {
    const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET || "default-webhook-secret"
    const baseUrl = '/api'

    // Register webhook for order creation
    await integrationService.registerWebhook(
      userId,
      "ecommerce",
      service,
      "ORDER_CREATE",
      `${baseUrl}/api/webhooks/shopify/orders/create`,
      webhookSecret,
    )

    // Register webhook for order updates
    await integrationService.registerWebhook(
      userId,
      "ecommerce",
      service,
      "ORDER_UPDATE",
      `${baseUrl}/api/webhooks/shopify/orders/update`,
      webhookSecret,
    )

    // Register webhook for order cancellation
    await integrationService.registerWebhook(
      userId,
      "ecommerce",
      service,
      "ORDER_CANCEL",
      `${baseUrl}/api/webhooks/shopify/orders/cancel`,
      webhookSecret,
    )

    // Register webhook for inventory updates
    await integrationService.registerWebhook(
      userId,
      "ecommerce",
      service,
      "INVENTORY_UPDATE",
      `${baseUrl}/api/webhooks/shopify/inventory/update`,
      webhookSecret,
    )

    return { success: true, message: "Successfully set up Shopify webhooks" }
  } catch (error: any) {
    console.error("Error setting up Shopify webhooks:", error)
    return { success: false, message: error.message || "Failed to set up Shopify webhooks" }
  }
}

