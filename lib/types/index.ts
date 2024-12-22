// User Roles
export enum UserRole {
	ADMIN = "admin",
	SUPPLIER = "supplier",
	MANAGER = "manager",
	CUSTOMER = "customer",
}

// KYC Status
export enum KYCStatus {
	NOT_STARTED = "NOT_STARTED",
	IN_PROGRESS = "IN_PROGRESS",
	PENDING_REVIEW = "PENDING_REVIEW",
	APPROVED = "APPROVED",
	REJECTED = "REJECTED",
}

// Onboarding Status
export enum OnboardingStatus {
	PENDING = "PENDING",
	NOT_STARTED = "NOT_STARTED",
	IN_PROGRESS = "IN_PROGRESS",
	COMPLETED = "COMPLETED",
}

// User
export interface User {
	id: string;
	firstName: string;
	lastName: string;
	name: string;
	email: string;
	phoneNumber: string;
	role: UserRole;
	isEmailVerified: boolean;
	isPhoneVerified: boolean;
	kycStatus: KYCStatus;
	onboardingStatus: OnboardingStatus;
	avatarUrl?: string;
}

// Auth
export interface AuthState {
	user: User | null;
	accessToken: string | null;
	refreshToken: string | null;
	isAuthenticated: boolean;
	loading: boolean;
	error: AuthError | null;
	kycStatus: KYCStatus;
	onboardingStatus: OnboardingStatus;
}

export interface AuthError {
	code: string;
	message: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	role: UserRole;
}

export interface AuthResponse {
	user: User;
	accessToken: string;
	refreshToken: string;
}

// KYC
export interface KYCState {
	status: KYCStatus;
	documents: KYCDocument[];
	loading: boolean;
	error: string | null;
}

export interface KYCDocument {
	id: string;
	type: string;
	status: string;
	uploadedAt: string;
	url?: string;
}

export interface KYCSubmissionRequest {
	userId: string;
	fullName: string;
	dateOfBirth: string;
	address: string;
	role: UserRole;
	companyName?: string;
	taxId?: string;
	customerType?: string;
}

// Onboarding
export interface OnboardingState {
	currentStep: number;
	totalSteps: number;
	completedSteps: number[];
	roleSpecificData: Record<string, any>;
	completed: boolean;
	cancelled: boolean;
	userId: string | null;
}

export interface OnboardingStep {
	id: number;
	title: string;
	status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";
}

export interface OnboardingProgress {
	currentStep: number;
	completedSteps: number[];
	completed: boolean;
}

// Role-specific onboarding data
export interface AdminSetupData {
	adminRole: string;
	department: string;
}

export interface SupplierSetupData {
	companyName: string;
	productCategories: string[];
	shippingMethods: string[];
	paymentTerms: string;
}

export interface ManagerSetupData {
	teamName: string;
	teamSize: number;
	managedDepartments: string[];
}

export interface CustomerSetupData {
	preferredCategories: string[];
	communicationPreference: string;
	shippingPreference: string;
}

// API Responses
export interface APIResponse<T> {
	success: boolean;
	data: T;
	error?: string;
}

// Form Data
export interface ProfileFormData {
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
}

export interface PasswordChangeFormData {
	currentPassword: string;
	newPassword: string;
	confirmNewPassword: string;
}

// Settings
export interface UserPreferences {
	theme: "light" | "dark" | "system";
	emailNotifications: boolean;
	smsNotifications: boolean;
}

// Inventory (for Supplier role)
export interface InventoryItem {
	id: number;
	name: string;
	sku: string;
	quantity: number;
	location?: string;
	price: number;
	category: string;
	supplierId: string;
}

// Order
export interface Order {
	id: number;
	orderNumber: string;
	customerId: string;
	items: OrderItem[];
	totalAmount: number;
	status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
	createdAt: string;
	updatedAt: string;
}

export interface OrderItem {
	productId: string;
	quantity: number;
	price: number;
}

// Shipment
export interface Shipment {
	id: string;
	orderId: string;
	trackingNumber: string;
	carrier: string;
	status: "PREPARING" | "IN_TRANSIT" | "DELIVERED";
	destination?: string; // Added destination
	estimatedDeliveryDate: string;
	actualDeliveryDate?: string;
}

// Supplier
export interface Supplier {
	id: string;
	name: string;
	contactPerson: string;
	email: string;
	phoneNumber: string;
	address: string;
	rating: number;
	status: "ACTIVE" | "INACTIVE";
}

// These types cover the main entities and processes in your SlateChain application.
// You may need to add or modify types as your application grows or requirements change.
