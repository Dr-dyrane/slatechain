// app/api/models/ManufacturingOrder.ts

import mongoose from "mongoose";
import { addIdSupport } from "@/lib/utils";

// Create schema for quality parameters
const qualityParameterSchema = new mongoose.Schema({
	name: String,
	expected: mongoose.Schema.Types.Mixed,
	actual: mongoose.Schema.Types.Mixed,
	tolerance: Number,
	passed: Boolean,
	type: {
		type: String,
		enum: ["NUMBER", "STRING", "BOOLEAN"],
	},
});

// Add ID support to quality parameter schema
addIdSupport(qualityParameterSchema);

const qualityCheckSchema = new mongoose.Schema({
	type: {
		type: String,
		required: true,
	},
	status: {
		type: String,
		required: true,
		enum: ["PENDING", "PASSED", "FAILED"],
	},
	checkedBy: String,
	checkedAt: Date,
	parameters: [qualityParameterSchema],
	notes: String,
});

// Add ID support to quality check schema
addIdSupport(qualityCheckSchema);

// Create schema for bill of materials items
const bomItemSchema = new mongoose.Schema({
	materialId: String,
	quantity: Number,
	unit: String,
	wastageAllowance: Number,
});

// Add ID support to BOM item schema
addIdSupport(bomItemSchema);

const manufacturingOrderSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		orderNumber: {
			type: String,
			required: true,
			unique: true,
		},
		inventoryItemId: {
			type: String,
			required: true,
			index: true,
		},
		quantity: {
			type: Number,
			required: true,
			min: 1,
		},
		status: {
			type: String,
			required: true,
			enum: ["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
			default: "PLANNED",
		},
		startDate: {
			type: Date,
			required: true,
		},
		endDate: {
			type: Date,
			required: true,
		},
		actualStartDate: Date,
		actualEndDate: Date,
		priority: {
			type: String,
			required: true,
			enum: ["LOW", "MEDIUM", "HIGH"],
		},
		qualityChecks: [qualityCheckSchema],
		billOfMaterials: {
			materials: [bomItemSchema],
			laborHours: Number,
			machineHours: Number,
			instructions: String,
			version: String,
		},
	},
	{
		timestamps: true,
	}
);

// Add ID support to manufacturing order schema
addIdSupport(manufacturingOrderSchema);

// Create indexes
manufacturingOrderSchema.index({ status: 1 });
manufacturingOrderSchema.index({ startDate: 1 });
manufacturingOrderSchema.index({ endDate: 1 });
manufacturingOrderSchema.index({ priority: 1 });

// Auto-generate order number
manufacturingOrderSchema.pre("save", async function (next) {
	if (this.isNew) {
		const count = await mongoose.models.ManufacturingOrder.countDocuments();
		this.orderNumber = `MO${String(count + 1).padStart(5, "0")}`;
	}
	next();
});

export default mongoose.models.ManufacturingOrder ||
	mongoose.model("ManufacturingOrder", manufacturingOrderSchema);
