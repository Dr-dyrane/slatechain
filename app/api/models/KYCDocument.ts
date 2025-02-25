// app/api/models/KYCDocument.ts

import { mongoose } from ".."

export interface IKYCDocument {
  userId: string
  type: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  url: string
  originalFilename: string
  mimeType: string
  fileSize: number
  fileKey?: string
  rejectionReason?: string
  createdAt: Date
  updatedAt: Date
}

const kycDocumentSchema = new mongoose.Schema<IKYCDocument>(
  {
    userId: { type: String, required: true, index: true },
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
  },
)

const KYCDocument = mongoose.models.KYCDocument || mongoose.model<IKYCDocument>("KYCDocument", kycDocumentSchema)

export default KYCDocument

