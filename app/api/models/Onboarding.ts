// app/api/models/Onboarding.ts

import mongoose, { Document, Schema } from "mongoose";
import { OnboardingStatus, OnboardingStepStatus, UserRole } from "@/lib/types";
import { MAX_STEPS } from "@/lib/constants/onboarding-steps";
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
	}
);

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

// Override toJSON in the schema instead of the interface
OnboardingSchema.methods.toJSON = function () {
	const obj = this.toObject();
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
OnboardingSchema.methods.validateStepData = function (
	stepId: number,
	data: Record<string, any>,
	role: UserRole
) {
	// Add validation logic based on step and role
	return true;
};

// Add method to sync changes with user
OnboardingSchema.methods.syncWithUser = async function () {
	const user = await User.findById(this.userId);
	if (!user) return;

	const updates: Record<string, any> = {
		onboardingStatus: this.status,
	};

	// Sync profile data if it exists
	const profileStep = this.steps.find((step: any) => step.stepId === 1);
	if (profileStep?.data) {
		const { firstName, lastName, phoneNumber } = profileStep.data;
		if (firstName) updates.firstName = firstName;
		if (lastName) updates.lastName = lastName;
		if (phoneNumber) updates.phoneNumber = phoneNumber;
	}

	// Sync integrations if they exist
	const integrationsStep = this.steps.find((step: any) => step.stepId === 3);
	if (integrationsStep?.data) {
		const integrations = integrationsStep.data;
		if (integrations.ecommerce?.enabled) {
			updates["integrations.ecommerce"] = {
				enabled: true,
				service: integrations.ecommerce.config.service || "shopify",
				apiKey: integrations.ecommerce.config.apiKey,
				storeUrl: integrations.ecommerce.config.storeUrl,
			};
		}
		if (integrations.erp_crm?.enabled) {
			updates["integrations.erp_crm"] = {
				enabled: true,
				service: integrations.erp_crm.config.service || "sap",
				apiKey: integrations.erp_crm.config.apiKey,
			};
		}
		if (integrations.iot?.enabled) {
			updates["integrations.iot"] = {
				enabled: true,
				service: "iot_monitoring",
				apiKey: integrations.iot.config.apiKey,
			};
		}
		if (integrations.bi_tools?.enabled) {
			updates["integrations.bi_tools"] = {
				enabled: true,
				service: "power_bi",
				apiKey: integrations.bi_tools.config.apiKey,
			};
		}
	}

	// Sync role-specific data
	if (Object.keys(this.roleSpecificData).length > 0) {
		switch (user.role) {
			case UserRole.ADMIN:
				updates.adminRole = this.roleSpecificData.adminRole;
				updates.department = this.roleSpecificData.department;
				break;
			case UserRole.SUPPLIER:
				updates.companyName = this.roleSpecificData.companyName;
				updates.productCategories = this.roleSpecificData.productCategories;
				updates.shippingMethods = this.roleSpecificData.shippingMethods;
				updates.paymentTerms = this.roleSpecificData.paymentTerms;
				break;
			case UserRole.MANAGER:
				updates.teamName = this.roleSpecificData.teamName;
				updates.teamSize = this.roleSpecificData.teamSize;
				updates.managedDepartments = this.roleSpecificData.managedDepartments;
				break;
			case UserRole.CUSTOMER:
				updates.preferredCategories = this.roleSpecificData.preferredCategories;
				updates.communicationPreference =
					this.roleSpecificData.communicationPreference;
				updates.shippingPreference = this.roleSpecificData.shippingPreference;
				break;
		}
	}

	// Update user with all changes
	await User.findByIdAndUpdate(this.userId, { $set: updates });
};

// Add middleware to sync with user after save
OnboardingSchema.post("save", async (doc) => {
	await doc.syncWithUser();
});

export default mongoose.models.Onboarding ||
	mongoose.model<OnboardingDoc>("Onboarding", OnboardingSchema);
