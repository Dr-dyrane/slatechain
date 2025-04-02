// @ts-ignore
import { WalletInfo } from "../blockchain/web3Provider";

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

export enum OnboardingStepStatus {
	NOT_STARTED = "NOT_STARTED",
	IN_PROGRESS = "IN_PROGRESS",
	COMPLETED = "COMPLETED",
	SKIPPED = "SKIPPED",
}

// User Interface
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
	integrations: UserIntegrations;
	refreshToken?: string;
	assignedManagers?: string[];
	supplierMetadata?: {
		address?: string;
		rating?: number;
		status?: string;
	};
	address?: {
		address1: string;
		address2?: string;
		city: string;
		state?: string;
		country: string;
		postalCode?: string;
		phone?: string;
	};
	twoFactorAuth?: {
		enabled: boolean;
		phoneNumber?: string;
	};
	blockchain?: {
		walletAddress?: string;
		registeredAt?: string;
	};
	createdAt: string;
	updatedAt: string;
}

// 2FA related types
export enum TwoFactorMethod {
	WHATSAPP = "WHATSAPP",
	SMS = "SMS",
	EMAIL = "EMAIL",
}

export interface TwoFactorAuthData {
	enabled: boolean;
	phoneNumber?: string;
	method?: TwoFactorMethod;
}

export interface AuthError {
	message: string;
}

export interface WalletInfo {
	address: string;
	balance: number;
}

// LoginRequest interface
export interface LoginRequest {
	email: string;
	password: string;
	phoneNumber?: string; // Add this for phone login
	otp?: string; // Add this for OTP verification
}

//  verification request
export interface TwoFactorVerifyRequest {
	token: string; // Temporary token from first login step
	code: string; // Verification code
}

// Add 2FA setup request
export interface TwoFactorSetupRequest {
	phoneNumber: string;
	method: TwoFactorMethod;
	enable: boolean;
}

// User Integrations (Only One Service Enabled Per Category)
export interface UserIntegrations {
	ecommerce?: EcommerceIntegration;
	erp_crm?: ErpCrmIntegration;
	iot?: IoTIntegration;
	bi_tools?: BIIntegration;
	auth?: AuthIntegrations;
}

// Authentication Providers
export interface AuthIntegrations {
	apple?: AppleIntegration;
	google?: GoogleIntegration;
}

// Apple Integration
export interface AppleIntegration {
	id: string; // Apple user ID (sub)
	email: string;
	name?: string; // Optional, Apple sometimes provides a name
}

// Google Integration
export interface GoogleIntegration {
	id: string; // Google user ID
	email: string;
	name?: string;
	avatarUrl?: string; // Google provides profile pictures
}

// Integration Categories - One Service Per Category
export interface EcommerceIntegration {
	enabled: boolean;
	service: EcommerceService;
	apiKey?: string | null;
	storeUrl?: string | null;
}

export interface ErpCrmIntegration {
	enabled: boolean;
	service: ErpCrmService;
	apiKey?: string | null;
}

export interface IoTIntegration {
	enabled: boolean;
	service: IoTService;
	apiKey?: string | null;
}

export interface BIIntegration {
	enabled: boolean;
	service: BIService;
	apiKey?: string | null;
}

// Available Services per Category
export type EcommerceService = "shopify" | null;
//  | "woocommerce" | "magento" | "bigcommerce";

export type ErpCrmService = "sap" | null;
//  | "oracle" | "microsoft_dynamics";

export type IoTService = "iot_monitoring" | null;

export type BIService = "power_bi" | null;
//  | "tableau";

export interface ShopifyIntegrationSettings {
	enabled: boolean;
	apiKey: string | null;
	storeUrl: string | null;
}

export interface IntegrationDetails {
	enabled: boolean;
	service: string | null;
	apiKey?: string | null;
	storeUrl?: string | null;
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
	wallet: WalletInfo | null;
	isWalletConnecting: boolean;
	twoFactorPending?: boolean;
	twoFactorToken?: string;
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
	loading: boolean;
	userId: string | null;
	error: string | null;
	stepHistory: StepHistoryEntry[]; // Track step navigation history
	stepsData: Record<number, OnboardingStepData>;
}

export interface OnboardingStepData {
	[key: string]: any; // Stores dynamic step-specific data
	startedAt?: Date; // Ensures correct date parsing
}

// Add StepHistoryEntry interface
export interface StepHistoryEntry {
	stepId: number;
	data: Record<string, string | number | boolean | string[] | undefined>;
}

// Update API response types to include proper data types
export interface OnboardingResponse {
	code: string;
	data: OnboardingProgress;
}

export interface StepUpdateResponse {
	code: string;
	data: OnboardingStep;
}

export interface StepSkipResponse {
	code: string;
	data: OnboardingStep;
}

export interface CompletionResponse {
	code: string;
	data: {
		success: boolean;
		completedAt: string;
	};
}

export interface OnboardingStep {
	id: number;
	title: string;
	status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";
	data?: Record<string, any>;
	completedAt?: Date;
	skippedAt?: Date;
	skipReason?: string;
}

export interface OnboardingProgress {
	currentStep: number;
	completedSteps: number[];
	completed: boolean;
	roleSpecificData: Record<string, any>;
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
	paymentMethod?: string;
	paymentDetails?: Record<string, any>;
	shippingAddress?: {
		address1: string;
		address2?: string;
		city: string;
		state?: string;
		country: string;
		postalCode?: string;
		phone?: string;
	};
}

export interface OrderItem {
	id?: string; // Ensure this exists, populated by Mongoose `addIdSupport`
	_id?: string; // Mongoose ID
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
	createdAt: Date;
	updatedAt: Date;
}

export interface Transport {
	id: string;
	_id?: string;
	name: string;
	type: "TRUCK" | "SHIP" | "PLANE";
	capacity: number;
	currentLocation: GeoLocation;
	status: "AVAILABLE" | "IN_TRANSIT" | "MAINTENANCE";
	carrierId: string;
}

export interface Carrier {
	id: string;
	_id?: string;
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
	_id?: string;
	name: string;
	startLocation: string;
	endLocation: string;
	distance: number;
	estimatedDuration: number;
	type: RouteType;
	status: RouteStatus;
	routeNumber?: string;
	origin?: {
		type: string;
		location: {
			address: string;
			coordinates?: {
				latitude: number;
				longitude: number;
			};
		};
		scheduledTime?: string;
	};
	destination?: {
		type: string;
		location: {
			address: string;
			coordinates?: {
				latitude: number;
				longitude: number;
			};
		};
		scheduledTime?: string;
	};
	waypoints?: any[];
	schedule?: {
		startDate: string;
		endDate: string;
		frequency?: string;
		days?: number[];
	};
	carriers?: {
		carrierId: string;
		priority: number;
	}[];
	createdBy?: string;
	userId?: string;
	cost?: {
		baseRate: number;
		additionalCharges: number;
		currency: string;
		total: number;
	};
}

export enum FreightTypes {
	STANDARD = "STANDARD",
	EXPRESS = "EXPRESS",
	REFRIGERATED = "REFRIGERATED",
	HAZARDOUS = "HAZARDOUS",
	OVERSIZED = "OVERSIZED",
	FRAGILE = "FRAGILE",
	PERISHABLE = "PERISHABLE",
	BULK = "BULK",
	CONTAINER = "CONTAINER",
	LIQUID = "LIQUID",
}

// Freight interface
export interface Freight {
	id: string;
	_id?: string;
	freightNumber?: string;
	type: FreightTypes;
	status: FreightStatus;
	shipmentIds?: string[];
	carrierId: string;
	routeId: string;
	vehicleType?: "TRUCK" | "TRAIN" | "PLANE" | "SHIP" | "OTHER" | undefined;
	vehicle?: {
		type: "TRUCK" | "TRAIN" | "PLANE" | "SHIP" | "OTHER" | undefined;
		identifier: string;
		capacity?: {
			weight: number;
			volume: number;
			units: number;
		};
		driver?: {
			name: string;
			phone: string;
			license: string;
		};
	};
	schedule?: {
		departureDate: string;
		arrivalDate: string;
		actualDeparture?: string;
		actualArrival?: string;
		stops?: any[];
	};
	cargo?: {
		totalWeight: number;
		totalVolume: number;
		units?: number;
		hazmat: boolean;
		temperature?: {
			required: boolean;
			min: number;
			max: number;
			unit: string;
		};
	};
	currentLocation?: GeoLocation;
	documents?: any[];
	cost?: {
		baseRate: number;
		fuelSurcharge: number;
		otherCharges: number;
		currency: string;
		total: number;
	};
	tracking?: {
		number: string;
		url: string;
		lastUpdate: string;
		location: string;
		status: string;
	};
	notes?: string;
	createdBy?: string;
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

// Route Status
export enum RouteStatus {
	PLANNED = "PLANNED",
	ACTIVE = "ACTIVE",
	INACTIVE = "INACTIVE",
	UNDER_MAINTENANCE = "UNDER_MAINTENANCE",
}

// Route Type
export enum RouteType {
	LOCAL = "LOCAL",
	REGIONAL = "REGIONAL",
	INTERNATIONAL = "INTERNATIONAL",
}

// Freight Status
export enum FreightStatus {
	PENDING = "PENDING",
	IN_TRANSIT = "IN_TRANSIT",
	DELIVERED = "DELIVERED",
	ON_HOLD = "ON_HOLD",
}

// Demand Planning and Forecasting

export interface ForecastParameter {
	name: string;
	value: string | number;
	description?: string;
}

export interface DemandForecast {
	id: string;
	name: string;
	inventoryItemId: string;
	forecastDate: string;
	quantity: number;
	confidenceIntervalUpper: number;
	confidenceIntervalLower: number;
	algorithmUsed: string;
	parameters: ForecastParameter[];
	notes?: string;
}

export interface DemandPlanningKPIs {
	forecastAccuracy: number;
	meanAbsoluteDeviation: number;
	bias: number;
	serviceLevel: number;
}

export interface ForecastDataPoint {
	date: string; // e.g., "2024-08-01"
	quantity: number;
	confidenceIntervalUpper: number;
	confidenceIntervalLower: number;
}

export interface AreaChartData {
	title: string;
	data: ForecastDataPoint[];
	xAxisKey: string; // Key for the x-axis (e.g., "date")
	yAxisKey: string; // Key for the y-axis (e.g., "quantity")
	upperKey: string; //Key for the upper bound
	lowerKey: string; // Key for the lower bound
	xAxisFormatter?: (value: any) => string; //Optional formatter for the X axis to make it more pretty
}

export interface ShopifyOrder {
	id: string; // Shopify order ID
	order_number: number; // Human-readable order number
	created_at: string; // Date the order was created (ISO 8601 format)
	total_price: string; // Total amount of the order (string to handle currency format)
	customer: ShopifyCustomer; // Customer information
	fulfillment_status: string | null; // Fulfillment Status, can be null
	financial_status: string;
	line_items: ShopifyLineItem[]; // List of items in the order
	billing_address: ShopifyAddress | null;
	shipping_address: ShopifyAddress | null;
	transactions: ShopifyTransaction[];
}

export interface ShopifyTransaction {
	id: number;
	kind: string;
	status: string;
	amount: string;
	created_at: string;
}
export interface ShopifyCustomer {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	orders_count: number;
	total_spent: string;
	default_address: ShopifyAddress | null;
}

export interface ShopifyLineItem {
	id: number;
	title: string;
	quantity: number;
	price: string;
	sku: string;
	name: string;
	variant_id: number;
	product_id: number;
}

export interface ShopifyAddress {
	first_name: string;
	last_name: string;
	address1: string;
	city: string;
	province: string;
	country: string;
	zip: string;
	phone: string;
	address2?: string;
	company?: string;
	country_code?: string;
	country_name?: string;
	province_code?: string;
}

export interface ShopifyShop {
	id: number;
	name: string;
	email: string;
	domain: string;
}

// New
export interface ShopifyState {
	shop: ShopifyShop | null;
	orders: ShopifyOrder[];
	totalRevenue: number;
	loading: boolean;
	error: string | null;
	apiKey: string | null;
	storeUrl: string | null;
	integrationEnabled: boolean;
}

// Notification Types
export interface Notification {
	id: string;
	_id?: string;
	userId: string;
	type: NotificationType;
	title: string;
	message: string;
	data?: Record<string, any>;
	read: boolean;
	createdAt: string;
}

export type NotificationType =
	| "GENERAL"
	| "ORDER_UPDATE"
	| "INVENTORY_ALERT"
	| "WAREHOUSE_UPDATE"
	| "INVENTORY_UPDATE"
	| "STOCK_MOVEMENT"
	| "MANUFACTURING_ORDER"
	| "INTEGRATION_SYNC"
	| "INTEGRATION_STATUS";

// Notification State
export interface NotificationState {
	notifications: Notification[];
	unreadCount: number;
	loading: boolean;
	error: string | null;
	pendingActions: {
		markAsRead: string[];
		delete: string[];
	};
	isDeletingAll: boolean;
}

// Return Management Types

export enum ReturnReason {
	DAMAGED = "Damaged",
	WRONG_ITEM = "WrongItem",
	DOES_NOT_FIT = "DoesNotFit",
	CHANGED_MIND = "ChangedMind",
	NOT_AS_DESCRIBED = "NotAsDescribed",
	DEFECTIVE = "Defective",
	ARRIVED_LATE = "ArrivedLate",
	OTHER = "Other",
}

export enum ReturnType { // Customer's *preferred* outcome
	REFUND = "Refund",
	REPLACEMENT = "Replacement",
	STORE_CREDIT = "StoreCredit",
	EXCHANGE = "Exchange", // Note: Exchange often complex, might be return+new order flow
}

export enum ReturnRequestStatus {
	PENDING_APPROVAL = "PendingApproval", // Initial state, awaiting staff review
	// PENDING_CUSTOMER_ACTION = "PendingCustomerAction", // Optional: e.g., customer needs to ship
	APPROVED = "Approved", // Staff approved the request (items can now be sent back)
	REJECTED = "Rejected", // Staff rejected the request
	ITEMS_RECEIVED = "ItemsReceived", // Physical items confirmed received by warehouse/staff
	PROCESSING = "Processing", // Inspection/Disposition in progress
	RESOLUTION_PENDING = "ResolutionPending", // Items processed, awaiting final action (refund, ship replacement)
	COMPLETED = "Completed", // Final state - resolution action finished
}

export enum ItemCondition { // Condition of the *returned* item upon receipt/inspection
	NEW_IN_BOX = "NewInBox", // Unopened, original packaging
	LIKE_NEW_OPEN_BOX = "LikeNewOpenBox", // Opened, but appears unused
	USED_GOOD = "UsedGood", // Minor signs of use, fully functional
	USED_FAIR = "UsedFair", // Visible use, functional
	DAMAGED_REPAIRABLE = "DamagedRepairable", // Damaged but potentially fixable
	DAMAGED_BEYOND_REPAIR = "DamagedBeyondRepair", // Cannot be repaired/resold
	MISSING_PARTS = "MissingParts", // Incomplete
}

export enum ReturnDisposition { // Final decision on what to do with the *received* item
	RESTOCK = "Restock", // Put back into sellable inventory
	RETURN_TO_SUPPLIER = "ReturnToSupplier", // Send back to the original supplier
	REFURBISH = "Refurbish", // Attempt repair/refurbishment
	DISPOSE = "Dispose", // Discard the item
	QUARANTINE = "Quarantine", // Set aside for further review/decision
	// ASSET_RECOVERY = "AssetRecovery", // Sell via secondary channels etc.
}

export enum ReturnResolutionStatus { // Status of the *final action* (refund, replacement shipment)
	PENDING = "Pending", // Resolution action not yet initiated
	IN_PROGRESS = "InProgress", // e.g., Refund submitted to Stripe, Replacement order created
	COMPLETED = "Completed", // Refund confirmed, Replacement shipped & maybe delivered
	FAILED = "Failed", // e.g., Refund failed, Replacement couldn't be created
}

// --- NEW Interfaces for Return Management ---

export interface ReturnRequest {
	id: string; // Or ObjectId from Mongoose
	_id?: string; // Mongoose ID
	returnRequestNumber: string; // Human-readable unique ID (e.g., RTN00001)
	orderId: {
		_id: string;
		orderNumber: string;
	}; // FK to the Order.id
	customerId: {
		_id: string;
		email: string;
	}; // FK to the User.id
	requestDate: string; // ISO timestamp of when the request was submitted
	status: ReturnRequestStatus; // Overall status of the return request journey
	returnReason: ReturnReason; // Primary reason selected by customer
	reasonDetails?: string; // Optional text field for more details or 'Other' reason
	proofImages?: string[]; // Array of URLs to uploaded proof images/docs
	preferredReturnType: ReturnType; // What the customer ideally wants
	reviewedBy?: string; // FK to User.id of staff who reviewed (approved/rejected)
	reviewDate?: string; // ISO timestamp of review
	staffComments?: string; // Internal notes added by staff during processing

	// Populated fields (Optional, depending on API response needs)
	order?: Pick<Order, "id" | "orderNumber">; // Minimal order info
	customer?: Pick<User, "id" | "name" | "email">; // Minimal customer info
	returnItems?: ReturnItem[]; // Array of items in this request
	resolution?: ReturnResolution; // The final resolution record

	createdAt: string;
	updatedAt: string;
}

export interface ReturnItem {
	id: string;
	_id?: string;
	returnRequestId: string; // FK to ReturnRequest.id
	orderItemId: string; // CRITICAL FK to the specific OrderItem.id being returned
	productId: string; // FK to InventoryItem.id (or Product.id) - Denormalized for convenience
	quantityRequested: number; // How many units the customer wants to return

	// --- Fields updated during processing ---
	quantityReceived?: number; // How many units were physically received back
	receivedDate?: string; // ISO timestamp when received
	itemCondition?: ItemCondition; // Assessed condition upon receipt
	conditionAssessedBy?: string; // FK to User.id who assessed condition
	conditionAssessmentDate?: string; // ISO timestamp of assessment
	disposition?: ReturnDisposition; // Final decision for this item (Restock, Dispose, etc.)
	dispositionSetBy?: string; // FK to User.id who set disposition
	dispositionDate?: string; // ISO timestamp disposition set
	returnTrackingNumber?: string; // Tracking number for the *inbound* shipment from customer
	shippingLabelUrl?: string; // URL to a return label provided to the customer (if any)

	// Populated fields (Optional)
	product?: Pick<InventoryItem, "id" | "name" | "sku">; // Minimal product info

	// Timestamps less critical here unless needed for fine-grained audit
	// createdAt: string;
	// updatedAt: string;
}

export interface ReturnResolution {
	id: string;
	_id?: string;
	returnRequestId: string; // FK to ReturnRequest.id (Should be unique - one resolution per request)
	status: ReturnResolutionStatus; // Status of the final action (e.g., refund sent, replacement shipped)
	resolutionType: ReturnType; // The *actual* resolution method applied by staff
	resolvedBy: string; // FK to User.id of staff who executed the resolution
	resolutionDate: string; // ISO timestamp when resolution action was completed/initiated

	notes?: string; // Staff notes regarding the resolution action

	// --- Details based on resolutionType ---
	refundAmount?: number; // Amount refunded (if type is REFUND)
	refundTransactionId?: string; // e.g., Stripe charge ID, internal ledger ID (if type is REFUND)

	replacementOrderId?: string; // FK to the *new* Order.id created for the replacement (if type is REPLACEMENT)

	storeCreditAmount?: number; // Amount of store credit issued (if type is STORE_CREDIT)
	storeCreditCode?: string; // Code or ID for the issued store credit (if type is STORE_CREDIT)

	exchangeNotes?: string; // Specific details if handled as an exchange (if type is EXCHANGE)

	createdAt: string;
	updatedAt: string;
}
