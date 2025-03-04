// app/api/customer/recommended-products/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Inventory from "@/app/api/models/Inventory";
import Order from "@/app/api/models/Order";
import { OrderItem } from "@/lib/types";

const RATE_LIMIT = 60; // 60 requests per minute

export async function GET(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Get user's order history
			const userOrders = await Order.find({ customerId: userId }).sort({
				createdAt: -1,
			});

			// Extract product IDs from user's orders
			const purchasedProductIds = new Set<string>();
			const productFrequency: Record<string, number> = {};
			const productCategories = new Set<string>();

			userOrders.forEach((order) => {
				order.items.forEach((item: OrderItem) => {
					purchasedProductIds.add(item.productId);
					productFrequency[item.productId] =
						(productFrequency[item.productId] || 0) + 1;
				});
			});

			// Get product details for purchased products
			const purchasedProducts = await Inventory.find({
				_id: { $in: Array.from(purchasedProductIds) },
			});

			// Extract categories from purchased products
			purchasedProducts.forEach((product) => {
				if (product.category) {
					productCategories.add(product.category);
				}
			});

			// Find similar products based on categories
			const recommendedProducts = await Inventory.find({
				_id: { $nin: Array.from(purchasedProductIds) },
				category: { $in: Array.from(productCategories) },
				quantity: { $gt: 0 }, // Only recommend in-stock items
			}).limit(10);

			// Find frequently purchased products for easy reordering
			const frequentlyPurchased = purchasedProducts
				.sort(
					(a, b) =>
						(productFrequency[b._id.toString()] || 0) -
						(productFrequency[a._id.toString()] || 0)
				)
				.slice(0, 5);

			// Find new arrivals
			const oneMonthAgo = new Date();
			oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

			const newArrivals = await Inventory.find({
				createdAt: { $gte: oneMonthAgo },
				quantity: { $gt: 0 },
			}).limit(5);

			return NextResponse.json({
				recommendedProducts,
				frequentlyPurchased,
				newArrivals,
			});
		},
		"recommended_products_get",
		RATE_LIMIT
	);
}
