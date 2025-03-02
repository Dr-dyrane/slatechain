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
export const fetchNotifications = createAsyncThunk<
	Notification[],
	void,
	{ rejectValue: string }
>("notifications/fetchNotifications", async (_, { rejectWithValue }) => {
	try {
		const notifications = await notificationApiClient.getNotifications();
		return notifications || [];
	} catch (error: any) {
		return rejectWithValue(error.message || "Failed to fetch notifications");
	}
});

export const markNotificationAsRead = createAsyncThunk<
	Notification,
	string,
	{ rejectValue: string }
>(
	"notifications/markNotificationAsRead",
	async (notificationId, { rejectWithValue }) => {
		try {
			return await notificationApiClient.markAsRead(notificationId);
		} catch (error: any) {
			return rejectWithValue(
				error.message || "Failed to mark notification as read"
			);
		}
	}
);

export const deleteNotification = createAsyncThunk<
	string,
	string,
	{ rejectValue: string }
>(
	"notifications/deleteNotification",
	async (notificationId, { rejectWithValue }) => {
		try {
			await notificationApiClient.deleteNotification(notificationId);
			return notificationId;
		} catch (error: any) {
			return rejectWithValue(error.message || "Failed to delete notification");
		}
	}
);

export const markAllNotificationsAsRead = createAsyncThunk<
	{ success: boolean; count: number },
	void,
	{ rejectValue: string }
>("notifications/markAllAsRead", async (_, { rejectWithValue }) => {
	try {
		const result = await notificationApiClient.markAllAsRead();
		return result;
	} catch (error: any) {
		return rejectWithValue(
			error.message || "Failed to mark all notifications as read"
		);
	}
});

export const fetchUnreadCount = createAsyncThunk<
	number,
	void,
	{ rejectValue: string }
>("notifications/fetchUnreadCount", async (_, { rejectWithValue }) => {
	try {
		const result = await notificationApiClient.getUnreadCount();
		return result.count;
	} catch (error: any) {
		return rejectWithValue(error.message || "Failed to fetch unread count");
	}
});

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
				(state, action: PayloadAction<Notification[] | undefined>) => {
					state.loading = false;
					state.notifications = action.payload || [];
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
						notification.id === updatedNotification?.id
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
					state.unreadCount = action.payload || 0;
					state.error = null;
				}
			)
			.addCase(fetchUnreadCount.rejected, (state, action) => {
				state.error = action.payload as string;
				state.unreadCount = 0;
			});
	},
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
