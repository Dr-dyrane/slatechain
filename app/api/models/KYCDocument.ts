// app/api/models/KYCDocument.ts

import { mongoose } from "..";
import { addIdSupport } from "@/lib/utils";

export interface IKYCDocument {
	userId: string;
	submissionId?: string; // Linking to a specific KYC submission
	type: string;
	status: "PENDING" | "APPROVED" | "REJECTED";
	url: string;
	originalFilename: string;
	mimeType: string;
	fileSize: number;
	fileKey?: string;
	rejectionReason?: string;
	createdAt: Date;
	updatedAt: Date;
}

const kycDocumentSchema = new mongoose.Schema<IKYCDocument>(
	{
		userId: { type: String, required: true, index: true },
		submissionId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "KYCSubmission",
		},
		type: { type: String, required: true },
		status: {
			type: String,
			enum: ["PENDING", "APPROVED", "REJECTED"],
			default: "PENDING",
		},
		url: { type: String, required: true },
		originalFilename: { type: String, required: true },
		mimeType: { type: String, required: true },
		fileSize: { type: Number, required: true },
		fileKey: String,
		rejectionReason: String,
	},
	{
		timestamps: true,
	}
);

// Add ID support to KYC document schema
addIdSupport(kycDocumentSchema);

kycDocumentSchema.index({ userId: 1 });
kycDocumentSchema.index({ submissionId: 1 });

const KYCDocument =
	mongoose.models.KYCDocument ||
	mongoose.model<IKYCDocument>("KYCDocument", kycDocumentSchema);

export default KYCDocument;
