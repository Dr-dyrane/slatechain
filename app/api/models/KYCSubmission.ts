// app/api/models/KYCSubmission.ts

import { mongoose } from "..";
import { type KYCDocument, UserRole } from "@/lib/types";
import { addIdSupport } from "@/lib/utils";

export interface IKYCSubmission {
	id?: string;
	userId: string;
	referenceId: string;
	fullName: string;
	dateOfBirth: string;
	address: string;
	role: UserRole;
	companyName?: string;
	taxId?: string;
	department?: string;
	employeeId?: string;
	teamSize?: string;
	customerType?: string;
	status: "PENDING" | "APPROVED" | "REJECTED";
	reviewedBy?: string;
	reviewedAt?: Date;
	rejectionReason?: string;
	createdAt: Date;
	updatedAt: Date;
	documents: KYCDocument[];
}

const kycSubmissionSchema = new mongoose.Schema<IKYCSubmission>(
	{
		userId: { type: String, required: true, index: true },
		referenceId: { type: String, required: true, unique: true },
		fullName: { type: String, required: true },
		dateOfBirth: { type: String, required: true },
		address: { type: String, required: true },
		role: {
			type: String,
			enum: Object.values(UserRole),
			required: true,
		},
		companyName: String,
		taxId: String,
		department: String,
		employeeId: String,
		teamSize: String,
		customerType: String,
		status: {
			type: String,
			enum: ["PENDING", "APPROVED", "REJECTED"],
			default: "PENDING",
		},
		reviewedBy: {
			type: String,
			ref: "User",
		},
		reviewedAt: Date,
		rejectionReason: String,
	},
	{
		timestamps: true,
	}
);

// Add ID support to KYC submission schema
addIdSupport(kycSubmissionSchema);

kycSubmissionSchema.index({ userId: 1 });
kycSubmissionSchema.index({ referenceId: 1 });

const KYCSubmission =
	mongoose.models.KYCSubmission ||
	mongoose.model<IKYCSubmission>("KYCSubmission", kycSubmissionSchema);

export default KYCSubmission;
