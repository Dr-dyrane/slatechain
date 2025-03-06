// app/api/models/SupplierDocument.ts

import { addIdSupport } from "@/lib/utils";
import mongoose from "mongoose";

const supplierDocumentSchema = new mongoose.Schema(
	{
		supplierId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Supplier",
			required: true,
			index: true,
		},
		name: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			required: true,
			enum: ["CONTRACT", "CERTIFICATE", "INSURANCE", "COMPLIANCE", "OTHER"],
		},
		url: {
			type: String,
			required: true,
		},
		// Optional reference to a KYC document if this document is also used for KYC
		kycDocumentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "KYCDocument",
			index: true,
		},
		// Additional metadata
		fileSize: Number,
		mimeType: String,
		originalFilename: String,
	},
	{
		timestamps: true,
	}
);

// Add ID support to supplier document schema
addIdSupport(supplierDocumentSchema);

// Create indexes for common queries
supplierDocumentSchema.index({ supplierId: 1, type: 1 });
supplierDocumentSchema.index({ kycDocumentId: 1 });

export default mongoose.models.SupplierDocument ||
	mongoose.model("SupplierDocument", supplierDocumentSchema);
