// lib/integration/services/power-bi-services

import type { IntegrationService, FetchResult } from "../integration-service";
import { createNotification } from "@/app/actions/notifications";
import Order from "@/app/api/models/Order";
import Inventory from "@/app/api/models/Inventory";
import Shipment from "@/app/api/models/Shipment";


// Power BI API client for interacting with Power BI
export class PowerBiApiClient {
	private apiKey: string;
	private baseUrl: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
		// Use a public URL instead of an environment variable
		this.baseUrl = "https://api.powerbi.com/v1.0";
	}

	// Generic request method for Power BI API
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
				throw new Error(
					`Power BI API error (${response.status}): ${errorText}`
				);
			}

			return (await response.json()) as T;
		} catch (error) {
			console.error("Power BI API request failed:", error);
			throw error;
		}
	}

	// Get dashboards from Power BI
	async getDashboards(): Promise<any[]> {
		return this.request<any[]>("/dashboards");
	}

	// Get reports from Power BI
	async getReports(): Promise<any[]> {
		return this.request<any[]>("/reports");
	}

	// Get datasets from Power BI
	async getDatasets(): Promise<any[]> {
		return this.request<any[]>("/datasets");
	}

	// Push data to a Power BI dataset
	async pushData(
		datasetId: string,
		tableName: string,
		rows: any[]
	): Promise<any> {
		return this.request<any>(
			`/datasets/${datasetId}/tables/${tableName}/rows`,
			"POST",
			{ rows }
		);
	}

	// Test connection to Power BI
	async testConnection(): Promise<boolean> {
		try {
			await this.request<any[]>("/dashboards");
			return true;
		} catch (error) {
			console.error("Power BI connection test failed:", error);
			return false;
		}
	}
}

// Power BI Integration Service implementation
export class PowerBiIntegrationService implements IntegrationService {
	private apiKey: string;
	private userId: string;
	private apiClient: PowerBiApiClient;

	constructor(apiKey: string, userId: string) {
		this.apiKey = apiKey;
		this.userId = userId;
		this.apiClient = new PowerBiApiClient(apiKey);
	}

	// Connect to Power BI
	async connect(): Promise<boolean> {
		try {
			return await this.apiClient.testConnection();
		} catch (error) {
			console.error("Failed to connect to Power BI:", error);
			return false;
		}
	}

	// Disconnect from Power BI
	async disconnect(): Promise<boolean> {
		// No specific disconnect action needed for Power BI
		return true;
	}

	// Check if connected to Power BI
	async isConnected(): Promise<boolean> {
		try {
			return await this.apiClient.testConnection();
		} catch (error) {
			return false;
		}
	}

	// Fetch data from app and push to Power BI
	async fetchData(): Promise<FetchResult> {
		try {
			const isConnected = await this.isConnected();
			if (!isConnected) {
				return {
					success: false,
					message:
						"Not connected to Power BI. Please check your API key and try again.",
				};
			}

			const errors: string[] = [];
			const results: Record<string, any> = {};

			// Get datasets to find the right ones to push data to
			const datasets = await this.apiClient.getDatasets();

			// Push inventory data to Power BI
			try {
				results.inventory = await this.pushInventoryData(datasets);
			} catch (error) {
				errors.push(
					`Inventory data push failed: ${error instanceof Error ? error.message : "Unknown error"}`
				);
			}

			// Push order data to Power BI
			try {
				results.orders = await this.pushOrderData(datasets);
			} catch (error) {
				errors.push(
					`Order data push failed: ${error instanceof Error ? error.message : "Unknown error"}`
				);
			}

			// Push shipment data to Power BI
			try {
				results.shipments = await this.pushShipmentData(datasets);
			} catch (error) {
				errors.push(
					`Shipment data push failed: ${error instanceof Error ? error.message : "Unknown error"}`
				);
			}

			// Create notification about the data push
			await createNotification(
				this.userId,
				"INTEGRATION_STATUS",
				"Power BI Data Push Completed",
				errors.length === 0
					? "Successfully pushed data to Power BI"
					: `Pushed data to Power BI with ${errors.length} errors`,
				{ results }
			);

			return {
				success: errors.length === 0,
				message:
					errors.length === 0
						? "Power BI data push completed successfully"
						: `Power BI data push completed with ${errors.length} errors`,
				data: results,
				errors: errors.length > 0 ? errors : undefined,
			};
		} catch (error) {
			console.error("Power BI data push failed:", error);
			return {
				success: false,
				message: `Power BI data push failed: ${error instanceof Error ? error.message : "Unknown error"}`,
				errors: [error instanceof Error ? error.message : "Unknown error"],
			};
		}
	}

	// Push inventory data to Power BI
	private async pushInventoryData(datasets: any[]): Promise<any> {
		// Find inventory dataset
		const inventoryDataset = datasets.find(
			(d) => d.name === "Inventory" || d.name === "InventoryData"
		);
		if (!inventoryDataset) {
			throw new Error("Inventory dataset not found in Power BI");
		}

		// Get inventory data from our app
		const inventory = await Inventory.find({}).lean();

		// Transform inventory data for Power BI
		const inventoryRows = inventory.map((item: any) => ({
			id: item._id.toString(),
			name: item.name,
			sku: item.sku,
			quantity: item.quantity,
			minAmount: item.minAmount,
			price: item.price,
			category: item.category,
			warehouseId: item.warehouseId,
			lastUpdated: new Date().toISOString(),
		}));

		// Push data to Power BI
		const result = await this.apiClient.pushData(
			inventoryDataset.id,
			"Inventory",
			inventoryRows
		);
		return {
			datasetId: inventoryDataset.id,
			tableName: "Inventory",
			rowCount: inventoryRows.length,
			result,
		};
	}

	// Push order data to Power BI
	private async pushOrderData(datasets: any[]): Promise<any> {
		// Find orders dataset
		const ordersDataset = datasets.find(
			(d) => d.name === "Orders" || d.name === "OrdersData"
		);
		if (!ordersDataset) {
			throw new Error("Orders dataset not found in Power BI");
		}

		// Get order data from our app
		const orders = await Order.find({}).lean();

		// Transform order data for Power BI
		const orderRows = orders.map((order: any) => ({
			id: order._id.toString(),
			orderNumber: order.orderNumber,
			customerId: order.customerId,
			totalAmount: order.totalAmount,
			status: order.status,
			paid: order.paid,
			createdAt: order.createdAt,
			itemCount: order.items.length,
		}));

		// Push data to Power BI
		const result = await this.apiClient.pushData(
			ordersDataset.id,
			"Orders",
			orderRows
		);
		return {
			datasetId: ordersDataset.id,
			tableName: "Orders",
			rowCount: orderRows.length,
			result,
		};
	}

	// Push shipment data to Power BI
	private async pushShipmentData(datasets: any[]): Promise<any> {
		// Find shipments dataset
		const shipmentsDataset = datasets.find(
			(d) => d.name === "Shipments" || d.name === "ShipmentsData"
		);
		if (!shipmentsDataset) {
			throw new Error("Shipments dataset not found in Power BI");
		}

		// Get shipment data from our app
		const shipments = await Shipment.find({}).lean();

		// Transform shipment data for Power BI
		const shipmentRows = shipments.map((shipment: any) => ({
			id: shipment._id.toString(),
			name: shipment.name,
			orderId: shipment.orderId,
			trackingNumber: shipment.trackingNumber,
			carrier: shipment.carrier,
			status: shipment.status,
			destination: shipment.destination,
			estimatedDeliveryDate: shipment.estimatedDeliveryDate,
			actualDeliveryDate: shipment.actualDeliveryDate,
		}));

		// Push data to Power BI
		const result = await this.apiClient.pushData(
			shipmentsDataset.id,
			"Shipments",
			shipmentRows
		);
		return {
			datasetId: shipmentsDataset.id,
			tableName: "Shipments",
			rowCount: shipmentRows.length,
			result,
		};
	}
}
