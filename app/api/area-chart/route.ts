// app/api/area-chart/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Inventory from "@/app/api/models/Inventory";
import Order from "@/app/api/models/Order";
import type { AreaChartData, ForecastDataPoint, OrderItem } from "@/lib/types";

const RATE_LIMIT = 60; // 60 requests per minute

export async function GET(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Get query parameters
			const { searchParams } = new URL(req.url);
			const itemId = searchParams.get("itemId");
			const months = Number.parseInt(searchParams.get("months") || "6");

			// Get inventory item if specified
			let itemName = "Overall Demand";
			if (itemId) {
				const item = await Inventory.findById(itemId);
				if (item) {
					itemName = item.name;
				}
			}

			// Generate forecast data points for the next several months
			const dataPoints: ForecastDataPoint[] = [];

			// Get historical data to base forecasts on
			const orders = await Order.find().sort({ createdAt: -1 }).limit(1000);

			// Calculate baseline demand (total or for specific item)
			let baselineDemand = 0;
			if (itemId) {
				const itemOrders = orders.filter((order) =>
					order.items.some((i: OrderItem) => i.productId === itemId)
				);

				baselineDemand =
					itemOrders.length > 0
						? itemOrders.reduce((sum, order) => {
								const orderItem = order.items.find(
									(i: OrderItem) => i.productId === itemId
								);
								return sum + (orderItem ? orderItem.quantity : 0);
							}, 0) / Math.max(1, itemOrders.length)
						: Math.floor(Math.random() * 100) + 50; // Fallback to random data if no orders
			} else {
				// Calculate total demand across all items
				baselineDemand =
					orders.length > 0
						? orders.reduce(
								(sum, order) =>
									sum +
									order.items.reduce(
										(itemSum: any, item: any) => itemSum + item.quantity,
										0
									),
								0
							) / Math.max(1, orders.length)
						: Math.floor(Math.random() * 1000) + 500; // Fallback to random data if no orders
			}

			// Generate data points for each month
			for (let i = 0; i < months; i++) {
				const date = new Date();
				date.setMonth(date.getMonth() + i);
				date.setDate(1);
				date.setHours(0, 0, 0, 0);

				// Add seasonal variation
				const monthIndex = date.getMonth();
				let seasonalFactor = 1.0;

				// Simple seasonal pattern: higher in Q4, lower in Q1
				if (monthIndex >= 9) {
					// Q4: Oct, Nov, Dec
					seasonalFactor = 1.3;
				} else if (monthIndex <= 2) {
					// Q1: Jan, Feb, Mar
					seasonalFactor = 0.8;
				} else if (monthIndex <= 5) {
					// Q2: Apr, May, Jun
					seasonalFactor = 0.9;
				} else {
					// Q3: Jul, Aug, Sep
					seasonalFactor = 1.1;
				}

				// Add trend component (slight growth over time)
				const trendFactor = 1 + i * 0.03;

				// Add some randomness
				const randomFactor = 0.1;
				const randomVariation = (Math.random() * 2 - 1) * randomFactor;

				// Calculate forecast quantity
				const quantity = Math.round(
					baselineDemand * seasonalFactor * trendFactor * (1 + randomVariation)
				);

				// Calculate confidence intervals
				const confidenceIntervalUpper = Math.round(
					quantity * (1 + (0.2 * (i + 1)) / months)
				);
				const confidenceIntervalLower = Math.round(
					quantity * (1 - (0.15 * (i + 1)) / months)
				);

				dataPoints.push({
					date: date.toISOString().split("T")[0], // Format as YYYY-MM-DD
					quantity,
					confidenceIntervalUpper,
					confidenceIntervalLower,
				});
			}

			const areaChartData: AreaChartData = {
				title: `${itemName} - Monthly Demand Forecast`,
				data: dataPoints,
				xAxisKey: "date",
				yAxisKey: "quantity",
				upperKey: "confidenceIntervalUpper",
				lowerKey: "confidenceIntervalLower",
			};

			return NextResponse.json({ areaChartData });
		},
		"area_chart_get",
		RATE_LIMIT
	);
}
