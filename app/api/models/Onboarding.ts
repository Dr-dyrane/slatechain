// app/api/models/Onboarding.ts

import mongoose, { Document, Schema } from "mongoose";
import { OnboardingStatus, OnboardingStepStatus, UserRole } from "@/lib/types";
import {
	MAX_STEPS,
} from "@/lib/constants/onboarding-steps";
import User from "./User";

// Define the interface for your document (without redefining toJSON)
export interface OnboardingDoc extends Document {
	userId: mongoose.Types.ObjectId;
	status: OnboardingStatus;
	currentStep: number;
	steps: OnboardingStepSchemaType[];
	completedAt?: Date;
	roleSpecificData: any; // Or a more specific type if possible
	cancelled: boolean;
	validateStepData(
		stepId: number,
		data: Record<string, any>,
		role: UserRole
	): boolean;
	syncWithUser(): Promise<void>;
}

const OnboardingStepSchema = new mongoose.Schema({
	stepId: {
		type: Number,
		required: true,
		min: 0,
		max: MAX_STEPS - 1,
	},
	title: {
		type: String,
		required: true,
	},
	status: {
		type: String,
		enum: Object.values(OnboardingStepStatus),
		default: OnboardingStepStatus.NOT_STARTED,
	},
	data: {
		type: mongoose.Schema.Types.Mixed,
		default: {},
	},
	completedAt: {
		type: Date,
	},
	skippedAt: {
		type: Date,
	},
	skipReason: {
		type: String,
	},
});

// Define OnboardingStepSchemaType
export interface OnboardingStepSchemaType {
	stepId: number;
	title: string;
	status: OnboardingStepStatus;
	data: any; // Or a more specific type
	completedAt?: Date;
	skippedAt?: Date;
	skipReason?: string;
}

const OnboardingSchema = new Schema<OnboardingDoc>(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
		status: {
			type: String,
			enum: Object.values(OnboardingStatus),
			default: OnboardingStatus.NOT_STARTED,
		},
		currentStep: {
			type: Number,
			default: 0,
			min: 0,
			max: MAX_STEPS - 1,
		},
		steps: [OnboardingStepSchema],
		completedAt: {
			type: Date,
		},
		roleSpecificData: {
			type: mongoose.Schema.Types.Mixed,
			default: {},
		},
		cancelled: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true }, // Enable virtuals in toJSON
	}
);

// Override toJSON in the schema instead of the interface
OnboardingSchema.methods.toJSON = function () {
	const obj = this.toObject({ virtuals: true }); // Apply virtuals during toObject conversion
	return {
		...obj,
		steps: obj.steps.map((step: OnboardingStepSchemaType) => ({
			id: step.stepId,
			title: step.title,
			status: step.status,
			data: step.data,
			completedAt: step.completedAt,
			skippedAt: step.skippedAt,
			skipReason: step.skipReason,
		})),
	};
};

// Add method to validate step data based on role
OnboardingSchema.methods.validateStepData = (stepId: number, data: Record<string, any>, role: UserRole): boolean => {
	// Always return true to bypass validation
	return true
  }

export default mongoose.models.Onboarding ||
	mongoose.model<OnboardingDoc>("Onboarding", OnboardingSchema);
