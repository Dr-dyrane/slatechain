// app/api/models/Warehouse.ts

import mongoose from "mongoose";
import { addIdSupport } from "@/lib/utils";

// Schema for warehouse zones
const warehouseZoneSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: true,
		enum: ["BULK", "PICKING", "COLD_STORAGE", "HAZMAT", "RETURNS"],
	},
	capacity: {
		type: Number,
		required: true,
		min: 0,
	},
	currentOccupancy: {
		type: Number,
		required: true,
		default: 0,
		min: 0,
	},
	temperature: Number,
	humidity: Number,
	restrictions: [String],
});

// Add ID support to zone schema
addIdSupport(warehouseZoneSchema);

// Main warehouse schema
const warehouseSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
		},
		location: {
			type: String,
			required: true,
		},
		capacity: {
			type: Number,
			required: true,
			min: 0,
		},
		utilizationPercentage: {
			type: Number,
			required: true,
			default: 0,
			min: 0,
			max: 100,
		},
		zones: [warehouseZoneSchema],
		status: {
			type: String,
			required: true,
			enum: ["ACTIVE", "INACTIVE", "MAINTENANCE"],
			default: "ACTIVE",
		},
		createdBy: {
			type: String,
			required: true,
			index: true,
		},
	},
	{
		timestamps: true,
	}
);

// Add ID support to warehouse schema
addIdSupport(warehouseSchema);

// Create indexes
warehouseSchema.index({ location: 1 });
warehouseSchema.index({ status: 1 });
warehouseSchema.index({ "zones.type": 1 });

// Update utilization percentage when zones change
warehouseSchema.pre("save", function (next) {
	if (this.zones && this.zones.length > 0) {
		const totalOccupancy = this.zones.reduce(
			(sum, zone) => sum + zone.currentOccupancy,
			0
		);
		this.utilizationPercentage = Math.round(
			(totalOccupancy / this.capacity) * 100
		);
	}
	next();
});

export default mongoose.models.Warehouse ||
	mongoose.model("Warehouse", warehouseSchema);
