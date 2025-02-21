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
	Carrier,
	Route,
	Freight,
	Transport,
	GeoLocation,
	Warehouse,
	WarehouseZone,
	StockMovement,
	StockMovementItem,
	ManufacturingOrder,
	BillOfMaterials,
	BOMItem,
	QualityCheck,
	QualityParameter,
	DemandForecast,
	DemandPlanningKPIs,
	AreaChartData,
	ShopifyShop,
	ShopifyOrder,
	Notification,
	NotificationType,
} from "@/lib/types";

const mockGeoLocation: GeoLocation = {
	latitude: 34.0522,
	longitude: -118.2437,
};

const mockOrders: Order[] = [
	{
		id: 1,
		orderNumber: "ORD12345",
		customerId: "user-1",
		items: [
			{ productId: "product-1", quantity: 2, price: 100 },
			{ productId: "product-2", quantity: 1, price: 50 },
		],
		totalAmount: 250,
		status: "PROCESSING",
		paid: true,
		createdAt: "2024-07-26T10:00:00Z",
		updatedAt: "2024-07-26T10:30:00Z",
	},
	{
		id: 2,
		orderNumber: "ORD67890",
		customerId: "user-2",
		items: [
			{ productId: "product-3", quantity: 3, price: 20 },
			{ productId: "product-4", quantity: 1, price: 30 },
		],
		totalAmount: 90,
		status: "PENDING",
		paid: false,
		createdAt: "2024-07-27T14:00:00Z",
		updatedAt: "2024-07-27T14:15:00Z",
	},
	{
		id: 3,
		orderNumber: "ORD67910",
		customerId: "user-3",
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
];

const mockInventory: InventoryItem[] = [
	{
		id: 1,
		name: "Product A",
		sku: "SKU001",
		quantity: 100,
		minAmount: 50,
		replenishmentAmount: 70,
		warehouseId: "warehouse-1",
		zoneId: "zone-1",
		lotNumber: "LN123",
		expirationDate: "2024-12-31T00:00:00Z",
		serialNumber: "SN456",
		price: 10,
		unitCost: 5,
		category: "Electronics",
		description: "High-quality electronic component",
		supplierId: "supplier-1",
		location: "Warehouse 1",
	},
	{
		id: 2,
		name: "Product B",
		sku: "SKU002",
		quantity: 150,
		minAmount: 100,
		replenishmentAmount: 100,
		warehouseId: "warehouse-2",
		zoneId: "zone-2",
		lotNumber: "LN789",
		expirationDate: "2025-06-30T00:00:00Z",
		serialNumber: "SN101",
		price: 20,
		unitCost: 10,
		category: "Clothing",
		description: "Comfortable cotton t-shirt",
		supplierId: "supplier-2",
		location: "Warehouse 2",
	},
	{
		id: 3,
		name: "Product C",
		sku: "SKU003",
		quantity: 75,
		minAmount: 25,
		replenishmentAmount: 25,
		warehouseId: "warehouse-1",
		zoneId: "zone-3",
		lotNumber: "LN101",
		expirationDate: "2024-11-30T00:00:00Z",
		serialNumber: "SN202",
		price: 30,
		unitCost: 15,
		category: "Books",
		description: "Bestselling novel",
		supplierId: "supplier-3",
		location: "Warehouse 1",
	},
];

const mockShipments: Shipment[] = [
	{
		id: "1",
		name: "Shipment-1",
		orderId: "1",
		trackingNumber: "TN12345",
		carrier: "carrier-1",
		freightId: "freight-1",
		routeId: "route-1",
		status: "IN_TRANSIT",
		destination: "Los Angeles",
		estimatedDeliveryDate: "2024-08-01T12:00:00Z",
		currentLocation: mockGeoLocation,
	},
	{
		id: "2",
		name: "Shipment-2",
		orderId: "2",
		trackingNumber: "TN67890",
		carrier: "carrier-2",
		freightId: "freight-2",
		routeId: "route-2",
		status: "DELIVERED",
		destination: "Miami",
		estimatedDeliveryDate: "2024-07-29T10:00:00Z",
		actualDeliveryDate: "2024-07-29T09:45:00Z",
		currentLocation: mockGeoLocation,
	},
	{
		id: "3",
		name: "Shipment-3",
		orderId: "3",
		trackingNumber: "TN11223",
		carrier: "carrier-3",
		freightId: "freight-3",
		routeId: "route-3",
		status: "PREPARING",
		destination: "Boston",
		estimatedDeliveryDate: "2024-08-05T12:00:00Z",
		currentLocation: mockGeoLocation,
	},
];

const mockTransports: Transport[] = [
	{
		id: "T001",
		type: "TRUCK",
		capacity: 1000,
		currentLocation: { latitude: 34.0522, longitude: -118.2437 },
		status: "IN_TRANSIT",
		carrierId: "carrier-1",
	},
	{
		id: "T002",
		type: "SHIP",
		capacity: 10000,
		currentLocation: { latitude: 37.7749, longitude: -122.4194 },
		status: "AVAILABLE",
		carrierId: "carrier-2",
	},
	{
		id: "T003",
		type: "PLANE",
		capacity: 500,
		currentLocation: { latitude: 40.7128, longitude: -74.006 },
		status: "IN_TRANSIT",
		carrierId: "carrier-3",
	},
];

const mockCarriers: Carrier[] = [
	{
		id: "carrier-1",
		name: "Speedy Logistics",
		contactPerson: "Alice Johnson",
		email: "alice@speedylogistics.com",
		phone: "+15551234567",
		rating: 4.7,
		status: "ACTIVE",
	},
	{
		id: "carrier-2",
		name: "Ocean Transport Co.",
		contactPerson: "Bob Williams",
		email: "bob@oceantransport.com",
		phone: "+15557890123",
		rating: 4.2,
		status: "ACTIVE",
	},
	{
		id: "carrier-3",
		name: "Air Express Inc.",
		contactPerson: "Carol Davis",
		email: "carol@airexpress.com",
		phone: "+15552468012",
		rating: 4.9,
		status: "ACTIVE",
	},
];

const mockRoutes: Route[] = [
	{
		id: "route-1",
		name: "LA to NY",
		startLocation: "Los Angeles, CA",
		endLocation: "New York, NY",
		distance: 2448,
		estimatedDuration: 40,
	},
	{
		id: "route-2",
		name: "Miami to Chicago",
		startLocation: "Miami, FL",
		endLocation: "Chicago, IL",
		distance: 1387,
		estimatedDuration: 22,
	},
	{
		id: "route-3",
		name: "Seattle to Dallas",
		startLocation: "Seattle, WA",
		endLocation: "Dallas, TX",
		distance: 1949,
		estimatedDuration: 32,
	},
];

const mockFreights: Freight[] = [
	{
		id: "freight-1",
		type: "Electronics",
		name: "High-Value Electronics",
		weight: 500,
		volume: 20,
		hazardous: false,
		specialInstructions: "Handle with care; fragile items inside.",
	},
	{
		id: "freight-2",
		type: "Chemicals",
		name: "Industrial Chemicals",
		weight: 1000,
		volume: 30,
		hazardous: true,
		specialInstructions:
			"Must be kept at specific temperature; handle with caution.",
	},
	{
		id: "freight-3",
		type: "Food",
		name: "Perishable Food Items",
		weight: 300,
		volume: 15,
		hazardous: false,
		specialInstructions: "Keep refrigerated.",
	},
];

const mockSuppliers: Supplier[] = [
	{
		id: "supplier-1",
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
		id: "supplier-2",
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
		id: "supplier-3",
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
];

const mockWarehouses: Warehouse[] = [
	{
		id: "warehouse-1",
		name: "Main Warehouse",
		location: "Los Angeles, CA",
		capacity: 10000,
		utilizationPercentage: 75,
		zones: [],
		status: "ACTIVE",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: "warehouse-2",
		name: "Distribution Center A",
		location: "Chicago, IL",
		capacity: 5000,
		utilizationPercentage: 50,
		zones: [],
		status: "ACTIVE",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: "warehouse-3",
		name: "Returns Processing",
		location: "New York, NY",
		capacity: 2000,
		utilizationPercentage: 90,
		zones: [],
		status: "MAINTENANCE",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
];

const mockWarehouseZones: WarehouseZone[] = [
	{
		id: "zone-1",
		name: "Electronics Bulk",
		type: "BULK",
		capacity: 3000,
		currentOccupancy: 2500,
		restrictions: ["Fragile", "Electronics Only"],
	},
	{
		id: "zone-2",
		name: "Clothing Picking",
		type: "PICKING",
		capacity: 1500,
		currentOccupancy: 1200,
		restrictions: ["Clothing Only"],
	},
	{
		id: "zone-3",
		name: "Cold Storage Food",
		type: "COLD_STORAGE",
		capacity: 500,
		currentOccupancy: 400,
		temperature: 2,
		humidity: 85,
		restrictions: ["Food Only", "Temperature Controlled"],
	},
];

const mockStockMovements: StockMovement[] = [
	{
		id: "movement-1",
		type: "RECEIVING",
		sourceLocationId: "supplier-1",
		destinationLocationId: "warehouse-1",
		items: [{ inventoryItemId: "1", quantity: 100 }],
		status: "COMPLETED",
		scheduledDate: "2024-07-25T00:00:00Z",
		completedDate: "2024-07-26T00:00:00Z",
		handledBy: "user-1",
	},
	{
		id: "movement-2",
		type: "DISPATCH",
		sourceLocationId: "warehouse-2",
		destinationLocationId: "customer-1",
		items: [{ inventoryItemId: "2", quantity: 50 }],
		status: "IN_PROGRESS",
		scheduledDate: "2024-07-28T00:00:00Z",
		handledBy: "user-2",
	},
	{
		id: "movement-3",
		type: "TRANSFER",
		sourceLocationId: "warehouse-1",
		destinationLocationId: "warehouse-3",
		items: [{ inventoryItemId: "3", quantity: 25 }],
		status: "PENDING",
		scheduledDate: "2024-07-30T00:00:00Z",
		handledBy: "user-1",
	},
];

const mockStockMovementItems: StockMovementItem[] = [
	{ inventoryItemId: "1", quantity: 100, lotNumber: "LN123" },
	{ inventoryItemId: "2", quantity: 50, serialNumber: "SN456" },
	{
		inventoryItemId: "3",
		quantity: 25,
		lotNumber: "LN789",
		serialNumber: "SN789",
	},
];

const mockBillOfMaterials: BillOfMaterials[] = [
	{
		id: "bom-1",
		inventoryItemId: "1",
		materials: [
			{
				materialId: "raw-material-1",
				quantity: 2,
				unit: "kg",
				wastageAllowance: 0.1,
			},
			{
				materialId: "raw-material-2",
				quantity: 1,
				unit: "piece",
				wastageAllowance: 0.05,
			},
		],
		laborHours: 8,
		machineHours: 4,
		instructions: "Assemble according to the blueprint.",
		version: "1.0",
	},
	{
		id: "bom-2",
		inventoryItemId: "2",
		materials: [
			{
				materialId: "raw-material-3",
				quantity: 1.5,
				unit: "meters",
				wastageAllowance: 0.02,
			},
			{
				materialId: "raw-material-4",
				quantity: 4,
				unit: "pieces",
				wastageAllowance: 0.08,
			},
		],
		laborHours: 12,
		machineHours: 6,
		instructions: "Sew and finish the seams.",
		version: "1.1",
	},
	{
		id: "bom-3",
		inventoryItemId: "3",
		materials: [
			{
				materialId: "raw-material-5",
				quantity: 500,
				unit: "grams",
				wastageAllowance: 0.01,
			},
			{
				materialId: "raw-material-6",
				quantity: 10,
				unit: "sheets",
				wastageAllowance: 0.03,
			},
		],
		laborHours: 4,
		machineHours: 2,
		instructions: "Print and bind the pages.",
		version: "1.2",
	},
];

const mockBOMItems: BOMItem[] = [
	{
		materialId: "raw-material-1",
		quantity: 2,
		unit: "kg",
		wastageAllowance: 0.1,
	},
	{
		materialId: "raw-material-2",
		quantity: 1,
		unit: "piece",
		wastageAllowance: 0.05,
	},
	{
		materialId: "raw-material-3",
		quantity: 1.5,
		unit: "meters",
		wastageAllowance: 0.02,
	},
	{
		materialId: "raw-material-4",
		quantity: 4,
		unit: "pieces",
		wastageAllowance: 0.08,
	},
	{
		materialId: "raw-material-5",
		quantity: 500,
		unit: "grams",
		wastageAllowance: 0.01,
	},
	{
		materialId: "raw-material-6",
		quantity: 10,
		unit: "sheets",
		wastageAllowance: 0.03,
	},
];

const mockQualityChecks: QualityCheck[] = [
	{
		id: "qc-1",
		type: "Visual Inspection",
		status: "PASSED",
		checkedBy: "qc-inspector-1",
		checkedAt: "2024-07-22T10:00:00Z",
		parameters: [],
		notes: "No defects found.",
	},
	{
		id: "qc-2",
		type: "Performance Test",
		status: "PASSED",
		checkedBy: "qc-inspector-2",
		checkedAt: "2024-07-28T14:00:00Z",
		parameters: [],
		notes: "All performance metrics within acceptable range.",
	},
	{
		id: "qc-3",
		type: "Dimensional Measurement",
		status: "PENDING",
		checkedBy: "qc-inspector-1",
		checkedAt: "2024-08-02T09:00:00Z",
		parameters: [],
	},
];

const mockQualityParameters: QualityParameter[] = [
	{
		name: "Dimensions",
		expected: "10x10x5 cm",
		actual: "10.1x9.9x5.0 cm",
		tolerance: 0.1,
		passed: true,
		type: "NUMBER",
	},
	{
		name: "Color",
		expected: "Blue",
		actual: "Blue",
		passed: true,
		type: "STRING",
	},
	{
		name: "Weight",
		expected: 500,
		actual: 498,
		tolerance: 2,
		passed: true,
		type: "NUMBER",
	},
];

const mockManufacturingOrders: ManufacturingOrder[] = [
	{
		id: "morder-1",
		name: "Electronics Assembly",
		orderNumber: "MO001",
		inventoryItemId: "1",
		quantity: 50,
		status: "COMPLETED",
		startDate: "2024-07-20T00:00:00Z",
		endDate: "2024-07-22T00:00:00Z",
		actualStartDate: "2024-07-20T00:00:00Z",
		actualEndDate: "2024-07-22T00:00:00Z",
		priority: "HIGH",
		qualityChecks: [],
		billOfMaterials: {
			id: "bom-1",
			inventoryItemId: "1",
			materials: [],
			laborHours: 8,
			machineHours: 4,
			instructions: "Assemble according to the blueprint.",
			version: "1.0",
		},
	},
	{
		id: "morder-2",
		name: "T-Shirt Production",
		orderNumber: "MO002",
		inventoryItemId: "2",
		quantity: 100,
		status: "IN_PROGRESS",
		startDate: "2024-07-27T00:00:00Z",
		endDate: "2024-07-29T00:00:00Z",
		actualStartDate: "2024-07-27T00:00:00Z",
		actualEndDate: "2024-07-28T00:00:00Z",
		priority: "MEDIUM",
		qualityChecks: [],
		billOfMaterials: {
			id: "bom-2",
			inventoryItemId: "2",
			materials: [],
			laborHours: 12,
			machineHours: 6,
			instructions: "Sew and finish the seams.",
			version: "1.1",
		},
	},
	{
		id: "morder-3",
		name: "Novel Printing",
		orderNumber: "MO003",
		inventoryItemId: "3",
		quantity: 200,
		status: "PLANNED",
		startDate: "2024-08-01T00:00:00Z",
		endDate: "2024-08-05T00:00:00Z",
		priority: "LOW",
		qualityChecks: [],
		billOfMaterials: {
			id: "bom-3",
			inventoryItemId: "3",
			materials: [],
			laborHours: 4,
			machineHours: 2,
			instructions: "Print and bind the pages.",
			version: "1.2",
		},
	},
];

const mockUsers: User[] = [
	{
		id: "user-1",
		firstName: "John",
		lastName: "Doe",
		name: "John Doe",
		email: "johndoe@example.com",
		phoneNumber: "123-456-7890",
		role: UserRole.ADMIN,
		isEmailVerified: true,
		isPhoneVerified: true,
		kycStatus: KYCStatus.APPROVED,
		onboardingStatus: OnboardingStatus.COMPLETED,
		avatarUrl: "https://example.com/avatar.jpg",
		createdAt: "2023-01-01T00:00:00Z",
		updatedAt: "2023-01-01T00:00:00Z",
		integrations: {
			ecommerce: {
				enabled: true,
				service: "shopify",
				apiKey: "shopify_admin_api_key",
				storeUrl: "johns-apparel.myshopify.com",
			},
			erp_crm: {
				enabled: true,
				service: "sap",
				apiKey: "sap_api_key",
			},
			iot: {
				enabled: true,
				service: "iot_monitoring",
				apiKey: "iot_device_api_key",
			},
			bi_tools: {
				enabled: true,
				service: "power_bi",
				apiKey: "power_bi_api_key",
			},
		},
	},
	{
		id: "user-2",
		firstName: "Jane",
		lastName: "Smith",
		name: "Jane Smith",
		email: "janesmith@example.com",
		phoneNumber: "123-456-7891",
		role: UserRole.CUSTOMER,
		isEmailVerified: true,
		isPhoneVerified: true,
		kycStatus: KYCStatus.APPROVED,
		onboardingStatus: OnboardingStatus.COMPLETED,
		avatarUrl: "https://example.com/avatar.jpg",
		createdAt: "2023-01-01T00:00:00Z",
		updatedAt: "2023-01-01T00:00:00Z",
		integrations: {
			ecommerce: {
				enabled: true,
				service: "shopify",
				apiKey: "shopify_admin_api_key",
				storeUrl: "johns-apparel.myshopify.com",
			},
			erp_crm: {
				enabled: false,
				service: null,
				apiKey: null,
			},
			iot: {
				enabled: false,
				service: null,
				apiKey: null,
			},
			bi_tools: {
				enabled: true,
				service: "power_bi",
				apiKey: "tableau_api_key",
			},
		},
	},
	{
		id: "user-3",
		firstName: "David",
		lastName: "Lee",
		name: "David Lee",
		email: "davidlee@example.com",
		phoneNumber: "123-456-7892",
		role: UserRole.SUPPLIER,
		isEmailVerified: true,
		isPhoneVerified: true,
		kycStatus: KYCStatus.APPROVED,
		onboardingStatus: OnboardingStatus.COMPLETED,
		avatarUrl: "https://example.com/avatar.jpg",
		createdAt: "2023-01-01T00:00:00Z",
		updatedAt: "2023-01-01T00:00:00Z",
		integrations: {
			ecommerce: {
				enabled: false,
				service: null,
				apiKey: null,
				storeUrl: null,
			},
			erp_crm: {
				enabled: true,
				service: "sap",
				apiKey: "sap_api_key",
			},
			iot: {
				enabled: false,
				service: null,
				apiKey: null,
			},
			bi_tools: {
				enabled: false,
				service: "power_bi",
				apiKey: null,
			},
		},
	},
];

const mockDemandForecasts: DemandForecast[] = [
	{
		id: "forecast-1",
		name: "Product A - August Forecast",
		inventoryItemId: "1",
		forecastDate: "2024-08-01T00:00:00Z",
		quantity: 120,
		confidenceIntervalUpper: 150,
		confidenceIntervalLower: 90,
		algorithmUsed: "ARIMA",
		parameters: [{ name: "Seasonality", value: "High" }],
		notes: "High promotional activity expected.",
	},
	{
		id: "forecast-2",
		name: "Product B - September Forecast",
		inventoryItemId: "2",
		forecastDate: "2024-09-01T00:00:00Z",
		quantity: 180,
		confidenceIntervalUpper: 220,
		confidenceIntervalLower: 140,
		algorithmUsed: "Exponential Smoothing",
		parameters: [{ name: "Trend", value: "Upward" }],
		notes: "Sustained growth trend observed.",
	},
	{
		id: "forecast-3",
		name: "Product C - October Forecast",
		inventoryItemId: "3",
		forecastDate: "2024-10-01T00:00:00Z",
		quantity: 80,
		confidenceIntervalUpper: 100,
		confidenceIntervalLower: 60,
		algorithmUsed: "Moving Average",
		parameters: [{ name: "Cycle", value: "Stable" }],
		notes: "Stable demand pattern expected.",
	},
];

const mockDemandPlanningKPIs: DemandPlanningKPIs = {
	forecastAccuracy: 0.85,
	meanAbsoluteDeviation: 25,
	bias: 5,
	serviceLevel: 0.95,
};

const mockAreaChartData: AreaChartData = {
	title: "Monthly Demand Forecast",
	xAxisKey: "date",
	yAxisKey: "quantity",
	upperKey: "confidenceIntervalUpper",
	lowerKey: "confidenceIntervalLower",
	data: [
		{
			date: "2024-08-01",
			quantity: 120,
			confidenceIntervalUpper: 150,
			confidenceIntervalLower: 90,
		},
		{
			date: "2024-09-01",
			quantity: 180,
			confidenceIntervalUpper: 220,
			confidenceIntervalLower: 140,
		},
		{
			date: "2024-10-01",
			quantity: 80,
			confidenceIntervalUpper: 100,
			confidenceIntervalLower: 60,
		},
		{
			date: "2024-11-01",
			quantity: 150,
			confidenceIntervalUpper: 170,
			confidenceIntervalLower: 130,
		},
		{
			date: "2024-12-01",
			quantity: 200,
			confidenceIntervalUpper: 250,
			confidenceIntervalLower: 150,
		},
	],
};

const mockShopifyOrders: ShopifyOrder[] = [
	{
		id: "order-1",
		order_number: 1001,
		created_at: "2024-07-28T10:00:00Z",
		total_price: "120.00",
		customer: {
			id: 1,
			first_name: "John",
			last_name: "Doe",
			email: "john.doe@example.com",
			orders_count: 1,
			total_spent: "120.00",
			default_address: {
				first_name: "John",
				last_name: "Doe",
				address1: "123 Main St",
				city: "Anytown",
				province: "CA",
				country: "US",
				zip: "12345",
				phone: "555-123-4567",
			},
		},
		fulfillment_status: "fulfilled",
		financial_status: "paid",
		line_items: [
			{
				id: 1,
				title: "Product A",
				quantity: 2,
				price: "50.00",
				sku: "SKU001",
				name: "Product A",
				variant_id: 123,
				product_id: 456,
			},
		],
		billing_address: {
			first_name: "John",
			last_name: "Doe",
			address1: "123 Main St",
			city: "Anytown",
			province: "CA",
			country: "US",
			zip: "12345",
			phone: "555-123-4567",
		},
		shipping_address: {
			first_name: "John",
			last_name: "Doe",
			address1: "123 Main St",
			city: "Anytown",
			province: "CA",
			country: "US",
			zip: "12345",
			phone: "555-123-4567",
		},
		transactions: [
			{
				id: 1,
				kind: "sale",
				status: "success",
				amount: "120.00",
				created_at: "2024-07-28T10:00:00Z",
			},
		],
	},
	{
		id: "order-2",
		order_number: 1002,
		created_at: "2024-07-27T14:00:00Z",
		total_price: "80.00",
		customer: {
			id: 2,
			first_name: "Jane",
			last_name: "Smith",
			email: "jane.smith@example.com",
			orders_count: 3,
			total_spent: "350.00",
			default_address: {
				first_name: "Jane",
				last_name: "Smith",
				address1: "456 Oak St",
				city: "Otherville",
				province: "NY",
				country: "US",
				zip: "67890",
				phone: "555-987-6543",
			},
		},
		fulfillment_status: "pending",
		financial_status: "pending",
		line_items: [
			{
				id: 2,
				title: "Product B",
				quantity: 1,
				price: "80.00",
				sku: "SKU002",
				name: "Product B",
				variant_id: 789,
				product_id: 101,
			},
		],
		billing_address: {
			first_name: "Jane",
			last_name: "Smith",
			address1: "456 Oak St",
			city: "Otherville",
			province: "NY",
			country: "US",
			zip: "67890",
			phone: "555-987-6543",
		},
		shipping_address: {
			first_name: "Jane",
			last_name: "Smith",
			address1: "456 Oak St",
			city: "Otherville",
			province: "NY",
			country: "US",
			zip: "67890",
			phone: "555-987-6543",
		},
		transactions: [
			{
				id: 2,
				kind: "sale",
				status: "pending",
				amount: "80.00",
				created_at: "2024-07-27T14:00:00Z",
			},
		],
	},
	{
		id: "order-3",
		order_number: 1003,
		created_at: "2024-07-26T09:15:00Z",
		total_price: "215.50",
		customer: {
			id: 3,
			first_name: "Alice",
			last_name: "Brown",
			email: "alice.brown@example.com",
			orders_count: 5,
			total_spent: "1250.00",
			default_address: {
				first_name: "Alice",
				last_name: "Brown",
				address1: "789 Pine St",
				city: "Newport",
				province: "RI",
				country: "US",
				zip: "02840",
				phone: "555-222-3333",
			},
		},
		fulfillment_status: "shipped",
		financial_status: "authorized",
		line_items: [
			{
				id: 3,
				title: "Product C",
				quantity: 2,
				price: "60.00",
				sku: "SKU003",
				name: "Product C",
				variant_id: 444,
				product_id: 555,
			},
			{
				id: 4,
				title: "Product D",
				quantity: 1,
				price: "95.50",
				sku: "SKU004",
				name: "Product D",
				variant_id: 666,
				product_id: 777,
			},
		],
		billing_address: {
			first_name: "Alice",
			last_name: "Brown",
			address1: "789 Pine St",
			city: "Newport",
			province: "RI",
			country: "US",
			zip: "02840",
			phone: "555-222-3333",
		},
		shipping_address: {
			first_name: "Alice",
			last_name: "Brown",
			address1: "789 Pine St",
			city: "Newport",
			province: "RI",
			country: "US",
			zip: "02840",
			phone: "555-222-3333",
		},
		transactions: [
			{
				id: 3,
				kind: "sale",
				status: "success",
				amount: "215.50",
				created_at: "2024-07-26T09:15:00Z",
			},
		],
	},
];

const mockShop: ShopifyShop = {
	id: 12345,
	name: "Johns Apparel",
	email: "johndoe@example.com",
	domain: "johns-apparel.myshopify.com",
};

// Mock Notifications Data
const mockNotifications: Notification[] = [
	{
		id: "notification-1",
		userId: "user-1",
		type: "GENERAL",
		message: "Welcome to our platform!",
		read: false,
		createdAt: "2024-08-01T10:00:00Z",
	},
	{
		id: "notification-2",
		userId: "user-1",
		type: "ORDER_UPDATE",
		message: "Your order ORD12345 has been shipped.",
		read: false,
		createdAt: "2024-08-02T12:30:00Z",
		data: { orderId: "ORD12345" },
	},
	{
		id: "notification-3",
		userId: "user-1",
		type: "INVENTORY_ALERT",
		message: "Low stock alert for Product A.",
		read: true,
		createdAt: "2024-08-03T08:00:00Z",
		data: { productId: "Product A" },
	},
	{
		id: "notification-4",
		userId: "user-2",
		type: "INTEGRATION_STATUS",
		message: "Shopify integration successful.",
		read: false,
		createdAt: "2024-08-04T15:45:00Z",
		data: { integration: "Shopify" },
	},
	{
		id: "notification-5",
		userId: "user-2",
		type: "GENERAL",
		message: "New feature available: Advanced analytics dashboard.",
		read: false,
		createdAt: "2024-08-05T09:00:00Z",
	},
];

export const mockApiResponses: Record<string, Record<string, any>> = {
	get: {
		"/auth/me": {
			user: mockUsers[0],
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
		"/inventory": (): InventoryItem[] => mockInventory,
		"/warehouses": (): Warehouse[] => mockWarehouses,
		"/stock-movements": (): StockMovement[] => mockStockMovements,
		"/manufacturing-orders": (): ManufacturingOrder[] =>
			mockManufacturingOrders,
		"/orders": (): Order[] => mockOrders,
		"/orders/:id": (id: number): Order =>
			mockOrders.find((order: Order) => order.id === id) || mockOrders[0],
		"/shipments": (): Shipment[] => mockShipments,
		"/suppliers": (): Supplier[] => mockSuppliers,
		"/carriers": (): Carrier[] => mockCarriers,
		"/routes": (): Route[] => mockRoutes,
		"/freights": (): Freight[] => mockFreights,
		"/transports": (): Transport[] => mockTransports,
		"/users": (): User[] => mockUsers,
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
		"/demand-planning": () => ({
			demandPlanningKPIs: mockDemandPlanningKPIs,
			demandForecasts: mockDemandForecasts,
		}),
		"/area-chart": () => ({
			areaChartData: mockAreaChartData,
		}),
		"/shopify/orders": (): ShopifyOrder[] => mockShopifyOrders,
		"/shopify/shop": (): ShopifyShop => mockShop,
		"/notifications": (params: { userId: string }): Notification[] => {
			// Filter notifications by userId
			const userId = params.userId;
			return mockNotifications.filter(
				(notification) => notification.userId === userId
			);
		},
	},
	put: {
		"/users/me/profile": (data: Partial<User>): User => ({
			...mockUsers[0],
			...data,
		}),
		"/inventory/:id": (data: InventoryItem): InventoryItem => data,
		"/warehouses/:id": (data: Warehouse): Warehouse => data,
		"/stock-movements/:id": (data: StockMovement): StockMovement => data,
		"/manufacturing-orders/:id": (
			data: ManufacturingOrder
		): ManufacturingOrder => data,
		"/orders/:id": (data: Order): Order => data,
		"/shipments/:id": (data: Shipment): Shipment => data,
		"/suppliers/:id": (data: Supplier): Supplier => data,
		"/transports/:id": (data: Transport) => data,
		"/carriers/:id": (data: Carrier): Carrier => data,
		"/routes/:id": (data: Route): Route => data,
		"/freights/:id": (data: Freight) => data,
		"/users/:id": (data: User): User => data,
		"/notifications/:id/read": (data: Notification) => {
			console.log("mark notificaction read", data);
			return { ...data, read: true };
		},
	},
	delete: {
		"/inventory/:id": (id: number) => ({ success: true, deletedId: id }),
		"/warehouses/:id": (id: string) => ({ success: true, deletedId: id }),
		"/stock-movements/:id": (id: string) => ({ success: true, deletedId: id }),
		"/manufacturing-orders/:id": (id: string) => ({
			success: true,
			deletedId: id,
		}),
		"/orders/:id": (id: number) => ({ success: true, deletedId: id }),
		"/shipments/:id": (id: string) => ({ success: true, deletedId: id }),
		"/suppliers/:id": (id: string) => ({ success: true, deletedId: id }),
		"/transports/:id": (id: string) => ({ success: true, deletedId: id }),
		"/carriers/:id": (id: string) => ({ success: true, deletedId: id }),
		"/routes/:id": (id: string) => ({ success: true, deletedId: id }),
		"/freights/:id": (id: string) => ({ success: true, deletedId: id }),
		"/users/:id": (id: string) => ({ success: true, deletedId: id }),
		"/notification/:id": (id: string) => ({ success: true, deletedId: id }),
	},
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
				kycStatus: KYCStatus.NOT_STARTED,
				onboardingStatus: OnboardingStatus.NOT_STARTED,
				avatarUrl: data.avatarUrl || "/placeholder.svg",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				integrations: {
					ecommerce: {
						enabled: true,
						service: "shopify",
						apiKey: "shopify_admin_api_key",
						storeUrl: "johns-apparel.myshopify.com",
					},
					erp_crm: {
						enabled: true,
						service: "sap",
						apiKey: "sap_api_key",
					},
					iot: {
						enabled: true,
						service: "iot_monitoring",
						apiKey: "iot_device_api_key",
					},
					bi_tools: {
						enabled: true,
						service: "power_bi",
						apiKey: "power_bi_api_key",
					},
				},
			},
			accessToken: "mock_access_token",
			refreshToken: "mock_refresh_token",
		}),
		"/auth/login": (data: {
			email: string;
			password: string;
		}): AuthResponse => ({
			user: mockUsers[0],
			accessToken: "mock-access-token",
			refreshToken: "mock-refresh-token",
		}),
		"/auth/refresh": (): AuthResponse => ({
			user: mockUsers[0],
			accessToken: "new_mock_access_token",
			refreshToken: "new_mock_refresh_token",
		}),
		"/auth/logout": () => ({ success: true }),
		"/auth/google": (): AuthResponse => ({
			user: mockUsers[0],
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
			supplierId: "supplier-1", // Add a default or dynamic supplier ID
		}),
		"/warehouses": (
			data: Omit<Warehouse, "id" | "createdAt" | "updatedAt">
		): Warehouse => ({
			...data,
			id: `WH${Math.floor(Math.random() * 1000)}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}),
		"/stock-movements": (data: Omit<StockMovement, "id">): StockMovement => ({
			...data,
			id: `SM${Math.floor(Math.random() * 1000)}`,
		}),
		"/manufacturing-orders": (
			data: Omit<ManufacturingOrder, "id">
		): ManufacturingOrder => ({
			...data,
			id: `MO${Math.floor(Math.random() * 1000)}`,
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
			carrier: "carrier-1", // Add a default or dynamic carrier ID
			routeId: "route-1", // Add a default or dynamic route ID
			freightId: "freight-1",
			name: `Shipment-${Math.floor(Math.random() * 100)}`,
		}),
		"/suppliers": (data: Omit<Supplier, "id">): Supplier => ({
			...data,
			id: `SUPP${Math.floor(Math.random() * 1000)}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}),
		"/transports": (data: Omit<Transport, "id">): Transport => ({
			...data,
			id: `TRANS${Math.floor(Math.random() * 1000)}`,
			currentLocation: mockGeoLocation,
		}),
		"/carriers": (data: Omit<Carrier, "id">): Carrier => ({
			...data,
			id: `CAR${Math.floor(Math.random() * 1000)}`,
		}),
		"/routes": (data: Omit<Route, "id">): Route => ({
			...data,
			id: `ROUTE${Math.floor(Math.random() * 1000)}`,
		}),
		"/freights": (data: Omit<Freight, "id">): Freight => ({
			...data,
			id: `FREIGHT${Math.floor(Math.random() * 1000)}`,
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
		"/notifications": (data: Omit<Notification, "id">): Notification => {
			return {
				...data,
				id: Math.random().toString(),
			};
		},
	},
};
