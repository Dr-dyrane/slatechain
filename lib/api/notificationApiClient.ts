// src/lib/api/notificationApiClient.ts

import type { AxiosRequestConfig } from "axios";
import type { Notification } from "@/lib/types";
import { apiClient } from "./apiClient/[...live]";

class NotificationApiClient {
	// Get a list of notifications
	async getNotifications(config?: AxiosRequestConfig): Promise<Notification[]> {
		return apiClient.get<Notification[]>(`/notifications`, config);
	}

	// Mark a notification as read
	async markAsRead(
		notificationId: string,
		config?: AxiosRequestConfig
	): Promise<Notification> {
		return apiClient.put<Notification>(
			`/notifications/${notificationId}/read`,
			undefined,
			config
		);
	}

	// Delete a single notification
	async deleteNotification(
		notificationId: string,
		config?: AxiosRequestConfig
	) {
		return apiClient.delete<void>(`/notifications/${notificationId}`, config);
	}

	// Mark all notifications as read
	async markAllAsRead(
		config?: AxiosRequestConfig
	): Promise<{ success: boolean; count: number }> {
		return apiClient.put<{ success: boolean; count: number }>(
			"/notifications",
			undefined,
			config
		);
	}

	// Get unread notifications count
	async getUnreadCount(
		config?: AxiosRequestConfig
	): Promise<{ count: number }> {
		return apiClient.get<{ count: number }>("/notifications/unread", config);
	}

	// Delete all notifications
	async deleteAllNotifications(
		config?: AxiosRequestConfig
	): Promise<{ success: boolean; count: number }> {
		return apiClient.delete<{ success: boolean; count: number }>(
			"/notifications",
			config
		);
	}
}

export const notificationApiClient = new NotificationApiClient();
