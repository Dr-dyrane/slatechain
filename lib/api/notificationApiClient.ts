// src/lib/api/notificationApiClient.ts

import type { AxiosRequestConfig } from "axios";
import type { Notification } from "@/lib/types";
import { apiClient } from "./apiClient";

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