// lib/integartion/services/sap-service

import type { IntegrationService, FetchResult } from "../integration-service";
import Order from "@/app/api/models/Order";
import Inventory from "@/app/api/models/Inventory";
import Warehouse from "@/app/api/models/Warehouse";
import Shipment from "@/app/api/models/Shipment";
import Transport from "@/app/api/models/Transport";
import { createNotification } from "@/app/actions/notifications";

// SAP API client for interacting with SAP systems
export class SapApiClient {
	private apiKey: string;
	private baseUrl: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
		// Use a public URL instead of an environment variable
		this.baseUrl = "https://api.sap.com/v1";
	}

	// Generic request method for SAP API
	async request<T>(endpoint: string, method = "GET", data?: any): Promise<T> {
		try {
			const url = `${this.baseUrl}${endpoint}`;
			const headers = {
				Authorization: `Bearer ${this.apiKey}`,
				"Content-Type": "application/json",
				Accept: "application/json",
			};

			const response = await fetch(url, {
				method,
				headers,
				body: data ? JSON.stringify(data) : undefined,
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`SAP API error (${response.status}): ${errorText}`);
			}

			return (await response.json()) as T;
		} catch (error) {
			console.error("SAP API request failed:", error);
			throw error;
		}
	}

	// Get orders from SAP
	async getOrders(): Promise<any[]> {
		return this.request<any[]>("/orders");
	}

	// Get inventory items from SAP
	async getInventory(): Promise<any[]> {
		return this.request<any[]>("/inventory");
	}

	// Get warehouses from SAP
	async getWarehouses(): Promise<any[]> {
		return this.request<any[]>("/warehouses");
	}

	// Get shipments from SAP
	async getShipments(): Promise<any[]> {
		return this.request<any[]>("/shipments");
	}

	// Get transports from SAP
	async getTransports(): Promise<any[]> {
		return this.request<any[]>("/transports");
	}

	// Test connection to SAP
	async testConnection(): Promise<boolean> {
		try {
			await this.request<{ status: string }>("/system/status");
			return true;
		} catch (error) {
			console.error("SAP connection test failed:", error);
			return false;
		}
	}
}

// SAP data mappers to transform SAP data to app data models
export class SapDataMappers {
	// Map SAP order to app order model
	static mapOrder(sapOrder: any, userId: string): any {
		return {
			orderNumber: sapOrder.orderNumber,
			customerId: sapOrder.customerId,
			items: sapOrder.items.map((item: any) => ({
				productId: item.productId,
				quantity: item.quantity,
				price: item.price,
			})),
			totalAmount: sapOrder.totalAmount,
			status: this.mapOrderStatus(sapOrder.status),
			paid: sapOrder.paymentStatus === "PAID",
			createdBy: userId,
		};
	}

	// Map SAP order status to app order status
	private static mapOrderStatus(sapStatus: string): string {
		const statusMap: Record<string, string> = {
			NEW: "PENDING",
			IN_PROCESS: "PROCESSING",
			SHIPPED: "SHIPPED",
			DELIVERED: "DELIVERED",
			CANCELLED: "CANCELLED",
		};
		return statusMap[sapStatus] || "PENDING";
	}

	// Map SAP inventory item to app inventory model
	static mapInventoryItem(sapItem: any): any {
		return {
			name: sapItem.name,
			sku: sapItem.sku,
			quantity: sapItem.quantity,
			minAmount: sapItem.minAmount || 0,
			replenishmentAmount:
				sapItem.replenishmentAmount || sapItem.minAmount || 10,
			location: sapItem.location || "Default",
			warehouseId: sapItem.warehouseId,
			zoneId: sapItem.zoneId || "default",
			price: sapItem.price,
			unitCost: sapItem.unitCost,
			category: sapItem.category,
			description: sapItem.description || "",
			supplierId: sapItem.supplierId,
		};
	}

	// Map SAP warehouse to app warehouse model
	static mapWarehouse(sapWarehouse: any): any {
		return {
			name: sapWarehouse.name,
			location: sapWarehouse.location,
			capacity: sapWarehouse.capacity,
			utilizationPercentage: sapWarehouse.utilizationPercentage,
			status: sapWarehouse.status,
			zones: sapWarehouse.zones.map((zone: any) => ({
				name: zone.name,
				type: zone.type,
				capacity: zone.capacity,
				currentOccupancy: zone.currentOccupancy,
			})),
		};
	}

	// Map SAP shipment to app shipment model
	static mapShipment(sapShipment: any, userId: string): any {
		return {
			name: sapShipment.name || `Shipment ${sapShipment.id}`,
			orderId: sapShipment.orderId,
			trackingNumber: sapShipment.trackingNumber,
			carrier: sapShipment.carrier,
			freightId: sapShipment.freightId,
			routeId: sapShipment.routeId,
			status: this.mapShipmentStatus(sapShipment.status),
			destination: sapShipment.destination,
			estimatedDeliveryDate: sapShipment.estimatedDeliveryDate,
			actualDeliveryDate: sapShipment.actualDeliveryDate,
			currentLocation: sapShipment.currentLocation,
			userId: userId,
		};
	}

	// Map SAP shipment status to app shipment status
	private static mapShipmentStatus(sapStatus: string): string {
		const statusMap: Record<string, string> = {
			CREATED: "CREATED",
			PREPARING: "PREPARING",
			IN_TRANSIT: "IN_TRANSIT",
			DELIVERED: "DELIVERED",
		};
		return statusMap[sapStatus] || "CREATED";
	}

	// Map SAP transport to app transport model
	static mapTransport(sapTransport: any, userId: string): any {
		return {
			type: sapTransport.type,
			capacity: sapTransport.capacity,
			currentLocation: sapTransport.currentLocation,
			status: sapTransport.status,
			carrierId: sapTransport.carrierId,
			userId: userId,
		};
	}
}

// SAP Integration Service implementation
export class SapIntegrationService implements IntegrationService {
	private apiKey: string;
	private userId: string;
	private apiClient: SapApiClient;

	constructor(apiKey: string, userId: string) {
		this.apiKey = apiKey;
		this.userId = userId;
		this.apiClient = new SapApiClient(apiKey);
	}

	// Connect to SAP
	async connect(): Promise<boolean> {
		try {
			return await this.apiClient.testConnection();
		} catch (error) {
			console.error("Failed to connect to SAP:", error);
			return false;
		}
	}

	// Disconnect from SAP
	async disconnect(): Promise<boolean> {
		// No specific disconnect action needed for SAP
		return true;
	}

	// Check if connected to SAP
	async isConnected(): Promise<boolean> {
		try {
			return await this.apiClient.testConnection();
		} catch (error) {
			return false;
		}
	}

	// Fetch data from SAP and merge with app data
	async fetchData(): Promise<FetchResult> {
		try {
			const isConnected = await this.isConnected();
			if (!isConnected) {
				return {
					success: false,
					message:
						"Not connected to SAP. Please check your API key and try again.",
				};
			}

			const errors: string[] = [];
			const results: Record<string, any> = {};

			// Fetch and process orders
			try {
				const sapOrders = await this.apiClient.getOrders();
				results.orders = await this.processOrders(sapOrders);
			} catch (error) {
				errors.push(
					`Order fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`
				);
			}

			// Fetch and process inventory
			try {
				const sapInventory = await this.apiClient.getInventory();
				results.inventory = await this.processInventory(sapInventory);
			} catch (error) {
				errors.push(
					`Inventory fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`
				);
			}

			// Fetch and process warehouses
			try {
				const sapWarehouses = await this.apiClient.getWarehouses();
				results.warehouses = await this.processWarehouses(sapWarehouses);
			} catch (error) {
				errors.push(
					`Warehouse fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`
				);
			}

			// Fetch and process shipments
			try {
				const sapShipments = await this.apiClient.getShipments();
				results.shipments = await this.processShipments(sapShipments);
			} catch (error) {
				errors.push(
					`Shipment fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`
				);
			}

			// Fetch and process transports
			try {
				const sapTransports = await this.apiClient.getTransports();
				results.transports = await this.processTransports(sapTransports);
			} catch (error) {
				errors.push(
					`Transport fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`
				);
			}

			// Create notification about the data fetch
			await createNotification(
				this.userId,
				"INTEGRATION_STATUS",
				"SAP Data Fetch Completed",
				errors.length === 0
					? "Successfully fetched data from SAP"
					: `Fetched data from SAP with ${errors.length} errors`,
				{ results }
			);

			return {
				success: errors.length === 0,
				message:
					errors.length === 0
						? "SAP data fetch completed successfully"
						: `SAP data fetch completed with ${errors.length} errors`,
				data: results,
				errors: errors.length > 0 ? errors : undefined,
			};
		} catch (error) {
			console.error("SAP data fetch failed:", error);
			return {
				success: false,
				message: `SAP data fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`,
				errors: [error instanceof Error ? error.message : "Unknown error"],
			};
		}
	}

	// Process orders from SAP
	private async processOrders(sapOrders: any[]): Promise<any[]> {
		const results = [];

		for (const sapOrder of sapOrders) {
			try {
				const mappedOrder = SapDataMappers.mapOrder(sapOrder, this.userId);

				// Check if order already exists by order number
				const existingOrder = await Order.findOne({
					orderNumber: mappedOrder.orderNumber,
				});

				if (existingOrder) {
					// Update existing order
					Object.assign(existingOrder, mappedOrder);
					await existingOrder.save();
					results.push({
						id: existingOrder._id,
						orderNumber: existingOrder.orderNumber,
						action: "updated",
					});
				} else {
					// Create new order
					const newOrder = new Order(mappedOrder);
					await newOrder.save();
					results.push({
						id: newOrder._id,
						orderNumber: newOrder.orderNumber,
						action: "created",
					});
				}
			} catch (error) {
				console.error(`Failed to process order:`, error);
				results.push({
					error: `Failed to process order: ${error instanceof Error ? error.message : "Unknown error"}`,
				});
			}
		}

		return results;
	}

	// Process inventory from SAP
	private async processInventory(sapInventory: any[]): Promise<any[]> {
		const results = [];

		for (const sapItem of sapInventory) {
			try {
				const mappedItem = SapDataMappers.mapInventoryItem(sapItem);

				// Check if inventory item already exists by SKU
				const existingItem = await Inventory.findOne({ sku: mappedItem.sku });

				if (existingItem) {
					// Update existing item
					Object.assign(existingItem, mappedItem);
					await existingItem.save();
					results.push({
						id: existingItem._id,
						sku: existingItem.sku,
						action: "updated",
					});
				} else {
					// Create new item
					const newItem = new Inventory(mappedItem);
					await newItem.save();
					results.push({
						id: newItem._id,
						sku: newItem.sku,
						action: "created",
					});
				}
			} catch (error) {
				console.error(`Failed to process inventory item:`, error);
				results.push({
					error: `Failed to process inventory item: ${error instanceof Error ? error.message : "Unknown error"}`,
				});
			}
		}

		return results;
	}

	// Process warehouses from SAP
	private async processWarehouses(sapWarehouses: any[]): Promise<any[]> {
		const results = [];

		for (const sapWarehouse of sapWarehouses) {
			try {
				const mappedWarehouse = SapDataMappers.mapWarehouse(sapWarehouse);

				// Check if warehouse already exists by name
				const existingWarehouse = await Warehouse.findOne({
					name: mappedWarehouse.name,
				});

				if (existingWarehouse) {
					// Update existing warehouse
					Object.assign(existingWarehouse, mappedWarehouse);
					await existingWarehouse.save();
					results.push({
						id: existingWarehouse._id,
						name: existingWarehouse.name,
						action: "updated",
					});
				} else {
					// Create new warehouse
					const newWarehouse = new Warehouse(mappedWarehouse);
					await newWarehouse.save();
					results.push({
						id: newWarehouse._id,
						name: newWarehouse.name,
						action: "created",
					});
				}
			} catch (error) {
				console.error(`Failed to process warehouse:`, error);
				results.push({
					error: `Failed to process warehouse: ${error instanceof Error ? error.message : "Unknown error"}`,
				});
			}
		}

		return results;
	}

	// Process shipments from SAP
	private async processShipments(sapShipments: any[]): Promise<any[]> {
		const results = [];

		for (const sapShipment of sapShipments) {
			try {
				const mappedShipment = SapDataMappers.mapShipment(
					sapShipment,
					this.userId
				);

				// Check if shipment already exists by tracking number
				const existingShipment = await Shipment.findOne({
					trackingNumber: mappedShipment.trackingNumber,
				});

				if (existingShipment) {
					// Update existing shipment
					Object.assign(existingShipment, mappedShipment);
					await existingShipment.save();
					results.push({
						id: existingShipment._id,
						trackingNumber: existingShipment.trackingNumber,
						action: "updated",
					});
				} else {
					// Create new shipment
					const newShipment = new Shipment(mappedShipment);
					await newShipment.save();
					results.push({
						id: newShipment._id,
						trackingNumber: newShipment.trackingNumber,
						action: "created",
					});
				}
			} catch (error) {
				console.error(`Failed to process shipment:`, error);
				results.push({
					error: `Failed to process shipment: ${error instanceof Error ? error.message : "Unknown error"}`,
				});
			}
		}

		return results;
	}

	// Process transports from SAP
	private async processTransports(sapTransports: any[]): Promise<any[]> {
		const results = [];

		for (const sapTransport of sapTransports) {
			try {
				const mappedTransport = SapDataMappers.mapTransport(
					sapTransport,
					this.userId
				);

				// Create new transport (assuming transports are unique)
				const newTransport = new Transport(mappedTransport);
				await newTransport.save();
				results.push({
					id: newTransport._id,
					type: newTransport.type,
					action: "created",
				});
			} catch (error) {
				console.error(`Failed to process transport:`, error);
				results.push({
					error: `Failed to process transport: ${error instanceof Error ? error.message : "Unknown error"}`,
				});
			}
		}

		return results;
	}
}
