// app/api/shopify/orders/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import User from "@/app/api/models/User";
import axios from "axios";
import type { ShopifyOrder } from "@/lib/types";

const FETCH_RATE_LIMIT = 30;

// GET /api/shopify/orders - Get Shopify orders
export async function GET(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Fetch user
			const user = await User.findById(userId);
			if (!user) {
				return NextResponse.json(
					{
						success: false,
						code: "USER_NOT_FOUND",
						message: "User not found",
					},
					{ status: 404 }
				);
			}

			// Check if Shopify integration is enabled
			const shopifyIntegration = user.integrations?.ecommerce;
			if (
				!shopifyIntegration ||
				!shopifyIntegration.enabled ||
				shopifyIntegration.service !== "shopify"
			) {
				return NextResponse.json(
					{
						success: false,
						code: "INTEGRATION_DISABLED",
						message: "Shopify integration is not enabled",
					},
					{ status: 400 }
				);
			}

			// Check if API key and store URL are set
			if (!shopifyIntegration.apiKey || !shopifyIntegration.storeUrl) {
				return NextResponse.json(
					{
						success: false,
						code: "MISSING_CREDENTIALS",
						message: "Shopify API key or store URL is missing",
					},
					{ status: 400 }
				);
			}

			try {
				let orders: ShopifyOrder[] = [];

				orders = await fetchShopifyOrders(
					shopifyIntegration.apiKey,
					shopifyIntegration.storeUrl
				);

				return NextResponse.json({
					success: true,
					orders,
				});
			} catch (error: any) {
				console.error("Shopify API Error:", error);
				return NextResponse.json(
					{
						success: false,
						code: "SHOPIFY_API_ERROR",
						message: error.message || "Failed to fetch Shopify orders",
					},
					{ status: 500 }
				);
			}
		},
		"shopify_orders",
		FETCH_RATE_LIMIT
	);
}

// Function to fetch orders from Shopify API
async function fetchShopifyOrders(
	apiKey: string,
	storeUrl: string
): Promise<ShopifyOrder[]> {
	try {
		// Ensure storeUrl is properly formatted
		const baseUrl = storeUrl.endsWith("/") ? storeUrl.slice(0, -1) : storeUrl;

		// Make API call to Shopify
		const response = await axios.get(
			`${baseUrl}/admin/api/2023-07/orders.json?status=any&limit=50`,
			{
				headers: {
					"X-Shopify-Access-Token": apiKey,
					"Content-Type": "application/json",
				},
			}
		);

		// Return the orders from the response
		return response.data.orders;
	} catch (error) {
		console.error("Error fetching Shopify orders:", error);
		throw error;
	}
}
