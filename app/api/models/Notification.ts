// app/api/models/Notification.ts

import { addIdSupport } from "@/lib/utils";
import { mongoose } from "..";

// Define the notification schema
const notificationSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
			index: true,
		},
		type: {
			type: String,
			enum: [
				"GENERAL",
				"ORDER_UPDATE",
				"INVENTORY_ALERT",
				"INTEGRATION_STATUS",
				"WAREHOUSE_UPDATE",
				"MANUFACTURING_ORDER",
				"STOCK_MOVEMENT",
				"INVENTORY_UPDATE",
				"INTEGRATION_SYNC",
			],
			required: true,
			index: true,
		},
		title: {
			type: String,
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
		data: {
			type: mongoose.Schema.Types.Mixed,
			default: {},
		},
		read: {
			type: Boolean,
			default: false,
			index: true,
		},
		createdBy: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

// Add ID support to notification schema
addIdSupport(notificationSchema);

// Create indexes for common queries
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });

const Notification =
	mongoose.models.Notification ||
	mongoose.model("Notification", notificationSchema);

export default Notification;
