import Inventory from "@/app/api/models/Inventory"
import User from "@/app/api/models/User"
import ManufacturingOrder from "@/app/api/models/ManufacturingOrder"
import StockMovement from "@/app/api/models/StockMovement"
import { createNotification } from "@/app/actions/notifications"
import integrationService from "@/lib/services/integration-service"

// SAP API endpoints
const SAP_API_ENDPOINTS = {
  INVENTORY: "/api/inventory",
  USERS: "/api/users",
  MANUFACTURING: "/api/manufacturing",
  STOCK_MOVEMENT: "/api/stock-movement",
}

/**
 * Handles ERP/CRM integration (SAP)
 */
export async function handleErpIntegration(userId: string, service: string, apiKey: string) {
  try {
    // Only handle SAP integration for now
    if (service !== "sap") {
      return {
        success: false,
        message: `Unsupported ERP service: ${service}. Currently only SAP is supported.`,
      }
    }

    // Verify the user exists
    const user = await User.findById(userId)
    if (!user) {
      return { success: false, message: "User not found" }
    }

    // Log integration start
    await integrationService.logIntegrationActivity(userId, "erp_crm", service, "INTEGRATION_START", "success")

    // Create SAP API client
    const sapBaseUrl = '/api/webhooks/sap/inventory'
    if (!sapBaseUrl) {
      throw new Error("SAP API base URL not configured")
    }

    const sapClient = integrationService.createAuthClient(apiKey, sapBaseUrl)

    // 1. Sync inventory data with SAP
    const inventoryResult = await syncInventoryWithSAP(userId, sapClient)

    // 2. Sync user data with SAP CRM
    const userResult = await syncUsersWithSAPCRM(userId, sapClient)

    // 3. Sync manufacturing orders with SAP
    const manufacturingResult = await syncManufacturingWithSAP(userId, sapClient)

    // 4. Sync stock movements with SAP
    const stockMovementResult = await syncStockMovementsWithSAP(userId, sapClient)

    // 5. Set up scheduled sync jobs
    await setupSAPSyncJobs(userId, service)

    // 6. Register webhooks for real-time updates
    await setupSAPWebhooks(userId, service)

    // Create notification about the integration
    await createNotification(
      userId,
      "INTEGRATION_SYNC",
      "SAP Integration Active",
      "Your SAP integration is now active. Data will be synchronized automatically.",
      {
        service: "sap",
        inventorySynced: inventoryResult.success,
        usersSynced: userResult.success,
        manufacturingSynced: manufacturingResult.success,
        stockMovementSynced: stockMovementResult.success,
      },
    )

    // Log integration completion
    await integrationService.logIntegrationActivity(userId, "erp_crm", service, "INTEGRATION_COMPLETE", "success", {
      inventorySynced: inventoryResult.success,
      usersSynced: userResult.success,
      manufacturingSynced: manufacturingResult.success,
      stockMovementSynced: stockMovementResult.success,
    })

    return {
      success: true,
      message: "SAP integration activated successfully",
      details: {
        inventory: inventoryResult,
        users: userResult,
        manufacturing: manufacturingResult,
        stockMovement: stockMovementResult,
      },
    }
  } catch (error: any) {
    console.error("Error in ERP integration:", error)

    // Log integration error
    await integrationService.logIntegrationActivity(userId, "erp_crm", service, "INTEGRATION_ERROR", "error", {
      error: error.message,
    })

    return { success: false, message: error.message || "Failed to activate SAP integration" }
  }
}

/**
 * Syncs inventory data with SAP
 */
async function syncInventoryWithSAP(userId: string, sapClient: any) {
  try {
    // Log sync start
    await integrationService.logIntegrationActivity(userId, "erp_crm", "sap", "INVENTORY_SYNC_START", "success")

    // 1. Get inventory items from our database
    const inventoryItems = await Inventory.find({ supplierId: userId })

    // 2. Map our inventory schema to SAP's expected format
    const sapInventoryData = inventoryItems.map((item) => ({
      id: item._id.toString(),
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      minAmount: item.minAmount,
      replenishmentAmount: item.replenishmentAmount,
      warehouseId: item.warehouseId,
      zoneId: item.zoneId,
      price: item.price,
      unitCost: item.unitCost,
      category: item.category,
      description: item.description,
      supplierId: item.supplierId,
    }))

    // 3. Send the data to SAP
    const response = await sapClient.post(SAP_API_ENDPOINTS.INVENTORY, {
      items: sapInventoryData,
      supplierId: userId,
    })

    // 4. Process the response and update our inventory with SAP data
    const sapResponse = response.data

    if (sapResponse.success) {
      // Update each inventory item with SAP data
      for (const sapItem of sapResponse.items) {
        await Inventory.findByIdAndUpdate(sapItem.id, {
          $set: {
            "metadata.syncedWithSAP": true,
            "metadata.lastSAPSync": new Date(),
            "metadata.sapItemId": sapItem.sapId,
            // Update any fields that SAP might have modified
            quantity: sapItem.quantity,
            price: sapItem.price,
            unitCost: sapItem.unitCost,
          },
        })
      }

      // Log sync success
      await integrationService.logIntegrationActivity(userId, "erp_crm", "sap", "INVENTORY_SYNC_COMPLETE", "success", {
        itemCount: inventoryItems.length,
      })

      return {
        success: true,
        message: `Successfully synced ${inventoryItems.length} inventory items with SAP`,
        sapItemIds: sapResponse.items.map((item: any) => item.sapId),
      }
    } else {
      throw new Error(sapResponse.message || "SAP inventory sync failed")
    }
  } catch (error: any) {
    console.error("Error syncing inventory with SAP:", error)

    // Log sync error
    await integrationService.logIntegrationActivity(userId, "erp_crm", "sap", "INVENTORY_SYNC_ERROR", "error", {
      error: error.message,
    })

    return { success: false, message: error.message || "Failed to sync inventory with SAP" }
  }
}

/**
 * Syncs user data with SAP CRM
 */
async function syncUsersWithSAPCRM(userId: string, sapClient: any) {
  try {
    // Log sync start
    await integrationService.logIntegrationActivity(userId, "erp_crm", "sap", "USER_SYNC_START", "success")

    // 1. Get user from our database
    const user = await User.findById(userId)
    if (!user) {
      throw new Error("User not found")
    }

    // 2. Map our user schema to SAP CRM's expected format
    const sapUserData = {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      // Add any other fields needed by SAP CRM
    }

    // 3. Send the data to SAP CRM
    const response = await sapClient.post(SAP_API_ENDPOINTS.USERS, sapUserData)

    // 4. Process the response and update our user with SAP CRM data
    const sapResponse = response.data

    if (sapResponse.success) {
      // Update user with SAP CRM data
      await User.findByIdAndUpdate(userId, {
        $set: {
          "metadata.syncedWithSAPCRM": true,
          "metadata.lastSAPCRMSync": new Date(),
          "metadata.sapUserId": sapResponse.sapUserId,
          // Update any fields that SAP CRM might have modified
        },
      })

      // Log sync success
      await integrationService.logIntegrationActivity(userId, "erp_crm", "sap", "USER_SYNC_COMPLETE", "success")

      return {
        success: true,
        message: "Successfully synced user with SAP CRM",
        sapUserId: sapResponse.sapUserId,
      }
    } else {
      throw new Error(sapResponse.message || "SAP CRM user sync failed")
    }
  } catch (error: any) {
    console.error("Error syncing user with SAP CRM:", error)

    // Log sync error
    await integrationService.logIntegrationActivity(userId, "erp_crm", "sap", "USER_SYNC_ERROR", "error", {
      error: error.message,
    })

    return { success: false, message: error.message || "Failed to sync user with SAP CRM" }
  }
}

/**
 * Syncs manufacturing orders with SAP
 */
async function syncManufacturingWithSAP(userId: string, sapClient: any) {
  try {
    // Log sync start
    await integrationService.logIntegrationActivity(userId, "erp_crm", "sap", "MANUFACTURING_SYNC_START", "success")

    // 1. Get manufacturing orders from our database
    const manufacturingOrders = await ManufacturingOrder.find({ supplierId: userId })

    // 2. Map our manufacturing orders to SAP's expected format
    const sapManufacturingData = manufacturingOrders.map((order) => ({
      id: order._id.toString(),
      name: order.name,
      orderNumber: order.orderNumber,
      inventoryItemId: order.inventoryItemId,
      quantity: order.quantity,
      status: order.status,
      startDate: order.startDate,
      endDate: order.endDate,
      priority: order.priority,
      // Add any other fields needed by SAP
    }))

    // 3. Send the data to SAP
    const response = await sapClient.post(SAP_API_ENDPOINTS.MANUFACTURING, {
      orders: sapManufacturingData,
      supplierId: userId,
    })

    // 4. Process the response and update our manufacturing orders with SAP data
    const sapResponse = response.data

    if (sapResponse.success) {
      // Update each manufacturing order with SAP data
      for (const sapOrder of sapResponse.orders) {
        await ManufacturingOrder.findByIdAndUpdate(sapOrder.id, {
          $set: {
            "metadata.syncedWithSAP": true,
            "metadata.lastSAPSync": new Date(),
            "metadata.sapOrderId": sapOrder.sapId,
            // Update any fields that SAP might have modified
            status: sapOrder.status,
            actualStartDate: sapOrder.actualStartDate,
            actualEndDate: sapOrder.actualEndDate,
          },
        })
      }

      // Log sync success
      await integrationService.logIntegrationActivity(
        userId,
        "erp_crm",
        "sap",
        "MANUFACTURING_SYNC_COMPLETE",
        "success",
        { orderCount: manufacturingOrders.length },
      )

      return {
        success: true,
        message: `Successfully synced ${manufacturingOrders.length} manufacturing orders with SAP`,
        sapOrderIds: sapResponse.orders.map((order : any) => order.sapId),
      }
    } else {
      throw new Error(sapResponse.message || "SAP manufacturing sync failed")
    }
  } catch (error: any) {
    console.error("Error syncing manufacturing orders with SAP:", error)

    // Log sync error
    await integrationService.logIntegrationActivity(userId, "erp_crm", "sap", "MANUFACTURING_SYNC_ERROR", "error", {
      error: error.message,
    })

    return { success: false, message: error.message || "Failed to sync manufacturing orders with SAP" }
  }
}

/**
 * Syncs stock movements with SAP
 */
async function syncStockMovementsWithSAP(userId: string, sapClient: any) {
  try {
    // Log sync start
    await integrationService.logIntegrationActivity(userId, "erp_crm", "sap", "STOCK_MOVEMENT_SYNC_START", "success")

    // 1. Get stock movements from our database
    const stockMovements = await StockMovement.find({ handledBy: userId })

    // 2. Map our stock movements to SAP's expected format
    const sapStockMovementData = stockMovements.map((movement) => ({
      id: movement._id.toString(),
      type: movement.type,
      sourceLocationId: movement.sourceLocationId,
      destinationLocationId: movement.destinationLocationId,
      items: movement.items,
      status: movement.status,
      scheduledDate: movement.scheduledDate,
      completedDate: movement.completedDate,
      handledBy: movement.handledBy,
    }))

    // 3. Send the data to SAP
    const response = await sapClient.post(SAP_API_ENDPOINTS.STOCK_MOVEMENT, {
      movements: sapStockMovementData,
      userId: userId,
    })

    // 4. Process the response and update our stock movements with SAP data
    const sapResponse = response.data

    if (sapResponse.success) {
      // Update each stock movement with SAP data
      for (const sapMovement of sapResponse.movements) {
        await StockMovement.findByIdAndUpdate(sapMovement.id, {
          $set: {
            "metadata.syncedWithSAP": true,
            "metadata.lastSAPSync": new Date(),
            "metadata.sapMovementId": sapMovement.sapId,
            // Update any fields that SAP might have modified
            status: sapMovement.status,
            completedDate: sapMovement.completedDate,
          },
        })
      }

      // Log sync success
      await integrationService.logIntegrationActivity(
        userId,
        "erp_crm",
        "sap",
        "STOCK_MOVEMENT_SYNC_COMPLETE",
        "success",
        { movementCount: stockMovements.length },
      )

      return {
        success: true,
        message: `Successfully synced ${stockMovements.length} stock movements with SAP`,
        sapMovementIds: sapResponse.movements.map((movement :any) => movement.sapId),
      }
    } else {
      throw new Error(sapResponse.message || "SAP stock movement sync failed")
    }
  } catch (error: any) {
    console.error("Error syncing stock movements with SAP:", error)

    // Log sync error
    await integrationService.logIntegrationActivity(userId, "erp_crm", "sap", "STOCK_MOVEMENT_SYNC_ERROR", "error", {
      error: error.message,
    })

    return { success: false, message: error.message || "Failed to sync stock movements with SAP" }
  }
}

/**
 * Sets up scheduled sync jobs for SAP
 */
async function setupSAPSyncJobs(userId: string, service: string) {
  try {
    // Schedule inventory sync job (daily)
    await integrationService.scheduleSync(userId, "erp_crm", service, "INVENTORY", "daily")

    // Schedule manufacturing orders sync job (hourly)
    await integrationService.scheduleSync(userId, "erp_crm", service, "MANUFACTURING", "hourly")

    // Schedule stock movements sync job (hourly)
    await integrationService.scheduleSync(userId, "erp_crm", service, "STOCK_MOVEMENT", "hourly")

    return { success: true, message: "Successfully set up SAP sync jobs" }
  } catch (error: any) {
    console.error("Error setting up SAP sync jobs:", error)
    return { success: false, message: error.message || "Failed to set up SAP sync jobs" }
  }
}

/**
 * Sets up webhooks for real-time SAP updates
 */
async function setupSAPWebhooks(userId: string, service: string) {
  try {
    const webhookSecret = process.env.WEBHOOK_SECRET || "default-webhook-secret"
    const baseUrl = process.env.API_BASE_URL || "http://localhost:3000"

    // Register webhook for inventory updates
    await integrationService.registerWebhook(
      userId,
      "erp_crm",
      service,
      "INVENTORY_UPDATE",
      `${baseUrl}/api/webhooks/sap/inventory`,
      webhookSecret,
    )

    // Register webhook for manufacturing order updates
    await integrationService.registerWebhook(
      userId,
      "erp_crm",
      service,
      "MANUFACTURING_UPDATE",
      `${baseUrl}/api/webhooks/sap/manufacturing`,
      webhookSecret,
    )

    // Register webhook for stock movement updates
    await integrationService.registerWebhook(
      userId,
      "erp_crm",
      service,
      "STOCK_MOVEMENT_UPDATE",
      `${baseUrl}/api/webhooks/sap/stock-movement`,
      webhookSecret,
    )

    return { success: true, message: "Successfully set up SAP webhooks" }
  } catch (error: any) {
    console.error("Error setting up SAP webhooks:", error)
    return { success: false, message: error.message || "Failed to set up SAP webhooks" }
  }
}

