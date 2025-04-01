// app/api/models/ReturnResolution.ts
import { mongoose } from "..";
import { addIdSupport } from "@/lib/utils";
import { ReturnResolutionStatus, ReturnType } from "@/lib/types";
import type { ReturnResolution as ReturnResolutionType } from "@/lib/types";

const returnResolutionSchema = new mongoose.Schema(
	{
		returnRequestId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "ReturnRequest",
			required: true,
			unique: true,
			index: true,
		},
		status: {
			type: String,
			enum: Object.values(ReturnResolutionStatus),
			default: ReturnResolutionStatus.PENDING,
			index: true,
		},
		resolutionType: {
			type: String,
			enum: Object.values(ReturnType),
			required: true,
		},
		resolvedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		resolutionDate: { type: Date, default: Date.now },
		notes: { type: String },
		// --- Resolution specific fields ---
		refundAmount: { type: Number, min: 0 },
		refundTransactionId: { type: String },
		replacementOrderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Order",
			index: true,
		}, // Link to the NEW replacement order
		storeCreditAmount: { type: Number, min: 0 },
		storeCreditCode: { type: String },
		exchangeNotes: { type: String },
	},
	{ timestamps: true }
);

addIdSupport(returnResolutionSchema);

const ReturnResolution =
	mongoose.models.ReturnResolution ||
	mongoose.model<ReturnResolutionType>(
		"ReturnResolution",
		returnResolutionSchema
	);
export default ReturnResolution;
