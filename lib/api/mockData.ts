import {
	AuthResponse,
	User,
	OnboardingProgress,
	KYCStatus,
} from "@/lib/types/user";

export const mockApiResponses: Record<string, Record<string, any>> = {
	post: {
		"/auth/register": (data: Partial<User>): User => ({
			id: "user-123",
			firstName: data.firstName || "",
			lastName: data.lastName || "",
			name: `${data.firstName} ${data.lastName}`,
			email: data.email || "",
			phoneNumber: data.phoneNumber || "",
			role: data.role || "user",
			isEmailVerified: false,
			isPhoneVerified: false,
			kycStatus: "PENDING",
			onboardingStatus: "PENDING",
		}),
		"/auth/login": (data: {
			email: string;
			password: string;
		}): AuthResponse => ({
			user: {
				id: "user-123",
				firstName: "John",
				lastName: "Doe",
				name: "John Doe",
				email: data.email,
				phoneNumber: "+1234567890",
				role: "user",
				isEmailVerified: true,
				isPhoneVerified: false,
				kycStatus: "PENDING",
				onboardingStatus: "IN_PROGRESS",
			},
			token: "mock_access_token",
			refreshToken: "mock_refresh_token",
		}),
		"/auth/refresh": () => ({
			token: "new_mock_access_token",
			refreshToken: "new_mock_refresh_token",
		}),
		"/kyc/start": (): KYCStatus => ({
			status: "IN_PROGRESS",
			documents: {},
		}),
		"/kyc/documents": (data: FormData) => ({
			documentId: "doc-123",
			type: data.get("type"),
			status: "PENDING",
			documentUrl: "https://example.com/document.pdf",
		}),
		"/onboarding/start": (): OnboardingProgress => ({
			currentStep: 0,
			completedSteps: [],
		}),
		"/onboarding/steps": (data: { stepId: number; stepData: any }) => ({
			stepId: data.stepId,
			status: "COMPLETED",
		}),
	},
	get: {
		"/users/me": (): User => ({
			id: "user-123",
			firstName: "John",
			lastName: "Doe",
			name: "John Doe",
			email: "john@example.com",
			phoneNumber: "+1234567890",
			role: "user",
			isEmailVerified: true,
			isPhoneVerified: false,
			kycStatus: "PENDING",
			onboardingStatus: "IN_PROGRESS",
		}),
		"/kyc/status": (): KYCStatus => ({
			status: "IN_PROGRESS",
			documents: {
				ID_CARD: "https://example.com/id_card.pdf",
				UTILITY_BILL: "https://example.com/utility_bill.pdf",
			},
		}),
		"/onboarding/progress": (): OnboardingProgress => ({
			currentStep: 2,
			completedSteps: [0, 1],
		}),
	},
	put: {
		"/users/me/profile": (data: Partial<User>): User => ({
			...mockApiResponses.get["/users/me"](),
			...data,
		}),
	},
};
