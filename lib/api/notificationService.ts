import type { NotificationType } from "@/lib/types"

/**
 * Service for creating notifications from server-side code
 * This can be used in API routes, server actions, or other server-side code
 */
export class NotificationService {
  /**
   * Create a notification for a specific user
   */
  static async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>,
    authToken?: string,
  ) {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/notifications`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId,
          type,
          title,
          message,
          data: data || {},
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create notification: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error creating notification:", error)
      throw error
    }
  }

  /**
   * Create an order update notification
   */
  static async createOrderNotification(
    userId: string,
    orderId: string,
    orderNumber: string,
    status: string,
    authToken?: string,
  ) {
    let title = `Order ${orderNumber} Updated`
    let message = `Your order status has been updated to ${status}`

    if (status === "SHIPPED") {
      title = `Order ${orderNumber} Shipped`
      message = "Your order has been shipped and is on its way!"
    } else if (status === "DELIVERED") {
      title = `Order ${orderNumber} Delivered`
      message = "Your order has been delivered. Enjoy!"
    }

    return this.createNotification(userId, "ORDER_UPDATE", title, message, { orderId, orderNumber, status }, authToken)
  }

  /**
   * Create an inventory alert notification
   */
  static async createInventoryAlert(
    userId: string,
    productId: string,
    productName: string,
    currentStock: number,
    authToken?: string,
  ) {
    return this.createNotification(
      userId,
      "INVENTORY_ALERT",
      "Low Inventory Alert",
      `${productName} is running low on stock (${currentStock} remaining)`,
      { productId, productName, currentStock },
      authToken,
    )
  }

  /**
   * Create an integration status notification
   */
  static async createIntegrationNotification(userId: string, integration: string, status: string, authToken?: string) {
    return this.createNotification(
      userId,
      "INTEGRATION_STATUS",
      `${integration} Integration ${status === "connected" ? "Connected" : "Updated"}`,
      `Your ${integration} integration has been ${status}`,
      { integration, status },
      authToken,
    )
  }
}

