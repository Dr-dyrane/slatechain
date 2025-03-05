// app/api/shopify/orders/create/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { createNotification } from "@/app/actions/notifications";
import User from "@/app/api/models/User";
import Inventory from "@/app/api/models/Inventory";
import { verifyShopifyWebhook } from "@/lib/utils";

export async function POST(req: NextRequest) {
	try {
		// Verify the webhook is from Shopify
		const isValid = await verifyShopifyWebhook(req);
		if (!isValid) {
			return NextResponse.json(
				{ success: false, message: "Invalid webhook signature" },
				{ status: 401 }
			);
		}

		// Get the order data from the request
		const orderData = await req.json();

		// Find the user with this Shopify integration
		const user = await User.findOne({
			"integrations.ecommerce.service": "shopify",
			"integrations.ecommerce.enabled": true,
			"metadata.shopifyOrderSync.enabled": true,
		});

		if (!user) {
			return NextResponse.json(
				{
					success: false,
					message: "No user found with active Shopify integration",
				},
				{ status: 404 }
			);
		}

		// Process the order
		// 1. Update inventory quantities
		for (const lineItem of orderData.line_items) {
			if (lineItem.sku) {
				const inventoryItem = await Inventory.findOne({ sku: lineItem.sku });
				if (inventoryItem) {
					// Decrease inventory quantity
					await Inventory.findByIdAndUpdate(inventoryItem._id, {
						$inc: { quantity: -lineItem.quantity },
					});

					// Create notification if inventory is low
					if (
						inventoryItem.quantity - lineItem.quantity <=
						inventoryItem.minAmount
					) {
						await createNotification(
							user._id,
							"INVENTORY_ALERT",
							"Low Stock Alert",
							`${inventoryItem.name} (SKU: ${inventoryItem.sku}) is running low on stock after a Shopify order.`,
							{
								itemId: inventoryItem._id,
								sku: inventoryItem.sku,
								currentQuantity: inventoryItem.quantity - lineItem.quantity,
								minAmount: inventoryItem.minAmount,
							}
						);
					}
				}
			}
		}

		// 2. Create notification about the new order
		await createNotification(
			user._id,
			"ORDER_UPDATE",
			"New Shopify Order",
			`New order #${orderData.order_number} received from Shopify for $${orderData.total_price}.`,
			{
				orderId: orderData.id,
				orderNumber: orderData.order_number,
				totalPrice: orderData.total_price,
				customerName: `${orderData.customer.first_name} ${orderData.customer.last_name}`,
				lineItemCount: orderData.line_items.length,
			}
		);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error processing Shopify order webhook:", error);
		return NextResponse.json(
			{
				success: false,
				message:
					error instanceof Error
						? error.message
						: "Error processing Shopify order webhook",
			},
			{ status: 500 }
		);
	}
}
