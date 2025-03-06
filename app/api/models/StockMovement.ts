// app/api/models/StockMovement.ts

import { addIdSupport } from "@/lib/utils";
import mongoose from "mongoose";

const stockMovementItemSchema = new mongoose.Schema({
	inventoryItemId: {
		type: String,
		required: true,
	},
	quantity: {
		type: Number,
		required: true,
		min: 1,
	},
	lotNumber: String,
	serialNumber: String,
});

const stockMovementSchema = new mongoose.Schema(
	{
		type: {
			type: String,
			required: true,
			enum: ["RECEIVING", "DISPATCH", "TRANSFER"],
		},
		sourceLocationId: {
			type: String,
			required: true,
		},
		destinationLocationId: {
			type: String,
			required: true,
		},
		items: [stockMovementItemSchema],
		status: {
			type: String,
			required: true,
			enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
			default: "PENDING",
		},
		scheduledDate: {
			type: Date,
			required: true,
		},
		completedDate: Date,
		handledBy: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

// Add ID support to stock movement schema
addIdSupport(stockMovementSchema);

// Create indexes
stockMovementSchema.index({ type: 1, status: 1 });
stockMovementSchema.index({ sourceLocationId: 1 });
stockMovementSchema.index({ destinationLocationId: 1 });
stockMovementSchema.index({ handledBy: 1 });
stockMovementSchema.index({ scheduledDate: 1 });

// Update inventory quantities when movement is completed
stockMovementSchema.pre("save", async function (next) {
	if (
		this.isModified("status") &&
		this.status === "COMPLETED" &&
		!this.completedDate
	) {
		this.completedDate = new Date();

		const Inventory = mongoose.model("Inventory");
		const session = await mongoose.startSession();

		try {
			await session.withTransaction(async () => {
				for (const item of this.items) {
					// Decrease quantity from source
					if (this.type !== "RECEIVING") {
						await Inventory.findOneAndUpdate(
							{ _id: item.inventoryItemId },
							{ $inc: { quantity: -item.quantity } },
							{ session }
						);
					}

					// Increase quantity at destination
					if (this.type !== "DISPATCH") {
						await Inventory.findOneAndUpdate(
							{ _id: item.inventoryItemId },
							{ $inc: { quantity: item.quantity } },
							{ session }
						);
					}
				}
			});
		} finally {
			session.endSession();
		}
	}
	next();
});

export default mongoose.models.StockMovement ||
	mongoose.model("StockMovement", stockMovementSchema);
