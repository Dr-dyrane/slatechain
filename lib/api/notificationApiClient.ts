// src/lib/api/notificationApiClient.ts

import type { AxiosRequestConfig } from "axios";
import type { Notification, NotificationType } from "@/lib/types";
import { apiClient } from "./apiClient/[...live]";

class NotificationApiClient {
	async getNotifications(config?: AxiosRequestConfig): Promise<Notification[]> {
		return apiClient.get<Notification[]>(`/notifications`, config);
	}

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

	async deleteNotification(
		notificationId: string,
		config?: AxiosRequestConfig
	) {
		return apiClient.delete<void>(`/notifications/${notificationId}`, config);
	}

	async createNotification(
		notification: Omit<Notification, "id" | "createdAt">,
		config?: AxiosRequestConfig
	): Promise<Notification> {
		return apiClient.post<Notification>("/notifications", notification, config);
	}

	// New methods for bulk and system notifications
	async createBulkNotifications(
		notifications: Array<Omit<Notification, "id" | "createdAt">>,
		config?: AxiosRequestConfig
	): Promise<{
		success: boolean;
		count: number;
		notifications: Notification[];
	}> {
		return apiClient.post<{
			success: boolean;
			count: number;
			notifications: Notification[];
		}>("/notifications/bulk", { notifications }, config);
	}

	async createSystemNotification(
		type: NotificationType,
		title: string,
		message: string,
		data?: Record<string, any>,
		targetRole?: string,
		config?: AxiosRequestConfig
	): Promise<{ success: boolean; count: number; recipientCount: number }> {
		return apiClient.post<{
			success: boolean;
			count: number;
			recipientCount: number;
		}>(
			"/notifications/system",
			{
				type,
				title,
				message,
				data,
				targetRole,
			},
			config
		);
	}

	async markAllAsRead(
		config?: AxiosRequestConfig
	): Promise<{ success: boolean; count: number }> {
		return apiClient.put<{ success: boolean; count: number }>(
			"/notifications",
			undefined,
			config
		);
	}

	async getUnreadCount(
		config?: AxiosRequestConfig
	): Promise<{ count: number }> {
		return apiClient.get<{ count: number }>("/notifications/unread", config);
	}
}

export const notificationApiClient = new NotificationApiClient();
