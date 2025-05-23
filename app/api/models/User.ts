// app/api/models/User.ts
import {
	UserRole,
	KYCStatus,
	OnboardingStatus,
	type UserIntegrations,
} from "@/lib/types";
import bcrypt from "bcryptjs";
import { mongoose } from "..";

// supplier metadata interface
interface SupplierMetadata {
	address?: string;
	rating?: number;
	status?: string;
}

// address interface
interface UserAddress {
	address1: string;
	address2?: string;
	city: string;
	state?: string;
	country: string;
	postalCode?: string;
	phone?: string;
}

// 2FA interface
interface TwoFactorAuth {
	enabled: boolean;
	phoneNumber?: string;
	secret?: string;
	backupCodes?: string[];
	lastVerified?: Date;
}

export interface IUser {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	phoneNumber?: string;
	role: UserRole;
	isEmailVerified: boolean;
	isPhoneVerified: boolean;
	kycStatus: KYCStatus;
	onboardingStatus: OnboardingStatus;
	avatarUrl?: string;
	integrations: UserIntegrations;
	refreshToken?: string;
	assignedManagers?: string[];
	supplierMetadata?: SupplierMetadata;
	address?: UserAddress;
	twoFactorAuth?: TwoFactorAuth;
	createdAt: Date;
	updatedAt: Date;
	blockchain?: {
		walletAddress?: string;
		registeredAt?: Date;
	};
}

const userAddressSchema = new mongoose.Schema({
	address1: { type: String, required: true },
	address2: { type: String },
	city: { type: String, required: true },
	state: { type: String },
	country: { type: String, required: true },
	postalCode: { type: String },
	phone: { type: String },
});

const twoFactorAuthSchema = new mongoose.Schema({
	enabled: { type: Boolean, default: false },
	phoneNumber: { type: String },
	secret: { type: String },
	backupCodes: [{ type: String }],
	lastVerified: { type: Date },
});

const userSchema = new mongoose.Schema<IUser>(
	{
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		phoneNumber: String,
		role: {
			type: String,
			enum: Object.values(UserRole),
			default: UserRole.CUSTOMER,
		},
		isEmailVerified: { type: Boolean, default: false },
		isPhoneVerified: { type: Boolean, default: false },
		kycStatus: {
			type: String,
			enum: Object.values(KYCStatus),
			default: KYCStatus.NOT_STARTED,
		},
		onboardingStatus: {
			type: String,
			enum: Object.values(OnboardingStatus),
			default: OnboardingStatus.NOT_STARTED,
		},
		avatarUrl: String,
		integrations: {
			type: Object,
			default: {},
		},
		refreshToken: String,
		assignedManagers: {
			type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
			default: [],
		},
		supplierMetadata: {
			type: {
				address: { type: String, default: "" },
				rating: { type: Number, default: 3, min: 0, max: 5 },
				status: {
					type: String,
					enum: ["ACTIVE", "INACTIVE"],
					default: "ACTIVE",
				},
			},
			default: () => ({
				address: "",
				rating: 3,
				status: "ACTIVE",
			}),
		},
		address: {
			type: userAddressSchema,
			required: false,
		},
		twoFactorAuth: {
			type: twoFactorAuthSchema,
			default: () => ({
				enabled: false,
			}),
		},
		blockchain: {
			walletAddress: { type: String, sparse: true, unique: true },
			registeredAt: Date,
		},
	},
	{
		timestamps: true,
	}
);

// Hash password before saving
userSchema.pre("save", async function (next) {
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 10);
	}
	next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (
	candidatePassword: string
): Promise<boolean> {
	return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate auth JSON
userSchema.methods.toAuthJSON = function () {
	return {
		id: this._id,
		firstName: this.firstName,
		lastName: this.lastName,
		name: `${this.firstName} ${this.lastName}`,
		email: this.email,
		phoneNumber: this.phoneNumber,
		role: this.role,
		isEmailVerified: this.isEmailVerified,
		isPhoneVerified: this.isPhoneVerified,
		kycStatus: this.kycStatus,
		onboardingStatus: this.onboardingStatus,
		avatarUrl: this.avatarUrl,
		integrations: this.integrations,
		assignedManagers: this.assignedManagers || [],
		supplierMetadata: this.supplierMetadata || {
			address: "",
			rating: 3,
			status: "ACTIVE",
		},
		address: this.address || {
			address1: "No Address Provided",
			address2: "",
			city: "Unknown",
			state: "",
			country: "Unknown",
			postalCode: "",
			phone: "",
		},
		twoFactorAuth: {
			enabled: this.twoFactorAuth?.enabled || false,
			phoneNumber: this.twoFactorAuth?.phoneNumber || null,
		},
		createdAt: this.createdAt,
		updatedAt: this.updatedAt,
		blockchain: this.blockchain || null,
	};
};

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
