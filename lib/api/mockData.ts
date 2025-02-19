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
	Shipment,
	Supplier,
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
				role: (data.role as UserRole) || UserRole.ADMIN,
				isEmailVerified: false,
				isPhoneVerified: false,
				kycStatus: KYCStatus.PENDING_REVIEW,
				onboardingStatus: OnboardingStatus.PENDING,
				avatarUrl: data.avatarUrl || "",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
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
				role: UserRole.ADMIN,
				isEmailVerified: true,
				isPhoneVerified: false,
				kycStatus: KYCStatus.PENDING_REVIEW,
				onboardingStatus: OnboardingStatus.IN_PROGRESS,
				avatarUrl: "/placeholder.svg",
				createdAt: "2023-01-01T00:00:00Z",
				updatedAt: "2023-01-01T00:00:00Z",
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
		"/auth/google": (): AuthResponse => ({
			user: mockApiResponses.get["/users/me"](),
			accessToken: "new_mock_access_token",
			refreshToken: "new_mock_refresh_token",
		}),
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
			id: Math.floor(Math.random() * 100),
		}),
		"/orders": (
			data: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">
		): Order => ({
			...data,
			id: Math.floor(Math.random() * 100),
			orderNumber: `ORD${Math.floor(10000 + Math.random() * 90000)}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}),
		"/shipments": (data: Omit<Shipment, "id">): Shipment => ({
			...data,
			id: Math.floor(Math.random() * 100).toString(),
		}),
		"/suppliers": (data: Omit<Supplier, "id">): Supplier => ({
			...data,
			id: Math.floor(Math.random() * 100).toString(),
		}),
		"/auth/password/change": (data: any) => {
			return { success: true };
		},
		"/auth/password/forgot": (data: any) => {
			return {
				success: true,
				code: Math.floor(100000 + Math.random() * 900000).toString(),
			};
		},
		"/auth/password/reset": () => {
			return { success: true };
		},
		"/users": (data: Omit<User, "id">): User => {
			return {
				...data,
				id: Math.random().toString(),
			};
		},
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
				role: "admin", // UserRole.ADMIN
				isEmailVerified: true,
				isPhoneVerified: true,
				kycStatus: "APPROVED", // KYCStatus.APPROVED
				onboardingStatus: "COMPLETED", // OnboardingStatus.COMPLETED
				avatarUrl: "https://example.com/avatar.jpg",
			},
			accessToken: "mock-access-token",
			refreshToken: "mock-refresh-token",
		},
		"/users/me": (): User => mockApiResponses.get["/auth/me"].user,
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
				minAmount: 50,
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
				minAmount: 100,
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
				minAmount: 25,
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
				minAmount: 75,
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
					{ productId: "product-1", quantity: 2, price: 100 },
					{ productId: "product-2", quantity: 1, price: 50 },
				],
				totalAmount: 250,
				status: "PROCESSING",
				paid: true, // NEW: Tracks payment status
				createdAt: "2024-07-26T10:00:00Z",
				updatedAt: "2024-07-26T10:30:00Z",
			},
			{
				id: 2,
				orderNumber: "ORD67890",
				customerId: "user-124",
				items: [
					{ productId: "product-3", quantity: 3, price: 20 },
					{ productId: "product-4", quantity: 1, price: 30 },
				],
				totalAmount: 90,
				status: "PENDING",
				paid: false, // NEW: Unpaid order
				createdAt: "2024-07-27T14:00:00Z",
				updatedAt: "2024-07-27T14:15:00Z",
			},
			{
				id: 3,
				orderNumber: "ORD67910",
				customerId: "user-125",
				items: [
					{ productId: "product-5", quantity: 3, price: 20 },
					{ productId: "product-6", quantity: 1, price: 30 },
				],
				totalAmount: 60,
				status: "PENDING",
				paid: false,
				createdAt: "2024-07-27T14:00:00Z",
				updatedAt: "2024-07-27T14:15:00Z",
			},
		],
		"/orders/:id": (id: number): Order =>
			mockApiResponses.get["/orders"]().find((order: Order) => order.id === id),
		"/shipments": (): Shipment[] => [
			{
				id: "1",
				orderId: "1",
				trackingNumber: "TN12345",
				carrier: "DHL",
				status: "IN_TRANSIT",
				destination: "Los Angeles",
				estimatedDeliveryDate: "2024-08-01T12:00:00Z",
			},
			{
				id: "2",
				orderId: "2",
				trackingNumber: "TN67890",
				carrier: "FedEx",
				status: "DELIVERED",
				destination: "Miami",
				estimatedDeliveryDate: "2024-07-29T10:00:00Z",
				actualDeliveryDate: "2024-07-29T09:45:00Z",
			},
			{
				id: "3",
				orderId: "3",
				trackingNumber: "TN11223",
				carrier: "USPS",
				status: "PREPARING",
				destination: "Boston",
				estimatedDeliveryDate: "2024-08-05T12:00:00Z",
			},
		],
		"/suppliers": (): Supplier[] => [
			{
				id: "1",
				name: "Acme Corp",
				contactPerson: "Jane Smith",
				email: "jane.smith@acmecorp.com",
				phoneNumber: "+15551112222",
				address: "123 Main St, Anytown",
				rating: 4.5,
				status: "ACTIVE",
				createdAt: "2023-01-01T00:00:00Z",
				updatedAt: "2023-01-01T00:00:00Z",
			},
			{
				id: "2",
				name: "Beta Industries",
				contactPerson: "Bob Johnson",
				email: "bob.johnson@betaindustries.com",
				phoneNumber: "+15553334444",
				address: "456 Elm St, Somecity",
				rating: 3.8,
				status: "ACTIVE",
				createdAt: "2023-02-15T00:00:00Z",
				updatedAt: "2023-02-15T00:00:00Z",
			},
			{
				id: "3",
				name: "Gamma Supplies",
				contactPerson: "Alice Brown",
				email: "alice.brown@gammasupplies.com",
				phoneNumber: "+15555556666",
				address: "789 Oak St, Othertown",
				rating: 4.2,
				status: "INACTIVE",
				createdAt: "2023-03-30T00:00:00Z",
				updatedAt: "2023-03-30T00:00:00Z",
			},
		],
		"/users": (): User[] => [
			mockApiResponses.get["/users/me"](),
			{
				id: "user-456",
				firstName: "Jane",
				lastName: "Smith",
				name: "Jane Smith",
				email: "janesmith@example.com",
				phoneNumber: "123-456-7891",
				role: "admin", // UserRole.CUSTOMER
				isEmailVerified: true,
				isPhoneVerified: true,
				kycStatus: "APPROVED", // KYCStatus.APPROVED
				onboardingStatus: "COMPLETED", // OnboardingStatus.COMPLETED
				avatarUrl: "https://example.com/avatar.jpg",
			},
		],
		"/kpis": () => ({
			cardData: [
				{
					title: "Total Revenue",
					icon: "DollarSign",
					value: "$45,231.89",
					description: "+20.1% from last month",
					type: "revenue",
					sparklineData: [10, 15, 12, 18, 20, 25, 22, 28, 30, 35, 32, 40],
				},
				{
					title: "Inventory Items",
					icon: "CreditCard",
					value: "+2,350",
					description: "+180.1% from last month",
					type: "number",
					sparklineData: null,
				},
				{
					title: "Active Orders",
					icon: "Activity",
					value: "+573",
					description: "+201 since last hour",
					type: "orders",
					sparklineData: [50, 60, 55, 65, 70, 75, 80, 78, 85, 90, 92, 95],
				},
				{
					title: "Shipments in Transit",
					icon: "Users",
					value: "+989",
					description: "+18 since last hour",
					type: "number",
					sparklineData: null,
				},
			],
			otherChartData: [
				{
					title: "Order Fulfillment",
					icon: "Package",
					type: "progress",
					progress: 75,
					label: "75% Complete",
				},
				{
					title: "Inventory by Category",
					icon: "CreditCard",
					type: "donut",
					donutData: [30, 40, 20, 10],
					donutLabels: ["Electronics", "Clothing", "Books", "Other"],
				},
				{
					title: "Shipment Status",
					icon: "Truck",
					type: "donut",
					donutData: [45, 30, 25],
					donutLabels: ["In Transit", "Pending", "Delivered"],
					colors: ["#38bdf8", "#f97316", "#4ade80"],
				},
			],
		}),
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
		"/shipments/:id": (data: Shipment): Shipment => {
			return data;
		},
		"/suppliers/:id": (data: Supplier): Supplier => {
			return data;
		},
		"/users/:id": (data: User): User => {
			return data;
		},
	},
	delete: {
		"/inventory/:id": (id: number) => ({ success: true, deletedId: id }),
		"/orders/:id": (id: number) => ({ success: true, deletedId: id }),
		"/shipments/:id": (id: string) => ({ success: true, deletedId: id }),
		"/suppliers/:id": (id: string) => ({ success: true, deletedId: id }),
		"/users/:id": (id: string) => ({ success: true, deletedId: id }),
	},
};
