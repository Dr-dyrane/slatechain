// app/api/models/Shipments.ts

import mongoose from "mongoose";
import { createNotification } from "@/app/actions/notifications";
import { addIdSupport } from "@/lib/utils";

const shipmentSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		orderId: {
			type: String,
			required: true,
			index: true,
		},
		trackingNumber: {
			type: String,
			required: true,
			unique: true,
		},
		carrier: {
			type: String,
			required: true,
		},
		freightId: {
			type: String,
			required: true,
		},
		routeId: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: ["CREATED", "PREPARING", "IN_TRANSIT", "DELIVERED"],
			default: "CREATED",
			index: true,
		},
		destination: {
			type: String,
			required: true,
		},
		estimatedDeliveryDate: {
			type: Date,
			required: true,
		},
		actualDeliveryDate: Date,
		currentLocation: {
			latitude: Number,
			longitude: Number,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
	},
	{
		timestamps: true,
	}
);

// Add ID support to shipment schema
addIdSupport(shipmentSchema);

// Create indexes for common queries
shipmentSchema.index({ status: 1, estimatedDeliveryDate: 1 });
shipmentSchema.index({ carrier: 1 });

// Auto-generate tracking number if not provided
shipmentSchema.pre("save", async function (next) {
	if (this.isNew) {
		const count = await mongoose.models.Shipment.countDocuments();
		this.trackingNumber = `TRK${String(count + 1).padStart(6, "0")}`;
	}
	next();
});

// Notify on status change
shipmentSchema.pre("save", async function (next) {
	if (this.isModified("status") && !this.isNew) {
		const statusMessages = {
			CREATED: "Shipment has been created",
			PREPARING: "Shipment is being prepared",
			IN_TRANSIT: "Shipment is in transit",
			DELIVERED: "Shipment has been delivered",
		};

		await createNotification(
			this.userId.toString(),
			"ORDER_UPDATE",
			`Shipment Status Updated: ${this.trackingNumber}`,
			statusMessages[this.status] || `Status changed to ${this.status}`,
			{
				shipmentId: this._id,
				trackingNumber: this.trackingNumber,
				status: this.status,
			}
		);
	}
	next();
});

export default mongoose.models.Shipment ||
	mongoose.model("Shipment", shipmentSchema);
