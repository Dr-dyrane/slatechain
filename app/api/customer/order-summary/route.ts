// app/api/customer/order-summary/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Order from "@/app/api/models/Order";

const RATE_LIMIT = 60; // 60 requests per minute

export async function GET(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Get all orders for this customer
			const orders = await Order.find({ customerId: userId });

			// Calculate summary statistics
			const totalOrders = orders.length;
			const totalSpent = orders.reduce(
				(sum, order) => sum + order.totalAmount,
				0
			);

			// Count orders by status
			const ordersByStatus = {
				PENDING: 0,
				PROCESSING: 0,
				SHIPPED: 0,
				DELIVERED: 0,
				CANCELLED: 0,
			};

			orders.forEach((order) => {
				const status = order.status as keyof typeof ordersByStatus;
				if (ordersByStatus.hasOwnProperty(status)) {
					ordersByStatus[status]++;
				}
			});

			// Calculate monthly spending
			const monthlySpending = [];
			const now = new Date();

			for (let i = 0; i < 6; i++) {
				const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
				const nextMonth = new Date(
					now.getFullYear(),
					now.getMonth() - i + 1,
					1
				);

				const monthlyOrders = orders.filter((order) => {
					const orderDate = new Date(order.createdAt);
					return orderDate >= month && orderDate < nextMonth;
				});

				const totalAmount = monthlyOrders.reduce(
					(sum, order) => sum + order.totalAmount,
					0
				);

				monthlySpending.push({
					month: month.toISOString().split("T")[0].substring(0, 7), // YYYY-MM format
					amount: totalAmount,
				});
			}

			// Reverse to get chronological order
			monthlySpending.reverse();

			return NextResponse.json({
				totalOrders,
				totalSpent,
				ordersByStatus,
				monthlySpending,
				activeOrders:
					ordersByStatus.PENDING +
					ordersByStatus.PROCESSING +
					ordersByStatus.SHIPPED,
			});
		},
		"order_summary_get",
		RATE_LIMIT
	);
}
