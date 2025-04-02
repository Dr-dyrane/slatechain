import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from "@reduxjs/toolkit";
import type { Notification, NotificationState } from "@/lib/types";
import { notificationApiClient } from "@/lib/api/notificationApiClient";

// Make sure the initialState includes pendingActions
const initialState: NotificationState = {
	notifications: [],
	unreadCount: 0,
	loading: false,
	error: null,
	pendingActions: {
		markAsRead: [],
		delete: [],
	},
	isDeletingAll: false,
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

export const deleteAllNotifications = createAsyncThunk<
	{ success: boolean; count: number },
	void,
	{ rejectValue: string }
>("notifications/deleteAllNotifications", async (_, { rejectWithValue }) => {
	try {
		const result = await notificationApiClient.deleteAllNotifications();

		return result;
	} catch (error: any) {
		return rejectWithValue(
			error.message || "Failed to delete all notifications"
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
			// Fetch notifications
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

			// Mark as read
			// And in the extraReducers section, make sure all the pending/fulfilled/rejected cases
			// safely access and update the pendingActions property:

			// For markNotificationAsRead.pending:
			.addCase(markNotificationAsRead.pending, (state, action) => {
				// Initialize pendingActions if it doesn't exist
				if (!state.pendingActions) {
					state.pendingActions = { markAsRead: [], delete: [] };
				}
				// Add notification ID to pending markAsRead array
				state.pendingActions.markAsRead = [
					...(state.pendingActions.markAsRead || []),
					action.meta.arg,
				];
			})

			// For markNotificationAsRead.fulfilled:
			.addCase(
				markNotificationAsRead.fulfilled,
				(state, action: PayloadAction<Notification>) => {
					const updatedNotification = action.payload;
					state.notifications = state.notifications.map((notification) =>
						notification._id === updatedNotification?._id
							? updatedNotification
							: notification
					);

					// Initialize pendingActions if it doesn't exist
					if (!state.pendingActions) {
						state.pendingActions = { markAsRead: [], delete: [] };
					}

					// Remove notification ID from pending markAsRead array
					state.pendingActions.markAsRead = (
						state.pendingActions.markAsRead || []
					).filter((id) => id !== updatedNotification._id);

					// Update unread count
					if (state.unreadCount > 0) {
						state.unreadCount -= 1;
					}

					state.error = null;
				}
			)

			// For markNotificationAsRead.rejected:
			.addCase(markNotificationAsRead.rejected, (state, action) => {
				// Initialize pendingActions if it doesn't exist
				if (!state.pendingActions) {
					state.pendingActions = { markAsRead: [], delete: [] };
				}

				// Remove notification ID from pending markAsRead array
				state.pendingActions.markAsRead = (
					state.pendingActions.markAsRead || []
				).filter((id) => id !== action.meta.arg);
				state.error = action.payload as string;
			})

			// Do the same for deleteNotification cases:
			.addCase(deleteNotification.pending, (state, action) => {
				// Initialize pendingActions if it doesn't exist
				if (!state.pendingActions) {
					state.pendingActions = { markAsRead: [], delete: [] };
				}
				// Add notification ID to pending delete array
				state.pendingActions.delete = [
					...(state.pendingActions.delete || []),
					action.meta.arg,
				];
			})

			.addCase(
				deleteNotification.fulfilled,
				(state, action: PayloadAction<string>) => {
					const deletedNotificationId = action.payload;

					// Check if the deleted notification was unread
					const deletedNotification = state.notifications.find(
						(notification) => notification._id === deletedNotificationId
					);

					if (
						deletedNotification &&
						!deletedNotification.read &&
						state.unreadCount > 0
					) {
						state.unreadCount -= 1;
					}

					// Remove from notifications array
					state.notifications = state.notifications.filter(
						(notification) => notification._id !== deletedNotificationId
					);

					// Initialize pendingActions if it doesn't exist
					if (!state.pendingActions) {
						state.pendingActions = { markAsRead: [], delete: [] };
					}

					// Remove notification ID from pending delete array
					state.pendingActions.delete = (
						state.pendingActions.delete || []
					).filter((id) => id !== deletedNotificationId);

					state.error = null;
				}
			)

			.addCase(deleteNotification.rejected, (state, action) => {
				// Initialize pendingActions if it doesn't exist
				if (!state.pendingActions) {
					state.pendingActions = { markAsRead: [], delete: [] };
				}

				// Remove notification ID from pending delete array
				state.pendingActions.delete = (
					state.pendingActions.delete || []
				).filter((id) => id !== action.meta.arg);
				state.error = action.payload as string;
			})

			// Mark all as read
			.addCase(markAllNotificationsAsRead.fulfilled, (state) => {
				state.loading = false;
				state.notifications = state.notifications.map((notification) => ({
					...notification,
					read: true,
				}));
				state.unreadCount = 0;
				state.error = null;
			})
			.addCase(markAllNotificationsAsRead.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})

			// Add cases for deleteAllNotifications
			.addCase(deleteAllNotifications.pending, (state) => {
				state.isDeletingAll = true;
				state.error = null;
			})
			.addCase(deleteAllNotifications.fulfilled, (state) => {
				state.isDeletingAll = false;
				state.notifications = [];
				state.unreadCount = 0;
				state.error = null;
			})
			.addCase(deleteAllNotifications.rejected, (state, action) => {
				state.isDeletingAll = false;
				state.error = action.payload as string;
			})

			// Fetch unread count
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
