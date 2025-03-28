// src/lib/api/mockData.ts
import {
	User,
	InventoryItem,
	Order,
	Shipment,
	Supplier,
	Carrier,
	Route,
	Freight,
	Transport,
	Warehouse,
	StockMovement,
	ManufacturingOrder,
	Notification,
	GeoLocation,
	OrderItem,
	WarehouseZone,
	UserRole,
	ShopifyShop,
	ShopifyOrder,
	ShopifyLineItem,
	ShopifyAddress,
	ShopifyTransaction,
	StockMovementItem,
	QualityCheck,
	QualityParameter,
	BOMItem,
	NotificationType,
	KYCStatus,
	KYCDocument,
	OnboardingProgress,
	AuthResponse,
	OnboardingStatus,
	OnboardingStep,
	BillOfMaterials,
} from "@/lib/types";
import { ShopifyOrdersResponse, ShopifyShopResponse } from "../slices/shopifySlice";

// ==================== HELPER FUNCTIONS ====================

// Generate random date within a range
const randomDate = (start: Date, end: Date): string => {
	return new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime())
	).toISOString();
};

// Generate random number within a range
const randomNumber = (min: number, max: number): number => {
	return Math.floor(Math.random() * (max - min + 1) + min);
};

// Generate random boolean
const randomBoolean = (): boolean => {
	return Math.random() > 0.5;
};

// Generate random element from array
const randomElement = <T>(array: T[]): T => {
	return array[Math.floor(Math.random() * array.length)];
};

// Generate random price with 2 decimal places
const randomPrice = (min: number, max: number): number => {
	return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

// Generate random ID
const randomId = (prefix: string): string => {
	return `${prefix}-${Math.floor(Math.random() * 10000)}`;
};

// Generate random SKU
const randomSKU = (): string => {
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const numbers = "0123456789";
	let sku = "";
	for (let i = 0; i < 3; i++) {
		sku += letters.charAt(Math.floor(Math.random() * letters.length));
	}
	sku += "-";
	for (let i = 0; i < 4; i++) {
		sku += numbers.charAt(Math.floor(Math.random() * numbers.length));
	}
	return sku;
};

// Generate random phone number
const randomPhone = (): string => {
	return `+1${Math.floor(Math.random() * 1000)}-${Math.floor(Math.random() * 1000)}-${Math.floor(Math.random() * 10000)}`.padEnd(
		14,
		"0"
	);
};

// Generate random email
const randomEmail = (name: string): string => {
	const domains = [
		"gmail.com",
		"yahoo.com",
		"outlook.com",
		"company.com",
		"example.com",
	];
	return `${name.toLowerCase().replace(/\s/g, ".")}@${randomElement(domains)}`;
};

// ==================== MOCK DATA CONSTANTS ====================

const mockGeoLocation: GeoLocation = {
	latitude: 34.0522,
	longitude: -118.2437,
};

// Product categories
const productCategories = [
	"Electronics",
	"Clothing",
	"Books",
	"Home & Garden",
	"Toys",
	"Sports",
	"Automotive",
	"Health & Beauty",
	"Food & Beverage",
	"Office Supplies",
];

// Product names by category
const productNamesByCategory: Record<string, string[]> = {
	Electronics: [
		'Smart TV 55"',
		"Wireless Headphones",
		"Smartphone Pro Max",
		"Laptop Ultra",
		"Tablet Air",
		"Bluetooth Speaker",
		"Smartwatch Series 7",
		"Gaming Console X",
		"Wireless Earbuds",
		"Digital Camera 4K",
	],
	Clothing: [
		"Premium Cotton T-Shirt",
		"Slim Fit Jeans",
		"Wool Sweater",
		"Leather Jacket",
		"Athletic Shorts",
		"Formal Dress Shirt",
		"Winter Coat",
		"Summer Dress",
		"Running Shoes",
		"Business Suit",
	],
	Books: [
		"Business Strategy Guide",
		"Science Fiction Collection",
		"Cooking Masterclass",
		"History of Art",
		"Programming Fundamentals",
		"Self-Help Bestseller",
		"Fantasy Trilogy",
		"Biography Volume",
		"Travel Guide 2023",
		"Children's Illustrated Book",
	],
	"Home & Garden": [
		"Memory Foam Mattress",
		"Stainless Steel Cookware Set",
		"Indoor Plant Collection",
		"Smart Home Hub",
		"Luxury Bedding Set",
		"Kitchen Knife Set",
		"Outdoor Furniture Set",
		"Robot Vacuum Cleaner",
		"Ceramic Dinner Set",
		"Garden Tool Kit",
	],
	Toys: [
		"Building Blocks Set",
		"Remote Control Car",
		"Educational Puzzle",
		"Plush Animal Collection",
		"Action Figure Set",
		"Board Game Classic",
		"Science Experiment Kit",
		"Dollhouse Deluxe",
		"Art & Craft Kit",
		"Outdoor Play Equipment",
	],
	Sports: [
		"Yoga Mat Premium",
		"Tennis Racket Pro",
		"Basketball Official",
		"Fitness Tracker Elite",
		"Golf Club Set",
		"Camping Tent 4-Person",
		"Mountain Bike",
		"Swimming Goggles",
		"Dumbbells Set",
		"Hiking Backpack",
	],
	Automotive: [
		"Car Cleaning Kit",
		"Dash Camera HD",
		"Tire Pressure Monitor",
		"Car Battery Charger",
		"Floor Mats Custom",
		"Car Cover Weatherproof",
		"Emergency Road Kit",
		"Car Air Freshener Set",
		"Bluetooth Car Adapter",
		"Windshield Sun Shade",
	],
	"Health & Beauty": [
		"Vitamin Supplement Pack",
		"Skincare Gift Set",
		"Electric Toothbrush",
		"Hair Styling Tools",
		"Massage Gun",
		"Perfume Collection",
		"Makeup Palette",
		"Shaving Kit Premium",
		"Facial Cleansing Device",
		"Aromatherapy Diffuser",
	],
	"Food & Beverage": [
		"Gourmet Coffee Beans",
		"Organic Tea Collection",
		"Premium Chocolate Box",
		"Spice Gift Set",
		"Olive Oil Selection",
		"Protein Powder",
		"Wine Bottle Collection",
		"Healthy Snack Box",
		"Specialty Honey Jar",
		"Artisan Cheese Selection",
	],
	"Office Supplies": [
		"Ergonomic Office Chair",
		"Desk Organizer Set",
		"Wireless Keyboard & Mouse",
		"Premium Notebook Pack",
		"Desk Lamp LED",
		"Filing Cabinet",
		"Whiteboard Magnetic",
		"Business Card Holder",
		"Paper Shredder",
		"Printer Ink Cartridge Set",
	],
};

// Warehouse locations
const warehouseLocations = [
	"Los Angeles, CA",
	"New York, NY",
	"Chicago, IL",
	"Houston, TX",
	"Miami, FL",
	"Seattle, WA",
	"Denver, CO",
	"Atlanta, GA",
	"Boston, MA",
	"Dallas, TX",
];

// Supplier names
const supplierNames = [
	"Global Supply Co.",
	"Premium Products Inc.",
	"Quality Goods Ltd.",
	"Reliable Distributors",
	"Elite Manufacturing",
	"Innovative Supplies",
	"Prime Logistics",
	"Superior Products",
	"Advanced Materials Inc.",
	"Strategic Resources Ltd.",
];

// Customer names
const customerNames = [
	"John Smith",
	"Jane Doe",
	"Robert Johnson",
	"Emily Williams",
	"Michael Brown",
	"Sarah Davis",
	"David Miller",
	"Jennifer Wilson",
	"James Taylor",
	"Lisa Anderson",
	"Thomas Martinez",
	"Patricia Robinson",
	"Christopher Lee",
	"Barbara Walker",
	"Daniel Hall",
	"Elizabeth Young",
	"Matthew Allen",
	"Margaret King",
	"Anthony Wright",
	"Linda Scott",
];

// ==================== ENHANCED MOCK DATA ====================

// Generate a more comprehensive set of inventory items
const generateInventoryItems = (count: number): InventoryItem[] => {
	const items: InventoryItem[] = [];

	for (let i = 0; i < count; i++) {
		const category = randomElement(productCategories);
		const name = randomElement(productNamesByCategory[category]);
		const warehouseId = `warehouse-${randomNumber(1, 5)}`;
		const zoneId = `zone-${randomNumber(1, 5)}`;
		const supplierId = `supplier-${randomNumber(1, 10)}`;

		items.push({
			id: i + 1,
			name: name,
			sku: randomSKU(),
			quantity: randomNumber(10, 1000),
			minAmount: randomNumber(5, 50),
			replenishmentAmount: randomNumber(20, 100),
			warehouseId: warehouseId,
			zoneId: zoneId,
			lotNumber: `LN${randomNumber(1000, 9999)}`,
			expirationDate: randomDate(new Date(), new Date(2026, 0, 1)),
			serialNumber: `SN${randomNumber(10000, 99999)}`,
			price: randomPrice(10, 1000),
			unitCost: randomPrice(5, 500),
			category: category,
			description: `High-quality ${name.toLowerCase()} for all your needs.`,
			supplierId: supplierId,
			location: randomElement(warehouseLocations),
		});
	}

	return items;
};

// Generate more comprehensive orders
const generateOrders = (count: number): Order[] => {
	const orders: Order[] = [];

	for (let i = 0; i < count; i++) {
		const itemCount = randomNumber(1, 5);
		const items: OrderItem[] = [];
		let totalAmount = 0;

		for (let j = 0; j < itemCount; j++) {
			const quantity = randomNumber(1, 10);
			const price = randomPrice(10, 200);
			totalAmount += quantity * price;

			items.push({
				productId: `product-${randomNumber(1, 100)}`,
				quantity: quantity,
				price: price,
			});
		}

		const statuses = [
			"PENDING",
			"PROCESSING",
			"SHIPPED",
			"DELIVERED",
			"CANCELLED",
		];

		orders.push({
			id: i + 1,
			orderNumber: `ORD${String(10000 + i).padStart(5, "0")}`,
			customerId: `user-${randomNumber(1, 20)}`,
			name: `Order #${10000 + i}`,
			items: items,
			totalAmount: parseFloat(totalAmount.toFixed(2)),
			status: randomElement(statuses) as any,
			paid: randomBoolean(),
			createdAt: randomDate(new Date(2023, 0, 1), new Date()),
			updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
		});
	}

	return orders;
};

// Generate more comprehensive warehouses
const generateWarehouses = (count: number): Warehouse[] => {
	const warehouses: Warehouse[] = [];

	for (let i = 0; i < count; i++) {
		const zones: WarehouseZone[] = [];
		const zoneCount = randomNumber(2, 5);

		for (let j = 0; j < zoneCount; j++) {
			const zoneTypes = [
				"BULK",
				"PICKING",
				"COLD_STORAGE",
				"HAZMAT",
				"HIGH_VALUE",
			];
			const type = randomElement(zoneTypes) as any;
			const capacity = randomNumber(1000, 10000);
			const currentOccupancy = randomNumber(0, capacity);

			const zone: WarehouseZone = {
				id: `zone-${i}-${j}`,
				name: `${type} Zone ${j + 1}`,
				type: type,
				capacity: capacity,
				currentOccupancy: currentOccupancy,
				restrictions: [`${type} Only`, "Authorized Personnel"],
			};

			if (type === "COLD_STORAGE") {
				zone.temperature = randomNumber(-5, 10);
				zone.humidity = randomNumber(30, 90);
			}

			zones.push(zone);
		}

		const statuses = ["ACTIVE", "INACTIVE", "MAINTENANCE"];

		warehouses.push({
			id: `warehouse-${i + 1}`,
			name: `${randomElement(["Main", "Regional", "Distribution", "Central", "North", "South", "East", "West"])} Warehouse ${i + 1}`,
			location: randomElement(warehouseLocations),
			capacity: randomNumber(10000, 100000),
			utilizationPercentage: randomNumber(30, 95),
			zones: zones,
			status: randomElement(statuses) as any,
			createdAt: randomDate(new Date(2020, 0, 1), new Date(2022, 0, 1)),
			updatedAt: randomDate(new Date(2022, 0, 1), new Date()),
		});
	}

	return warehouses;
};

// Generate more comprehensive suppliers
const generateSuppliers = (count: number): Supplier[] => {
	const suppliers: Supplier[] = [];

	for (let i = 0; i < count; i++) {
		const name = supplierNames[i % supplierNames.length];
		const contactPerson =
			customerNames[randomNumber(0, customerNames.length - 1)];

		suppliers.push({
			id: `supplier-${i + 1}`,
			name: name,
			contactPerson: contactPerson,
			email: randomEmail(contactPerson),
			phoneNumber: randomPhone(),
			address: `${randomNumber(100, 9999)} ${randomElement(["Main", "Oak", "Pine", "Maple", "Cedar"])} ${randomElement(["St", "Ave", "Blvd", "Dr", "Ln"])}, ${randomElement(warehouseLocations)}`,
			rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // Rating between 3.0 and 5.0
			status: randomBoolean() ? "ACTIVE" : "INACTIVE",
			createdAt: randomDate(new Date(2020, 0, 1), new Date(2022, 0, 1)),
			updatedAt: randomDate(new Date(2022, 0, 1), new Date()),
		});
	}

	return suppliers;
};

// Generate more comprehensive shipments
const generateShipments = (count: number): Shipment[] => {
	const shipments: Shipment[] = [];
	const statuses = ["CREATED", "PREPARING", "IN_TRANSIT", "DELIVERED"];

	for (let i = 0; i < count; i++) {
		const status = randomElement(statuses) as any;
		const estimatedDeliveryDate = randomDate(
			new Date(),
			new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
		);

		shipments.push({
			id: `shipment-${i + 1}`,
			name: `Shipment-${i + 1}`,
			orderId: `${randomNumber(1, 50)}`,
			trackingNumber: `TN${String(randomNumber(10000, 99999))}`,
			carrier: `carrier-${randomNumber(1, 5)}`,
			freightId: `freight-${randomNumber(1, 10)}`,
			routeId: `route-${randomNumber(1, 10)}`,
			status: status,
			destination: randomElement(warehouseLocations),
			estimatedDeliveryDate: estimatedDeliveryDate,
			...(status === "DELIVERED" && {
				actualDeliveryDate: randomDate(
					new Date(estimatedDeliveryDate),
					new Date(
						new Date(estimatedDeliveryDate).getTime() + 2 * 24 * 60 * 60 * 1000
					)
				),
			}),
			currentLocation: {
				latitude: 34.0522 + (Math.random() - 0.5) * 10,
				longitude: -118.2437 + (Math.random() - 0.5) * 10,
			},
		});
	}

	return shipments;
};

// Generate more comprehensive users
const generateUsers = (count: number): User[] => {
	const users: User[] = [];
	const roles = [
		UserRole.ADMIN,
		UserRole.CUSTOMER,
		UserRole.MANAGER,
		UserRole.SUPPLIER,
	];

	for (let i = 0; i < count; i++) {
		const firstName = customerNames[i % customerNames.length].split(" ")[0];
		const lastName = customerNames[i % customerNames.length].split(" ")[1];
		const role = roles[i % roles.length];

		users.push({
			id: `user-${i + 1}`,
			firstName: firstName,
			lastName: lastName,
			name: `${firstName} ${lastName}`,
			email: randomEmail(`${firstName}.${lastName}`),
			phoneNumber: randomPhone(),
			role: role,
			isEmailVerified: randomBoolean(),
			isPhoneVerified: randomBoolean(),
			kycStatus: randomElement([
				KYCStatus.APPROVED,
				KYCStatus.IN_PROGRESS,
				KYCStatus.NOT_STARTED,
				KYCStatus.PENDING_REVIEW,
				KYCStatus.REJECTED,
			]),
			onboardingStatus: randomElement([
				OnboardingStatus.COMPLETED,
				OnboardingStatus.IN_PROGRESS,
				OnboardingStatus.NOT_STARTED,
				OnboardingStatus.PENDING,
			]),
			avatarUrl: `https://randomuser.me/api/portraits/${randomBoolean() ? "men" : "women"}/${i % 100}.jpg`,
			createdAt: randomDate(new Date(2020, 0, 1), new Date()),
			updatedAt: randomDate(new Date(2022, 0, 1), new Date()),
			integrations: {
				ecommerce: {
					enabled: randomBoolean(),
					service: randomBoolean() ? "shopify" : null,
					apiKey: randomBoolean() ? `api_key_${randomId("key")}` : null,
					storeUrl: randomBoolean()
						? `${firstName.toLowerCase()}-store.myshopify.com`
						: null,
				},
				erp_crm: {
					enabled: randomBoolean(),
					service: randomBoolean() ? "sap" : null,
					apiKey: randomBoolean() ? `api_key_${randomId("key")}` : null,
				},
				iot: {
					enabled: randomBoolean(),
					service: randomBoolean() ? "iot_monitoring" : null,
					apiKey: randomBoolean() ? `api_key_${randomId("key")}` : null,
				},
				bi_tools: {
					enabled: randomBoolean(),
					service: randomBoolean() ? "power_bi" : null,
					apiKey: randomBoolean() ? `api_key_${randomId("key")}` : null,
				},
			},
		});
	}

	return users;
};

// Generate more comprehensive Shopify orders
const generateShopifyOrders = (count: number): ShopifyOrder[] => {
	const orders: ShopifyOrder[] = [];
	const fulfillmentStatuses = [
		"fulfilled",
		"partial",
		"unfulfilled",
		"pending",
		null,
	];
	const financialStatuses = [
		"paid",
		"pending",
		"authorized",
		"partially_paid",
		"refunded",
		"voided",
	];

	for (let i = 0; i < count; i++) {
		const orderNumber = 1000 + i;
		const createdAt = randomDate(new Date(2023, 0, 1), new Date());
		const lineItemCount = randomNumber(1, 5);
		const lineItems: ShopifyLineItem[] = [];
		let totalPrice = 0;

		for (let j = 0; j < lineItemCount; j++) {
			const category = randomElement(productCategories);
			const productName = randomElement(productNamesByCategory[category]);
			const quantity = randomNumber(1, 5);
			const price = randomPrice(10, 200).toFixed(2);
			totalPrice += parseFloat(price) * quantity;

			lineItems.push({
				id: j + 1,
				title: productName,
				quantity: quantity,
				price: price,
				sku: randomSKU(),
				name: productName,
				variant_id: randomNumber(1000, 9999),
				product_id: randomNumber(100, 999),
			});
		}

		const customerIndex = randomNumber(0, customerNames.length - 1);
		const customerName = customerNames[customerIndex].split(" ");
		const firstName = customerName[0];
		const lastName = customerName[1];
		const email = randomEmail(`${firstName}.${lastName}`);

		const address: ShopifyAddress = {
			first_name: firstName,
			last_name: lastName,
			address1: `${randomNumber(100, 9999)} ${randomElement(["Main", "Oak", "Pine", "Maple", "Cedar"])} ${randomElement(["St", "Ave", "Blvd", "Dr", "Ln"])}`,
			city: randomElement(warehouseLocations.map((loc) => loc.split(",")[0])),
			province: randomElement(["CA", "NY", "TX", "FL", "IL"]),
			country: "US",
			zip: `${randomNumber(10000, 99999)}`,
			phone: randomPhone(),
		};

		const fulfillmentStatus = randomElement(fulfillmentStatuses);
		const financialStatus = randomElement(financialStatuses);

		const transactions: ShopifyTransaction[] = [];
		if (financialStatus !== "pending") {
			transactions.push({
				id: randomNumber(1000, 9999),
				kind: "sale",
				status: financialStatus === "paid" ? "success" : financialStatus,
				amount: totalPrice.toFixed(2),
				created_at: createdAt,
			});
		}

		orders.push({
			id: `order-${i + 1}`,
			order_number: orderNumber,
			created_at: createdAt,
			total_price: totalPrice.toFixed(2),
			customer: {
				id: customerIndex + 1,
				first_name: firstName,
				last_name: lastName,
				email: email,
				orders_count: randomNumber(1, 10),
				total_spent: (totalPrice * randomNumber(1, 5)).toFixed(2),
				default_address: address,
			},
			fulfillment_status: fulfillmentStatus,
			financial_status: financialStatus,
			line_items: lineItems,
			billing_address: address,
			shipping_address: address,
			transactions: transactions,
		});
	}

	return orders;
};

// Generate more comprehensive Shopify shops
const generateShopifyShops = (count: number): ShopifyShop[] => {
	const shops: ShopifyShop[] = [];

	for (let i = 0; i < count; i++) {
		const shopName = `${randomElement(["Trendy", "Modern", "Classic", "Elite", "Premium", "Luxury", "Budget", "Discount", "Quality", "Global"])} ${randomElement(["Shop", "Store", "Boutique", "Emporium", "Market", "Outlet", "Bazaar", "Mart"])}`;
		const domainPrefix = shopName.toLowerCase().replace(/\s/g, "-");

		shops.push({
			id: 10000 + i,
			name: shopName,
			email: `info@${domainPrefix}.com`,
			domain: `${domainPrefix}.myshopify.com`,
		});
	}

	return shops;
};

// Generate more comprehensive stock movements
const generateStockMovements = (count: number): StockMovement[] => {
	const movements: StockMovement[] = [];
	const types = ["RECEIVING", "DISPATCH", "TRANSFER"];
	const statuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

	for (let i = 0; i < count; i++) {
		const type = randomElement(types) as any;
		const status = randomElement(statuses) as any;
		const itemCount = randomNumber(1, 5);
		const items: StockMovementItem[] = [];

		for (let j = 0; j < itemCount; j++) {
			items.push({
				inventoryItemId: `${randomNumber(1, 100)}`,
				quantity: randomNumber(10, 100),
				lotNumber: randomBoolean()
					? `LN${randomNumber(1000, 9999)}`
					: undefined,
				serialNumber: randomBoolean()
					? `SN${randomNumber(10000, 99999)}`
					: undefined,
			});
		}

		const scheduledDate = randomDate(
			new Date(2023, 0, 1),
			new Date(2024, 0, 1)
		);

		movements.push({
			id: `movement-${i + 1}`,
			type: type,
			sourceLocationId:
				type === "RECEIVING"
					? `supplier-${randomNumber(1, 10)}`
					: `warehouse-${randomNumber(1, 5)}`,
			destinationLocationId:
				type === "DISPATCH"
					? `customer-${randomNumber(1, 20)}`
					: `warehouse-${randomNumber(1, 5)}`,
			items: items,
			status: status,
			scheduledDate: scheduledDate,
			...(status === "COMPLETED" && {
				completedDate: randomDate(new Date(scheduledDate), new Date()),
			}),
			handledBy: `user-${randomNumber(1, 20)}`,
		});
	}

	return movements;
};

// Generate more comprehensive manufacturing orders
const generateManufacturingOrders = (count: number): ManufacturingOrder[] => {
	const orders: ManufacturingOrder[] = [];
	const statuses = ["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
	const priorities = ["LOW", "MEDIUM", "HIGH"];

	for (let i = 0; i < count; i++) {
		const status = randomElement(statuses) as any;
		const startDate = randomDate(new Date(2023, 0, 1), new Date(2024, 0, 1));
		const endDate = randomDate(
			new Date(startDate),
			new Date(new Date(startDate).getTime() + 30 * 24 * 60 * 60 * 1000)
		);

		const qualityChecks: QualityCheck[] = [];
		if (status === "IN_PROGRESS" || status === "COMPLETED") {
			const checkCount = randomNumber(1, 3);
			for (let j = 0; j < checkCount; j++) {
				const checkTypes = [
					"Visual Inspection",
					"Performance Test",
					"Dimensional Measurement",
					"Functional Test",
					"Stress Test",
				];
				const checkStatuses = ["PENDING", "PASSED", "FAILED"];

				const parameters: QualityParameter[] = [];
				const paramCount = randomNumber(1, 5);
				for (let k = 0; k < paramCount; k++) {
					const paramTypes = ["STRING", "NUMBER"];
					const type = randomElement(paramTypes) as any;

					parameters.push({
						name: `Parameter ${k + 1}`,
						expected:
							type === "STRING"
								? randomElement([
										"Red",
										"Blue",
										"Green",
										"Yellow",
										"Black",
										"White",
									])
								: randomNumber(10, 100),
						actual:
							type === "STRING"
								? randomElement([
										"Red",
										"Blue",
										"Green",
										"Yellow",
										"Black",
										"White",
									])
								: randomNumber(10, 100),
						...(type === "NUMBER" && { tolerance: randomNumber(1, 5) }),
						passed: randomBoolean(),
						type: type,
					});
				}

				qualityChecks.push({
					id: `qc-${i}-${j}`,
					type: randomElement(checkTypes),
					status: randomElement(checkStatuses) as any,
					checkedBy: `qc-inspector-${randomNumber(1, 5)}`,
					checkedAt: randomDate(new Date(startDate), new Date()),
					parameters: parameters,
					notes: randomBoolean()
						? "All parameters within acceptable range."
						: undefined,
				});
			}
		}

		const materials: BOMItem[] = [];
		const materialCount = randomNumber(2, 5);
		for (let j = 0; j < materialCount; j++) {
			materials.push({
				materialId: `raw-material-${randomNumber(1, 20)}`,
				quantity: randomNumber(1, 10),
				unit: randomElement(["kg", "piece", "meter", "liter", "gram"]),
				wastageAllowance: Number.parseFloat((Math.random() * 0.2).toFixed(2)),
			});
		}

		const billOfMaterials: BillOfMaterials = {
			id: `bom-${i + 1}`,
			inventoryItemId: `${randomNumber(1, 100)}`,
			materials: materials,
			laborHours: randomNumber(4, 24),
			machineHours: randomNumber(2, 12),
			instructions: `Assemble according to the blueprint version ${randomNumber(1, 5)}.${randomNumber(1, 9)}`,
			version: `${randomNumber(1, 5)}.${randomNumber(0, 9)}`,
		};

		orders.push({
			id: `morder-${i + 1}`,
			name: `Manufacturing Order ${i + 1}`,
			orderNumber: `MO${String(1000 + i).padStart(4, "0")}`,
			inventoryItemId: `${randomNumber(1, 100)}`,
			quantity: randomNumber(50, 500),
			status: status,
			startDate: startDate,
			endDate: endDate,
			...(status !== "PLANNED" && {
				actualStartDate: randomDate(
					new Date(startDate),
					new Date(new Date(startDate).getTime() + 2 * 24 * 60 * 60 * 1000)
				),
				...(status === "COMPLETED" && {
					actualEndDate: randomDate(
						new Date(endDate),
						new Date(new Date(endDate).getTime() + 2 * 24 * 60 * 60 * 1000)
					),
				}),
			}),
			priority: randomElement(priorities) as any,
			qualityChecks: qualityChecks,
			billOfMaterials: billOfMaterials,
		});
	}

	return orders;
};

// Generate more comprehensive notifications
const generateNotifications = (count: number): Notification[] => {
	const notifications: Notification[] = [];
	const types: NotificationType[] = [
		"GENERAL",
		"ORDER_UPDATE",
		"INVENTORY_ALERT",
		"WAREHOUSE_UPDATE",
		"INVENTORY_UPDATE",
		"STOCK_MOVEMENT",
		"MANUFACTURING_ORDER",
		"INTEGRATION_SYNC",
		"INTEGRATION_STATUS",
	];

	for (let i = 0; i < count; i++) {
		const type = randomElement(types);
		const userId = `user-${randomNumber(1, 20)}`;
		let title = "";
		let message = "";
		let data: Record<string, any> = {};

		switch (type) {
			case "GENERAL":
				title = randomElement([
					"Welcome!",
					"New Feature Available",
					"System Maintenance",
					"Important Announcement",
				]);
				message = randomElement([
					"Welcome to our platform!",
					"We've added new features to enhance your experience.",
					"System maintenance scheduled for this weekend.",
					"Important update regarding your account.",
				]);
				break;
			case "ORDER_UPDATE":
				const orderNumber = `ORD${String(10000 + randomNumber(1, 1000)).padStart(5, "0")}`;
				title = `Order ${orderNumber} ${randomElement(["Shipped", "Delivered", "Processing", "Cancelled"])}`;
				message = `Your order ${orderNumber} has been ${randomElement(["shipped", "delivered", "is being processed", "has been cancelled"])}.`;
				data = { orderId: orderNumber };
				break;
			case "INVENTORY_ALERT":
				const productName = randomElement(
					productNamesByCategory[randomElement(productCategories)]
				);
				title = `${randomElement(["Low Stock Alert", "Stock Replenished", "Stock Adjustment"])}`;
				message = `${randomElement(["Low stock alert for", "Stock replenished for", "Stock adjusted for"])} ${productName}.`;
				data = { productId: productName };
				break;
			case "WAREHOUSE_UPDATE":
				title = "Warehouse Update";
				message = `${randomElement(["New warehouse added", "Warehouse capacity updated", "Warehouse maintenance scheduled"])}.`;
				data = { warehouseId: `warehouse-${randomNumber(1, 5)}` };
				break;
			case "INVENTORY_UPDATE":
				title = "Inventory Update";
				message = `${randomNumber(5, 50)} new items added to inventory.`;
				break;
			case "STOCK_MOVEMENT":
				title = "Stock Movement";
				message = `Stock ${randomElement(["received", "dispatched", "transferred"])} successfully.`;
				data = { movementId: `movement-${randomNumber(1, 100)}` };
				break;
			case "MANUFACTURING_ORDER":
				const moNumber = `MO${String(1000 + randomNumber(1, 1000)).padStart(4, "0")}`;
				title = `Manufacturing Order ${moNumber}`;
				message = `Manufacturing order ${moNumber} ${randomElement(["created", "started", "completed", "delayed"])}.`;
				data = { orderId: moNumber };
				break;
			case "INTEGRATION_SYNC":
				title = "Integration Sync";
				message = `${randomElement(["Shopify", "SAP", "IoT", "Power BI"])} data synchronized successfully.`;
				data = {
					integration: randomElement(["Shopify", "SAP", "IoT", "Power BI"]),
				};
				break;
			case "INTEGRATION_STATUS":
				title = "Integration Status";
				message = `${randomElement(["Shopify", "SAP", "IoT", "Power BI"])} integration ${randomElement(["successful", "failed", "needs attention"])}.`;
				data = {
					integration: randomElement(["Shopify", "SAP", "IoT", "Power BI"]),
				};
				break;
		}

		notifications.push({
			id: `notification-${i + 1}`,
			userId: userId,
			type: type,
			title: title,
			message: message,
			data: Object.keys(data).length > 0 ? data : undefined,
			read: randomBoolean(),
			createdAt: randomDate(new Date(2023, 0, 1), new Date()),
		});
	}

	return notifications;
};

// ==================== GENERATE ENHANCED MOCK DATA ====================

const mockInventory = generateInventoryItems(50);
const mockOrders = generateOrders(30);
const mockWarehouses = generateWarehouses(5);
const mockSuppliers = generateSuppliers(10);
const mockShipments = generateShipments(20);
const mockUsers = generateUsers(20);
const mockShopifyOrders = generateShopifyOrders(30);
const mockShops = generateShopifyShops(3);
const mockStockMovements = generateStockMovements(25);
const mockManufacturingOrders = generateManufacturingOrders(15);
const mockNotifications = generateNotifications(30);

// ==================== MOCK API RESPONSES ====================

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
			roleSpecificData: [],
		}),
		// Fix the inventory endpoint response structure
		"/inventory": (): {
			items: InventoryItem[];
			page: number;
			totalPages: number;
		} => ({
			items: mockInventory,
			page: 1,
			totalPages: 1,
		}),
		"/warehouses": (): Warehouse[] => mockWarehouses,
		"/stock-movements": (): StockMovement[] => mockStockMovements,
		"/manufacturing-orders": (): ManufacturingOrder[] =>
			mockManufacturingOrders,
		"/orders": (): Order[] => mockOrders,
		"/orders/:id": (id: number): Order =>
			mockOrders.find((order: Order) => order.id === id) || mockOrders[0],
		"/shipments": (): Shipment[] => mockShipments,
		"/suppliers": (): Supplier[] => mockSuppliers,
		"/carriers": (): Carrier[] => [
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
			{
				id: "carrier-4",
				name: "Global Shipping Ltd.",
				contactPerson: "David Brown",
				email: "david@globalshipping.com",
				phone: "+15553698741",
				rating: 4.5,
				status: "ACTIVE",
			},
			{
				id: "carrier-5",
				name: "Fast Freight Services",
				contactPerson: "Emma Wilson",
				email: "emma@fastfreight.com",
				phone: "+15557412589",
				rating: 4.3,
				status: "INACTIVE",
			},
		],
		"/routes": (): Route[] => [
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
			{
				id: "route-4",
				name: "Boston to Atlanta",
				startLocation: "Boston, MA",
				endLocation: "Atlanta, GA",
				distance: 1089,
				estimatedDuration: 18,
			},
			{
				id: "route-5",
				name: "Denver to San Francisco",
				startLocation: "Denver, CO",
				endLocation: "San Francisco, CA",
				distance: 1254,
				estimatedDuration: 20,
			},
		],
		"/freights": (): Freight[] => [
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
			{
				id: "freight-4",
				type: "Clothing",
				name: "Fashion Apparel",
				weight: 200,
				volume: 25,
				hazardous: false,
				specialInstructions: "Keep dry and clean.",
			},
			{
				id: "freight-5",
				type: "Machinery",
				name: "Industrial Equipment",
				weight: 2000,
				volume: 40,
				hazardous: false,
				specialInstructions:
					"Heavy machinery; use appropriate lifting equipment.",
			},
		],
		"/transports": (): Transport[] => [
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
			{
				id: "T004",
				type: "TRUCK",
				capacity: 1500,
				currentLocation: { latitude: 33.4484, longitude: -112.074 },
				status: "AVAILABLE",
				carrierId: "carrier-4",
			},
			{
				id: "T005",
				type: "TRUCK",
				capacity: 800,
				currentLocation: { latitude: 29.7604, longitude: -95.3698 },
				status: "MAINTENANCE",
				carrierId: "carrier-5",
			},
		],
		// Special handler for paginated users endpoint
		"/users": (params: any) => {
			// Parse pagination parameters
			const page = Number.parseInt(params?.page) || 1;
			const limit = Number.parseInt(params?.limit) || 10;
			const startIndex = (page - 1) * limit;
			const totalUsers = mockUsers.length;

			// Calculate actual number of users to return (handle edge case at the end)
			const actualLimit = Math.min(limit, totalUsers - startIndex);

			// Get users for this page
			const users =
				startIndex < totalUsers
					? mockUsers.slice(startIndex, startIndex + actualLimit)
					: [];

			return {
				users,
				pagination: {
					total: totalUsers,
					page,
					limit,
					pages: Math.ceil(totalUsers / limit),
				},
			};
		},
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
			demandPlanningKPIs: {
				forecastAccuracy: 0.85,
				meanAbsoluteDeviation: 25,
				bias: 5,
				serviceLevel: 0.95,
			},
			demandForecasts: [
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
			],
		}),
		"/area-chart": () => ({
			areaChartData: {
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
			},
		}),
		// Fix the Shopify orders endpoint response structure
		"/shopify/orders": (): ShopifyOrdersResponse => ({
			success: true,
			orders: mockShopifyOrders,
		}),
		// Fix the Shopify shop endpoint response structure
		"/shopify/shop": (): ShopifyShopResponse => ({
			success: true,
			shop: mockShops[0],
		}),
		"/notifications": (): Notification[] => mockNotifications,
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
			console.log("mark notification read", data);
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
			roleSpecificData: [],
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
