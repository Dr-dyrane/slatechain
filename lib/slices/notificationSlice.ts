// src/lib/slices/notificationSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Notification, NotificationState } from "@/lib/types"; //Import
import { notificationApiClient } from "@/lib/api/notificationApiClient";

const initialState: NotificationState = {
	notifications: [],
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
			const notification = await notificationApiClient.markAsRead(
				notificationId
			);
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
			const newNotification = await notificationApiClient.createNotification(
				notification
			);
			return newNotification;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(
				error.message || "Failed to create notification"
			);
		}
	}
);

// Create Notification Slice
const notificationSlice = createSlice({
	name: "notifications",
	initialState,
	reducers: {
		//Example to clear notifcation on log out
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
					// Update the notification in the state
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
					// Delete the notification in the state
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
					// Add the notification in the state
					state.loading = false;
					const newNotification = action.payload;
					state.notifications = [...state.notifications, newNotification];
					state.error = null;
				}
			)
			.addCase(createNotification.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});
	},
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
