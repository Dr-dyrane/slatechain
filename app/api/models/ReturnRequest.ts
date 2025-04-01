// app/api/models/ReturnRequest.ts

import { mongoose } from "..";
import { addIdSupport } from "@/lib/utils";
import { ReturnReason, ReturnType, ReturnRequestStatus } from "@/lib/types";
import type { ReturnRequest as ReturnRequestType } from "@/lib/types";

const returnRequestSchema = new mongoose.Schema(
	{
		returnRequestNumber: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		orderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Order",
			required: true,
			index: true,
		},
		customerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		requestDate: { type: Date, default: Date.now },
		status: {
			type: String,
			enum: Object.values(ReturnRequestStatus),
			default: ReturnRequestStatus.PENDING_APPROVAL,
			index: true,
		},
		returnReason: {
			type: String,
			enum: Object.values(ReturnReason),
			required: true,
		},
		reasonDetails: { type: String },
		proofImages: [{ type: String }],
		preferredReturnType: {
			type: String,
			enum: Object.values(ReturnType),
			required: true,
		},
		reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		reviewDate: { type: Date },
		staffComments: { type: String },
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

addIdSupport(returnRequestSchema);

// Auto-generate returnRequestNumber
returnRequestSchema.pre("save", async function (this: any, next) {
	if (this.isNew) {
		const ReturnRequestModel =
			mongoose.models.ReturnRequest ||
			mongoose.model("ReturnRequest", returnRequestSchema);
		const count = await ReturnRequestModel.countDocuments();
		this.returnRequestNumber = `RTN${String(count + 1).padStart(6, "0")}`;
	}
	next();
});

// Virtuals for population (optional, can be done in API query)
returnRequestSchema.virtual("order", {
	// Example if using ObjectId refs
	ref: "Order",
	localField: "orderId",
	foreignField: "_id",
	justOne: true,
});
returnRequestSchema.virtual("customer", {
	// Example if using ObjectId refs
	ref: "User",
	localField: "customerId",
	foreignField: "_id",
	justOne: true,
});
returnRequestSchema.virtual("returnItems", {
	ref: "ReturnItem",
	localField: "_id",
	foreignField: "returnRequestId",
});
returnRequestSchema.virtual("resolution", {
	ref: "ReturnResolution",
	localField: "_id",
	foreignField: "returnRequestId",
	justOne: true,
});

const ReturnRequest =
	mongoose.models.ReturnRequest ||
	mongoose.model<ReturnRequestType>("ReturnRequest", returnRequestSchema);
export default ReturnRequest;
