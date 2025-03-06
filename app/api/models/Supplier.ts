// app/api/models/Supplier.ts

import { addIdSupport } from "@/lib/utils";
import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			index: true,
		},
		contactPerson: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			index: true,
		},
		phoneNumber: {
			type: String,
			required: true,
		},
		address: {
			type: String,
			required: true,
		},
		rating: {
			type: Number,
			min: 0,
			max: 5,
			default: 0,
		},
		status: {
			type: String,
			enum: ["ACTIVE", "INACTIVE"],
			default: "ACTIVE",
			index: true,
		},
		// Link to the user account (supplier is a user with supplier role)
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
			index: true,
		},
		// Managers assigned to this supplier
		assignedManagers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				index: true,
			},
		],
	},
	{
		timestamps: true,
	}
);

// Add ID support to supplier schema
addIdSupport(supplierSchema);

// Create indexes for common queries
supplierSchema.index({ name: 1, status: 1 });
supplierSchema.index({ assignedManagers: 1 });

export default mongoose.models.Supplier ||
	mongoose.model("Supplier", supplierSchema);
