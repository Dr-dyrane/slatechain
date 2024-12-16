// src/lib/api/mockData.ts

import {
	AuthResponse,
	User,
	OnboardingProgress,
	KYCStatus,
	KYCDocument,
	UserRole,
	OnboardingStatus,
	OnboardingStep,
	InventoryItem,
	Order,
	OrderItem,
} from "@/lib/types";

export const mockApiResponses: Record<string, Record<string, any>> = {
	post: {
		"/auth/register": (data: Partial<User>): AuthResponse => ({
			user: {
				id: "user-123",
				firstName: data.firstName || "",
				lastName: data.lastName || "",
				name: `${data.firstName} ${data.lastName}`,
				email: data.email || "",
				phoneNumber: data.phoneNumber || "",
				role: (data.role as UserRole) || UserRole.CUSTOMER,
				isEmailVerified: false,
				isPhoneVerified: false,
				kycStatus: KYCStatus.PENDING_REVIEW,
				onboardingStatus: OnboardingStatus.PENDING,
			},
			accessToken: "mock_access_token",
			refreshToken: "mock_refresh_token",
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
				role: UserRole.CUSTOMER,
				isEmailVerified: true,
				isPhoneVerified: false,
				kycStatus: KYCStatus.PENDING_REVIEW,
				onboardingStatus: OnboardingStatus.IN_PROGRESS,
			},
			accessToken: "mock_access_token",
			refreshToken: "mock_refresh_token",
		}),
		"/auth/refresh": (): AuthResponse => ({
			user: mockApiResponses.get["/users/me"](),
			accessToken: "new_mock_access_token",
			refreshToken: "new_mock_refresh_token",
		}),
		"/auth/logout": () => ({ success: true }),
		"/kyc/start": (): KYCStatus => KYCStatus.IN_PROGRESS,
		"/kyc/documents": (data: FormData): KYCDocument => ({
			id: "doc-123",
			type: data.get("type") as string,
			status: "PENDING",
			uploadedAt: new Date().toISOString(),
			url: "https://example.com/document.pdf",
		}),
		"/kyc/submit": (data: any): { status: KYCStatus; referenceId: string } => ({
			status: KYCStatus.PENDING_REVIEW,
			referenceId: "kyc-ref-123",
		}),
		"/onboarding/start": (): OnboardingProgress => ({
			currentStep: 0,
			completedSteps: [],
			completed: false,
		}),
		"/onboarding/steps": (data: {
			stepId: number;
			stepData: any;
		}): OnboardingStep => ({
			id: data.stepId,
			title: `Step ${data.stepId}`,
			status: "COMPLETED",
		}),
		"/onboarding/complete": (): { success: boolean; completedAt: string } => ({
			success: true,
			completedAt: new Date().toISOString(),
		}),
		"/inventory": (data: Omit<InventoryItem, "id">): InventoryItem => ({
			...data,
			id: Math.random(),
		}),
		"/orders": (
			data: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">
		): Order => ({
			...data,
			id: Math.random(),
			orderNumber: `ORD${Math.floor(10000 + Math.random() * 90000)}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}),
	},
	get: {
		"/auth/me": {
			user: {
				id: "12345",
				firstName: "John",
				lastName: "Doe",
				name: "John Doe",
				email: "johndoe@example.com",
				phoneNumber: "123-456-7890",
				role: "customer", // UserRole.CUSTOMER
				isEmailVerified: true,
				isPhoneVerified: true,
				kycStatus: "APPROVED", // KYCStatus.APPROVED
				onboardingStatus: "COMPLETED", // OnboardingStatus.COMPLETED
				avatarUrl: "https://example.com/avatar.jpg",
			},
			accessToken: "mock-access-token",
			refreshToken: "mock-refresh-token",
		},
		"/users/me": (): User => ({
			id: "user-123",
			firstName: "John",
			lastName: "Doe",
			name: "John Doe",
			email: "john@example.com",
			phoneNumber: "+1234567890",
			role: UserRole.CUSTOMER,
			isEmailVerified: true,
			isPhoneVerified: false,
			kycStatus: KYCStatus.PENDING_REVIEW,
			onboardingStatus: OnboardingStatus.IN_PROGRESS,
		}),
		"/kyc/status": (): { status: KYCStatus; documents: KYCDocument[] } => ({
			status: KYCStatus.IN_PROGRESS,
			documents: [
				{
					id: "doc-1",
					type: "ID_CARD",
					status: "PENDING",
					uploadedAt: "2023-05-01T12:00:00Z",
					url: "https://example.com/id_card.pdf",
				},
				{
					id: "doc-2",
					type: "UTILITY_BILL",
					status: "PENDING",
					uploadedAt: "2023-05-01T12:05:00Z",
					url: "https://example.com/utility_bill.pdf",
				},
			],
		}),
		"/onboarding/progress": (): OnboardingProgress => ({
			currentStep: 2,
			completedSteps: [0, 1],
			completed: false,
		}),
		"/inventory": (): InventoryItem[] => [
			{
				id: 1,
				name: "Product A",
				sku: "SKU001",
				quantity: 100,
				location: "Warehouse 1",
				price: 10,
				category: "Electronics",
				supplierId: "user-123",
			},
			{
				id: 2,
				name: "Product B",
				sku: "SKU002",
				quantity: 150,
				location: "Warehouse 2",
				price: 20,
				category: "Clothing",
				supplierId: "user-123",
			},
			{
				id: 3,
				name: "Product C",
				sku: "SKU003",
				quantity: 75,
				location: "Warehouse 1",
				price: 30,
				category: "Books",
				supplierId: "user-123",
			},
			{
				id: 4,
				name: "Product D",
				sku: "SKU004",
				quantity: 200,
				location: "Warehouse 2",
				price: 50,
				category: "Other",
				supplierId: "user-456",
			},
		],
		"/orders": (): Order[] => [
			{
				id: 1,
				orderNumber: "ORD12345",
				customerId: "user-123",
				items: [
					{
						productId: "product-1",
						quantity: 2,
						price: 100,
					},
					{
						productId: "product-2",
						quantity: 1,
						price: 50,
					},
				],
				totalAmount: 250,
				status: "PROCESSING",
				createdAt: "2024-07-26T10:00:00Z",
				updatedAt: "2024-07-26T10:30:00Z",
			},
			{
				id: 2,
				orderNumber: "ORD67890",
				customerId: "user-456",
				items: [
					{
						productId: "product-3",
						quantity: 3,
						price: 20,
					},
					{
						productId: "product-4",
						quantity: 1,
						price: 30,
					},
				],
				totalAmount: 90,
				status: "PENDING",
				createdAt: "2024-07-27T14:00:00Z",
				updatedAt: "2024-07-27T14:15:00Z",
			},
			{
				id: 3,
				orderNumber: "ORD67910",
				customerId: "user-789",
				items: [
					{
						productId: "product-5",
						quantity: 3,
						price: 20,
					},
					{
						productId: "product-6",
						quantity: 1,
						price: 30,
					},
				],
				totalAmount: 60,
				status: "PENDING",
				createdAt: "2024-07-27T14:00:00Z",
				updatedAt: "2024-07-27T14:15:00Z",
			},
		],
		"/orders/:id": (id: number): Order =>
			mockApiResponses.get["/orders"]().find((order: Order) => order.id === id),
	},
	put: {
		"/users/me/profile": (data: Partial<User>): User => ({
			...mockApiResponses.get["/users/me"](),
			...data,
		}),
		"/inventory/:id": (data: InventoryItem): InventoryItem => {
			return data;
		},
		"/orders/:id": (data: Order): Order => {
			return data;
		},
	},
	delete: {
		"/inventory/:id": (id: number) => ({ success: true, deletedId: id }),
		"/orders/:id": (id: number) => ({ success: true, deletedId: id }),
	},
};
