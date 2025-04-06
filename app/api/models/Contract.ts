// app/api/models/Contract.ts

import mongoose, { Schema, Document } from "mongoose";
import { addIdSupport } from "@/lib/utils";

export type ContractStatus =
	| "draft"
	| "pending"
	| "open"
	| "active"
	| "completed"
	| "expired"
	| "terminated";

export interface IContract extends Document {
	title: string;
	description?: string;
	contractNumber: string;
	status: ContractStatus;
	startDate: Date;
	endDate: Date;
	renewalDate?: Date;
	supplierId?: mongoose.Types.ObjectId;
	version: number;
	notes?: string;
	tags?: string[];
	bidId?: mongoose.Types.ObjectId;
	createdBy: mongoose.Types.ObjectId;
	signedBySupplier?: boolean;
	signedByAdmin?: boolean;
	isTerminated?: boolean;
	terminationReason?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

const contractSchema = new Schema<IContract>(
	{
		title: { type: String, required: true },
		description: { type: String },
		contractNumber: { type: String, required: true, unique: true },
		status: {
			type: String,
			enum: [
				"draft",
				"pending",
				"open",
				"active",
				"completed",
				"expired",
				"terminated",
			],
			default: "draft",
		},
		startDate: { type: Date, required: true },
		endDate: { type: Date, required: true },
		renewalDate: { type: Date },
		supplierId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Supplier",
			required: false,
			index: true,
		},
		version: { type: Number, default: 1 },
		notes: { type: String },
		tags: [{ type: String }],
		bidId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Bid",
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		signedBySupplier: { type: Boolean, default: false },
		signedByAdmin: { type: Boolean, default: false },
		isTerminated: { type: Boolean, default: false },
		terminationReason: { type: String },
	},
	{ timestamps: true }
);

addIdSupport(contractSchema);

contractSchema.index({ contractNumber: 1 }, { unique: true });
contractSchema.index({ supplierId: 1 });

export default mongoose.models.Contract ||
	mongoose.model<IContract>("Contract", contractSchema);
