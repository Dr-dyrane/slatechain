// app/actions/notifications.ts

"use server"

import { connectToDatabase } from "@/app/api"
import Notification from "@/app/api/models/Notification"
import type { NotificationType } from "@/lib/types"
import { revalidatePath } from "next/cache"

/**
 * Create a notification using server actions
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, any>,
) {
  try {
    await connectToDatabase()

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data: data || {},
      read: false,
    })

    // Revalidate relevant paths to update UI
    revalidatePath("/dashboard")

    return { success: true, notification }
  } catch (error) {
    console.error("Error creating notification:", error)
    return { success: false, error: "Failed to create notification" }
  }
}

/**
 * Create an order update notification
 */
export async function createOrderNotification(userId: string, orderId: string, orderNumber: string, status: string) {
  let title = `Order ${orderNumber} Updated`
  let message = `Your order status has been updated to ${status}`

  if (status === "SHIPPED") {
    title = `Order ${orderNumber} Shipped`
    message = "Your order has been shipped and is on its way!"
  } else if (status === "DELIVERED") {
    title = `Order ${orderNumber} Delivered`
    message = "Your order has been delivered. Enjoy!"
  }

  return createNotification(userId, "ORDER_UPDATE", title, message, { orderId, orderNumber, status })
}

/**
 * Create an inventory alert notification
 */
export async function createInventoryAlert(
  userId: string,
  productId: string,
  productName: string,
  currentStock: number,
) {
  return createNotification(
    userId,
    "INVENTORY_ALERT",
    "Low Inventory Alert",
    `${productName} is running low on stock (${currentStock} remaining)`,
    { productId, productName, currentStock },
  )
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    await connectToDatabase()

    const notification = await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true })

    if (!notification) {
      return { success: false, error: "Notification not found" }
    }

    revalidatePath("/dashboard")

    return { success: true, notification }
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return { success: false, error: "Failed to mark notification as read" }
  }
}

