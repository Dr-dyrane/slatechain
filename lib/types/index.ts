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
	createdAt: string;
	updatedAt: string;
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
	id: number | string;
	name: string;
	sku: string;
	quantity: number;
	minAmount: number;
	replenishmentAmount?: number;
	location?: string;
	warehouseId?: string;
	zoneId?: string;
	lotNumber?: string;
	expirationDate?: string;
	serialNumber?: string;
	price: number;
	unitCost: number;
	category: string;
	description: string;
	supplierId: string;
}

// Warehouse Management Types
export interface Warehouse {
	id: string;
	name: string;
	location: string;
	capacity: number;
	utilizationPercentage: number;
	zones: WarehouseZone[];
	status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
	createdAt: string;
	updatedAt: string;
}

export interface WarehouseZone {
	id: string;
	name: string;
	type: "BULK" | "PICKING" | "COLD_STORAGE" | "HAZMAT" | "HIGH_VALUE";
	capacity: number;
	currentOccupancy: number;
	temperature?: number; // For cold storage
	humidity?: number;
	restrictions?: string[];
}

export interface StockMovement {
	id: string;
	type: "RECEIVING" | "DISPATCH" | "TRANSFER";
	sourceLocationId: string;
	destinationLocationId: string;
	items: StockMovementItem[];
	status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
	scheduledDate: string;
	completedDate?: string;
	handledBy: string;
}

export interface StockMovementItem {
	inventoryItemId: string;
	quantity: number;
	lotNumber?: string;
	serialNumber?: string;
}

// Manufacturing & Production Types
export interface ManufacturingOrder {
	id: string;
	name: string;
	orderNumber: string;
	inventoryItemId: string;
	quantity: number;
	status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
	startDate: string;
	endDate: string;
	actualStartDate?: string;
	actualEndDate?: string;
	priority: "LOW" | "MEDIUM" | "HIGH";
	qualityChecks: QualityCheck[];
	billOfMaterials: BillOfMaterials;
}

export interface BillOfMaterials {
	id: string;
	inventoryItemId: string;
	materials: BOMItem[];
	laborHours: number;
	machineHours: number;
	instructions: string;
	version: string;
}

export interface BOMItem {
	materialId: string;
	quantity: number;
	unit: string;
	wastageAllowance: number;
}

export interface QualityCheck {
	id: string;
	type: string;
	status: "PENDING" | "PASSED" | "FAILED";
	checkedBy: string;
	checkedAt: string;
	parameters: QualityParameter[];
	notes?: string;
}

export interface QualityParameter {
	name: string;
	expected: string | number;
	actual: string | number;
	tolerance?: number;
	passed: boolean;
	type: "STRING" | "NUMBER";
}

export interface InventoryState {
	items: InventoryItem[];
	warehouses: Warehouse[];
	stockMovements: StockMovement[];
	manufacturingOrders: ManufacturingOrder[];
	loading: boolean;
	error: string | null;
}

// Order
export interface Order {
	id: number;
	orderNumber: string;
	customerId: string;
	name?: string;
	items: OrderItem[];
	totalAmount: number;
	status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
	paid: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface OrderItem {
	productId: string;
	quantity: number;
	price: number;
}

// Shipment

export interface GeoLocation {
	latitude: number;
	longitude: number;
}

export interface ShipmentStatus {
	CREATED: "CREATED";
	PREPARING: "PREPARING";
	IN_TRANSIT: "IN_TRANSIT";
	DELIVERED: "DELIVERED";
}

export interface Shipment {
	id: string;
	name: string;
	orderId: string;
	trackingNumber: string;
	carrier: string;
	freightId: string;
	routeId: string;
	status: keyof ShipmentStatus;
	destination: string;
	estimatedDeliveryDate: string;
	actualDeliveryDate?: string;
	currentLocation?: GeoLocation;
}

export interface Transport {
	id: string;
	type: "TRUCK" | "SHIP" | "PLANE";
	capacity: number;
	currentLocation: GeoLocation;
	status: "AVAILABLE" | "IN_TRANSIT" | "MAINTENANCE";
	carrierId: string;
}

export interface Carrier {
	id: string;
	name: string;
	contactPerson: string;
	email: string;
	phone: string;
	rating: number;
	status: "ACTIVE" | "INACTIVE";
}

// Route interface
export interface Route {
	id: string;
	name: string;
	startLocation: string;
	endLocation: string;
	distance: number;
	estimatedDuration: number;
}

// Freight interface
export interface Freight {
	id: string;
	type: string;
	name: string;
	weight: number;
	volume: number;
	hazardous: boolean;
	specialInstructions?: string;
}

export interface ShipmentState {
	items: Shipment[];
	carriers: Carrier[];
	routes: Route[];
	transports: Transport[];
	freights: Freight[];
	loading: boolean;
	error: string | null;
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
	createdAt: string;
	updatedAt: string;
}

export interface SupplierDocument {
	id: string;
	supplierId: string;
	name: string;
	type: string;
	url: string;
	uploadedAt: string;
}

export interface ChatMessage {
	id: string;
	supplierId: string;
	senderId: string;
	senderName: string;
	message: string;
	timestamp: string;
}

// These types cover the main entities and processes in your SlateChain application.
// You may need to add or modify types as your application grows or requirements change.
