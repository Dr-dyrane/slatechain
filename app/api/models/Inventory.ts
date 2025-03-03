// ap/api/models/Inventory.ts

import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			index: true,
		},
		sku: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		quantity: {
			type: Number,
			required: true,
			min: 0,
			default: 0,
		},
		minAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		replenishmentAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		warehouseId: {
			type: String,
			required: true,
			index: true,
		},
		zoneId: {
			type: String,
			required: true,
		},
		lotNumber: String,
		expirationDate: Date,
		serialNumber: String,
		price: {
			type: Number,
			required: true,
			min: 0,
		},
		unitCost: {
			type: Number,
			required: true,
			min: 0,
		},
		category: {
			type: String,
			required: true,
			index: true,
		},
		description: String,
		supplierId: {
			type: String,
			required: true,
			index: true,
		},
		location: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

// Create compound indexes
inventorySchema.index({ warehouseId: 1, zoneId: 1 });
inventorySchema.index({ category: 1, quantity: 1 });
inventorySchema.index({ supplierId: 1, sku: 1 });

// Add middleware to check stock levels and create notifications
inventorySchema.post("save", async (doc) => {
	if (doc.quantity <= doc.minAmount) {
		const { createNotification } = await import("@/app/actions/notifications");
		await createNotification(
			doc.supplierId,
			"INVENTORY_ALERT",
			"Low Stock Alert",
			`${doc.name} (SKU: ${doc.sku}) is running low on stock. Current quantity: ${doc.quantity}`,
			{
				itemId: doc._id,
				sku: doc.sku,
				currentQuantity: doc.quantity,
				minAmount: doc.minAmount,
			}
		);
	}
});

export default mongoose.models.Inventory ||
	mongoose.model("Inventory", inventorySchema);
