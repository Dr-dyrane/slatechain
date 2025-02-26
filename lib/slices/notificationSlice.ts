// src/lib/slices/notificationSlice.ts

import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from "@reduxjs/toolkit";
import type { Notification, NotificationState } from "@/lib/types";
import { notificationApiClient } from "@/lib/api/notificationApiClient";

const initialState: NotificationState = {
	notifications: [],
	unreadCount: 0,
	loading: false,
	error: null,
};

// Async Thunks
export const fetchNotifications = createAsyncThunk(
	"notifications/fetchNotifications",
	async (_, thunkAPI) => {
		try {
			const notifications = await notificationApiClient.getNotifications();
			return notifications;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to fetch notifications"
			);
		}
	}
);

export const markNotificationAsRead = createAsyncThunk(
	"notifications/markNotificationAsRead",
	async (notificationId: string, thunkAPI) => {
		try {
			const notification =
				await notificationApiClient.markAsRead(notificationId);
			return notification;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to mark notification as read"
			);
		}
	}
);

export const deleteNotification = createAsyncThunk(
	"notifications/deleteNotification",
	async (notificationId: string, thunkAPI) => {
		try {
			await notificationApiClient.deleteNotification(notificationId);
			return notificationId;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to delete notification"
			);
		}
	}
);

export const createNotification = createAsyncThunk(
	"notifications/createNotification",
	async (notification: Omit<Notification, "id" | "createdAt">, thunkAPI) => {
		try {
			const newNotification =
				await notificationApiClient.createNotification(notification);
			return newNotification;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to create notification"
			);
		}
	}
);

export const markAllNotificationsAsRead = createAsyncThunk(
	"notifications/markAllAsRead",
	async (_, thunkAPI) => {
		try {
			const result = await notificationApiClient.markAllAsRead();
			return result;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to mark all notifications as read"
			);
		}
	}
);

export const fetchUnreadCount = createAsyncThunk(
	"notifications/fetchUnreadCount",
	async (_, thunkAPI) => {
		try {
			const result = await notificationApiClient.getUnreadCount();
			return result.count;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to fetch unread count"
			);
		}
	}
);

// Create Notification Slice
const notificationSlice = createSlice({
	name: "notifications",
	initialState,
	reducers: {
		clearNotifications: (state) => {
			state.notifications = [];
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchNotifications.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(
				fetchNotifications.fulfilled,
				(state, action: PayloadAction<Notification[]>) => {
					state.loading = false;
					state.notifications = action.payload;
					state.error = null;
				}
			)
			.addCase(fetchNotifications.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(
				markNotificationAsRead.fulfilled,
				(state, action: PayloadAction<Notification>) => {
					state.loading = false;
					const updatedNotification = action.payload;
					state.notifications = state.notifications.map((notification) =>
						notification.id === updatedNotification.id
							? updatedNotification
							: notification
					);
					state.error = null;
				}
			)
			.addCase(markNotificationAsRead.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(
				deleteNotification.fulfilled,
				(state, action: PayloadAction<string>) => {
					state.loading = false;
					const deletedNotificationId = action.payload;
					state.notifications = state.notifications.filter(
						(notification) => notification.id !== deletedNotificationId
					);
					state.error = null;
				}
			)
			.addCase(deleteNotification.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(
				createNotification.fulfilled,
				(state, action: PayloadAction<Notification>) => {
					state.loading = false;
					const newNotification = action.payload;
					state.notifications = [...state.notifications, newNotification];
					state.error = null;
				}
			)
			.addCase(createNotification.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(markAllNotificationsAsRead.fulfilled, (state) => {
				state.loading = false;
				state.notifications = state.notifications.map((notification) => ({
					...notification,
					read: true,
				}));
				state.error = null;
			})
			.addCase(markAllNotificationsAsRead.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(
				fetchUnreadCount.fulfilled,
				(state, action: PayloadAction<number>) => {
					state.unreadCount = action.payload;
					state.error = null;
				}
			)
			.addCase(fetchUnreadCount.rejected, (state, action) => {
				state.error = action.payload as string;
			});
	},
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
