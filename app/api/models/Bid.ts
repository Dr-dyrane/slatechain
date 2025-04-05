// app/api/models/Bid.ts

import mongoose, { Schema, Document } from "mongoose";
import { addIdSupport } from "@/lib/utils";

export type BidStatus = "submitted" | "under_review" | "accepted" | "rejected";

export interface IBid extends Document {
	title: string;
	referenceNumber: string;
	description?: string;
	status: BidStatus;
	submissionDate: Date;
	validUntil: Date;
	proposedAmount: number;
	durationInDays: number;
	supplierId: mongoose.Types.ObjectId;
	notes?: string;
	tags?: string[];
	linkedContractId?: mongoose.Types.ObjectId;
	createdBy: mongoose.Types.ObjectId;
	createdAt?: Date;
	updatedAt?: Date;
}

const bidSchema = new Schema<IBid>(
	{
		title: { type: String, required: true },
		referenceNumber: { type: String, required: true, unique: true },
		description: { type: String },
		status: {
			type: String,
			enum: ["submitted", "under_review", "accepted", "rejected"],
			default: "submitted",
		},
		submissionDate: { type: Date, required: true },
		validUntil: { type: Date, required: true },
		proposedAmount: { type: Number, required: true },
		durationInDays: { type: Number, required: true },
		supplierId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Supplier",
			required: true,
		},
		tags: [{ type: String }],
		notes: { type: String },
		linkedContractId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Contract",
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true }
);

addIdSupport(bidSchema);

bidSchema.index({ referenceNumber: 1 }, { unique: true });
bidSchema.index({ supplierId: 1 });

export default mongoose.models.Bid || mongoose.model<IBid>("Bid", bidSchema);
