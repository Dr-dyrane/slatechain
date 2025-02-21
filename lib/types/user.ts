export interface User {
	id: string;
	firstName: string;
	lastName: string;
	name: string;
	email: string;
	phoneNumber: string;
	role: string;
	isEmailVerified: boolean;
	isPhoneVerified: boolean;
	kycStatus: "IN_PROGRESS" | "PENDING" | "APPROVED" | "REJECTED";
	onboardingStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED";
	avatarUrl?: string;
	createdAt: string;
	updatedAt: string;
	integrations: UserIntegrations;
}

export interface UserIntegrations {
	shopify: ShopifyIntegrationSettings;
}

export interface ShopifyIntegrationSettings {
	enabled: boolean;
	apiKey: string | null;
	storeUrl: string | null;
}

export interface AuthResponse {
	user: User;
	token: string;
	refreshToken: string;
}

export interface KYCStatus {
	status: "IN_PROGRESS" | "PENDING" | "APPROVED" | "REJECTED";
	documents: {
		[key: string]: string;
	};
}

export interface OnboardingProgress {
	currentStep: number;
	completedSteps: number[];
}
