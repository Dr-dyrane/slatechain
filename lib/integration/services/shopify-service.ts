// lib/integartion/services/shopify-services

import type { IntegrationService, FetchResult } from "../integration-service";
import { createNotification } from "@/app/actions/notifications";
import Order from "@/app/api/models/Order";
import mongoose from "mongoose";

// Shopify API client for interacting with Shopify
export class ShopifyApiClient {
	private apiKey: string;
	private baseUrl: string;
	private storeUrl?: string;

	constructor(apiKey: string, storeUrl?: string) {
		this.apiKey = apiKey;
		this.storeUrl = storeUrl;
		this.baseUrl = storeUrl ? `https://${storeUrl}/admin/api/2023-07` : "";
	}

	// Generic request method for Shopify API
	async request<T>(endpoint: string, method = "GET", data?: any): Promise<T> {
		try {
			if (!this.baseUrl) {
				throw new Error("Store URL is required for Shopify API requests");
			}

			const url = `${this.baseUrl}${endpoint}`;
			const headers = {
				"X-Shopify-Access-Token": this.apiKey,
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
				throw new Error(`Shopify API error (${response.status}): ${errorText}`);
			}

			return (await response.json()) as T;
		} catch (error) {
			console.error("Shopify API request failed:", error);
			throw error;
		}
	}

	// Get shop information
	async getShopInfo(): Promise<any> {
		return this.request<any>("/shop.json");
	}

	// Get orders from Shopify
	async getOrders(limit = 50, status = "any"): Promise<any[]> {
		const response = await this.request<{ orders: any[] }>(
			`/orders.json?limit=${limit}&status=${status}`
		);
		return response.orders;
	}

	// Get products from Shopify
	async getProducts(limit = 50): Promise<any[]> {
		const response = await this.request<{ products: any[] }>(
			`/products.json?limit=${limit}`
		);
		return response.products;
	}

	// Get customers from Shopify
	async getCustomers(limit = 50): Promise<any[]> {
		const response = await this.request<{ customers: any[] }>(
			`/customers.json?limit=${limit}`
		);
		return response.customers;
	}

	// Test connection to Shopify
	async testConnection(): Promise<boolean> {
		try {
			await this.getShopInfo();
			return true;
		} catch (error) {
			console.error("Shopify connection test failed:", error);
			return false;
		}
	}
}

// Create Shopify order schema
const ShopifyOrderSchema = new mongoose.Schema(
	{
		shopifyId: { type: String, required: true, unique: true },
		orderNumber: { type: Number, required: true },
		createdAt: { type: Date, required: true },
		totalPrice: { type: String, required: true },
		customer: {
			id: Number,
			firstName: String,
			lastName: String,
			email: String,
			ordersCount: Number,
			totalSpent: String,
		},
		fulfillmentStatus: String,
		financialStatus: String,
		items: [
			{
				id: Number,
				title: String,
				quantity: Number,
				price: String,
				sku: String,
				name: String,
				variantId: Number,
				productId: Number,
			},
		],
		billingAddress: {
			firstName: String,
			lastName: String,
			address1: String,
			city: String,
			province: String,
			country: String,
			zip: String,
			phone: String,
		},
		shippingAddress: {
			firstName: String,
			lastName: String,
			address1: String,
			city: String,
			province: String,
			country: String,
			zip: String,
			phone: String,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true }
);

// Create Shopify shop schema
const ShopifyShopSchema = new mongoose.Schema(
	{
		shopifyId: { type: Number, required: true, unique: true },
		name: { type: String, required: true },
		email: String,
		domain: { type: String, required: true },
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true }
);

// Create models if they don't exist
const ShopifyOrder =
	mongoose.models.ShopifyOrder ||
	mongoose.model("ShopifyOrder", ShopifyOrderSchema);
const ShopifyShop =
	mongoose.models.ShopifyShop ||
	mongoose.model("ShopifyShop", ShopifyShopSchema);

// Shopify data mappers
export class ShopifyDataMappers {
	// Map Shopify order to app order model
	static mapToAppOrder(shopifyOrder: any, userId: string): any {
		return {
			orderNumber: `SHO-${shopifyOrder.order_number}`,
			customerId: shopifyOrder.customer
				? shopifyOrder.customer.id.toString()
				: "unknown",
			items: shopifyOrder.line_items.map((item: any) => ({
				productId: item.product_id.toString(),
				quantity: item.quantity,
				price: Number.parseFloat(item.price),
			})),
			totalAmount: Number.parseFloat(shopifyOrder.total_price),
			status: this.mapOrderStatus(
				shopifyOrder.fulfillment_status,
				shopifyOrder.financial_status
			),
			paid: shopifyOrder.financial_status === "paid",
			createdBy: userId,
		};
	}

	// Map Shopify order to ShopifyOrder model
	static mapToShopifyOrder(shopifyOrder: any, userId: string): any {
		return {
			shopifyId: shopifyOrder.id,
			orderNumber: shopifyOrder.order_number,
			createdAt: shopifyOrder.created_at,
			totalPrice: shopifyOrder.total_price,
			customer: shopifyOrder.customer
				? {
						id: shopifyOrder.customer.id,
						firstName: shopifyOrder.customer.first_name,
						lastName: shopifyOrder.customer.last_name,
						email: shopifyOrder.customer.email,
						ordersCount: shopifyOrder.customer.orders_count,
						totalSpent: shopifyOrder.customer.total_spent,
					}
				: null,
			fulfillmentStatus: shopifyOrder.fulfillment_status,
			financialStatus: shopifyOrder.financial_status,
			items: shopifyOrder.line_items.map((item: any) => ({
				id: item.id,
				title: item.title,
				quantity: item.quantity,
				price: item.price,
				sku: item.sku,
				name: item.name,
				variantId: item.variant_id,
				productId: item.product_id,
			})),
			billingAddress: shopifyOrder.billing_address
				? {
						firstName: shopifyOrder.billing_address.first_name,
						lastName: shopifyOrder.billing_address.last_name,
						address1: shopifyOrder.billing_address.address1,
						city: shopifyOrder.billing_address.city,
						province: shopifyOrder.billing_address.province,
						country: shopifyOrder.billing_address.country,
						zip: shopifyOrder.billing_address.zip,
						phone: shopifyOrder.billing_address.phone,
					}
				: null,
			shippingAddress: shopifyOrder.shipping_address
				? {
						firstName: shopifyOrder.shipping_address.first_name,
						lastName: shopifyOrder.shipping_address.last_name,
						address1: shopifyOrder.shipping_address.address1,
						city: shopifyOrder.shipping_address.city,
						province: shopifyOrder.shipping_address.province,
						country: shopifyOrder.shipping_address.country,
						zip: shopifyOrder.shipping_address.zip,
						phone: shopifyOrder.shipping_address.phone,
					}
				: null,
			userId,
		};
	}

	// Map Shopify shop to ShopifyShop model
	static mapToShopifyShop(shopifyShop: any, userId: string): any {
		return {
			shopifyId: shopifyShop.id,
			name: shopifyShop.name,
			email: shopifyShop.email,
			domain: shopifyShop.domain,
			userId,
		};
	}

	// Map Shopify order status to app order status
	private static mapOrderStatus(
		fulfillmentStatus: string | null,
		financialStatus: string
	): string {
		if (fulfillmentStatus === "fulfilled") return "DELIVERED";
		if (fulfillmentStatus === "partial") return "PROCESSING";
		if (fulfillmentStatus === null && financialStatus === "paid")
			return "PROCESSING";
		if (financialStatus === "refunded" || financialStatus === "voided")
			return "CANCELLED";
		return "PENDING";
	}
}

// Shopify Integration Service implementation
export class ShopifyIntegrationService implements IntegrationService {
	private apiKey: string;
	private userId: string;
	private storeUrl?: string;
	private apiClient: ShopifyApiClient;

	constructor(apiKey: string, userId: string, storeUrl?: string) {
		this.apiKey = apiKey;
		this.userId = userId;
		this.storeUrl = storeUrl;
		this.apiClient = new ShopifyApiClient(apiKey, storeUrl);
	}

	// Connect to Shopify
	async connect(): Promise<boolean> {
		try {
			return await this.apiClient.testConnection();
		} catch (error) {
			console.error("Failed to connect to Shopify:", error);
			return false;
		}
	}

	// Disconnect from Shopify
	async disconnect(): Promise<boolean> {
		// No specific disconnect action needed for Shopify
		return true;
	}

	// Check if connected to Shopify
	async isConnected(): Promise<boolean> {
		try {
			return await this.apiClient.testConnection();
		} catch (error) {
			return false;
		}
	}

	// Fetch data from Shopify and merge with app data
	async fetchData(): Promise<FetchResult> {
		try {
			const isConnected = await this.isConnected();
			if (!isConnected) {
				return {
					success: false,
					message:
						"Not connected to Shopify. Please check your API key and store URL and try again.",
				};
			}

			const errors: string[] = [];
			const results: Record<string, any> = {};

			// Fetch and process shop info
			try {
				const shopInfo = await this.apiClient.getShopInfo();
				results.shop = await this.processShopInfo(shopInfo.shop);
			} catch (error) {
				errors.push(
					`Shop info fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`
				);
			}

			// Fetch and process orders
			try {
				const shopifyOrders = await this.apiClient.getOrders(100);
				results.orders = await this.processOrders(shopifyOrders);
			} catch (error) {
				errors.push(
					`Order fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`
				);
			}

			// Create notification about the data fetch
			await createNotification(
				this.userId,
				"INTEGRATION_STATUS",
				"Shopify Data Fetch Completed",
				errors.length === 0
					? "Successfully fetched data from Shopify"
					: `Fetched data from Shopify with ${errors.length} errors`,
				{ results }
			);

			return {
				success: errors.length === 0,
				message:
					errors.length === 0
						? "Shopify data fetch completed successfully"
						: `Shopify data fetch completed with ${errors.length} errors`,
				data: results,
				errors: errors.length > 0 ? errors : undefined,
			};
		} catch (error) {
			console.error("Shopify data fetch failed:", error);
			return {
				success: false,
				message: `Shopify data fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`,
				errors: [error instanceof Error ? error.message : "Unknown error"],
			};
		}
	}

	// Process shop info from Shopify
	private async processShopInfo(shopInfo: any): Promise<any> {
		try {
			const mappedShop = ShopifyDataMappers.mapToShopifyShop(
				shopInfo,
				this.userId
			);

			// Check if shop already exists
			const existingShop = await ShopifyShop.findOne({
				shopifyId: mappedShop.shopifyId,
			});

			if (existingShop) {
				// Update existing shop
				Object.assign(existingShop, mappedShop);
				await existingShop.save();
				return {
					id: existingShop._id,
					name: existingShop.name,
					action: "updated",
				};
			} else {
				// Create new shop
				const newShop = new ShopifyShop(mappedShop);
				await newShop.save();
				return { id: newShop._id, name: newShop.name, action: "created" };
			}
		} catch (error) {
			console.error(`Failed to process shop info:`, error);
			throw error;
		}
	}

	// Process orders from Shopify
	private async processOrders(shopifyOrders: any[]): Promise<any[]> {
		const results = [];

		for (const shopifyOrder of shopifyOrders) {
			try {
				// Map to Shopify order model
				const mappedShopifyOrder = ShopifyDataMappers.mapToShopifyOrder(
					shopifyOrder,
					this.userId
				);

				// Check if Shopify order already exists
				const existingShopifyOrder = await ShopifyOrder.findOne({
					shopifyId: mappedShopifyOrder.shopifyId,
				});

				if (existingShopifyOrder) {
					// Update existing Shopify order
					Object.assign(existingShopifyOrder, mappedShopifyOrder);
					await existingShopifyOrder.save();
					results.push({
						id: existingShopifyOrder._id,
						orderNumber: existingShopifyOrder.orderNumber,
						action: "updated",
					});
				} else {
					// Create new Shopify order
					const newShopifyOrder = new ShopifyOrder(mappedShopifyOrder);
					await newShopifyOrder.save();
					results.push({
						id: newShopifyOrder._id,
						orderNumber: newShopifyOrder.orderNumber,
						action: "created",
					});

					// Also create a regular order in our system
					const appOrder = ShopifyDataMappers.mapToAppOrder(
						shopifyOrder,
						this.userId
					);
					const newOrder = new Order(appOrder);
					await newOrder.save();

					// Create notification for new order
					await createNotification(
						this.userId,
						"ORDER_UPDATE",
						"New Shopify Order",
						`New order #${shopifyOrder.order_number} received from Shopify`,
						{
							orderId: newOrder._id,
							orderNumber: newOrder.orderNumber,
							shopifyOrderId: shopifyOrder.id,
						}
					);
				}
			} catch (error) {
				console.error(`Failed to process Shopify order:`, error);
				results.push({
					error: `Failed to process Shopify order: ${error instanceof Error ? error.message : "Unknown error"}`,
				});
			}
		}

		return results;
	}
}
