// src/lib/api/notificationApiClient.ts
import { apiClient } from "./apiClient"; // Assuming your existing API client
import { AxiosRequestConfig } from "axios";
import { Notification } from "@/lib/types";

class NotificationApiClient {
	async getNotifications(
		config?: AxiosRequestConfig
	): Promise<Notification[]> {
		return apiClient.get<Notification[]>(
			`/notifications`,
			config
		);
	}

	async markAsRead(
		notificationId: string,
		config?: AxiosRequestConfig
	): Promise<Notification> {
		return apiClient.put<Notification>(
			`/notifications/${notificationId}/read`,
			undefined,
			config
		); // Or send { read: true } as data if needed
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
}

export const notificationApiClient = new NotificationApiClient();
