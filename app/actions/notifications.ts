"use server";

import { connectToDatabase } from "@/app/api";
import Notification from "@/app/api/models/Notification";
import type { NotificationType } from "@/lib/types";
import { revalidatePath } from "next/cache";

/**
 * Create a notification using server actions
 */
export async function createNotification(
	userId: string,
	type: NotificationType,
	title: string,
	message: string,
	data?: Record<string, any>
) {
	try {
		await connectToDatabase();

		const notification = await Notification.create({
			userId,
			type,
			title,
			message,
			data: data || {},
			read: false,
		});

		// Revalidate relevant paths to update UI
		revalidatePath("/dashboard");
		revalidatePath("/notifications");

		return { success: true, notification };
	} catch (error) {
		console.error("Error creating notification:", error);
		return { success: false, error: "Failed to create notification" };
	}
}

/**
 * Create an order update notification
 */
export async function createOrderNotification(
	userId: string,
	orderId: string,
	orderNumber: string,
	status: string
) {
	let title = `Order ${orderNumber} Updated`;
	let message = `Your order status has been updated to ${status}`;

	if (status === "SHIPPED") {
		title = `Order ${orderNumber} Shipped`;
		message = "Your order has been shipped and is on its way!";
	} else if (status === "DELIVERED") {
		title = `Order ${orderNumber} Delivered`;
		message = "Your order has been delivered. Enjoy!";
	}

	return createNotification(userId, "ORDER_UPDATE", title, message, {
		orderId,
		orderNumber,
		status,
	});
}

/**
 * Create an inventory alert notification
 */
export async function createInventoryAlert(
	userId: string,
	productId: string,
	productName: string,
	currentStock: number,
	threshold: number
) {
	return createNotification(
		userId,
		"INVENTORY_ALERT",
		"Low Inventory Alert",
		`${productName} is running low on stock (${currentStock}/${threshold} remaining)`,
		{ productId, productName, currentStock, threshold }
	);
}

/**
 * Create an integration status notification
 */
export async function createIntegrationNotification(
	userId: string,
	integration: string,
	status: "connected" | "disconnected" | "error",
	details?: string
) {
	const title = `Integration ${status.charAt(0).toUpperCase() + status.slice(1)}`;
	const message =
		details || `Your ${integration} integration has been ${status}`;

	return createNotification(userId, "INTEGRATION_STATUS", title, message, {
		integration,
		status,
		details,
	});
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
	try {
		await connectToDatabase();

		const notification = await Notification.findByIdAndUpdate(
			notificationId,
			{ read: true },
			{ new: true }
		);

		if (!notification) {
			return { success: false, error: "Notification not found" };
		}

		revalidatePath("/dashboard");
		revalidatePath("/notifications");

		return { success: true, notification };
	} catch (error) {
		console.error("Error marking notification as read:", error);
		return { success: false, error: "Failed to mark notification as read" };
	}
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string) {
	try {
		await connectToDatabase();

		const notification = await Notification.findByIdAndDelete(notificationId);

		if (!notification) {
			return { success: false, error: "Notification not found" };
		}

		revalidatePath("/dashboard");
		revalidatePath("/notifications");

		return { success: true };
	} catch (error) {
		console.error("Error deleting notification:", error);
		return { success: false, error: "Failed to delete notification" };
	}
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
	try {
		await connectToDatabase();

		const result = await Notification.updateMany(
			{ userId, read: false },
			{ read: true }
		);

		revalidatePath("/dashboard");
		revalidatePath("/notifications");

		return { success: true, count: result.modifiedCount };
	} catch (error) {
		console.error("Error marking all notifications as read:", error);
		return { success: false, error: "Failed to mark notifications as read" };
	}
}

/**
 * Get unread notifications count for a user
 */
export async function getUnreadNotificationsCount(userId: string) {
	try {
		await connectToDatabase();

		const count = await Notification.countDocuments({ userId, read: false });
		return { success: true, count };
	} catch (error) {
		console.error("Error getting unread count:", error);
		return { success: false, error: "Failed to get unread count" };
	}
}
