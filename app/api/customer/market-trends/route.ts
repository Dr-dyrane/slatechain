// app/api/customer/market-trend/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Inventory from "@/app/api/models/Inventory";
import Order from "@/app/api/models/Order";
import type { AreaChartData, ForecastDataPoint } from "@/lib/types";

const RATE_LIMIT = 60; // 60 requests per minute

export async function GET(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Get query parameters
			const { searchParams } = new URL(req.url);
			const category = searchParams.get("category");
			const months = Number.parseInt(searchParams.get("months") || "6");

			// Generate market trend data points for the next several months
			const dataPoints: ForecastDataPoint[] = [];

			// Get historical data to base trends on
			const orders = await Order.find({ userId })
				.sort({ createdAt: -1 })
				.limit(100);
			const inventoryItems = await Inventory.find();

			// Calculate baseline availability (total inventory count)
			const baselineAvailability = inventoryItems.length;

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
					seasonalFactor = 1.2;
				} else if (monthIndex <= 2) {
					// Q1: Jan, Feb, Mar
					seasonalFactor = 0.9;
				} else if (monthIndex <= 5) {
					// Q2: Apr, May, Jun
					seasonalFactor = 0.95;
				} else {
					// Q3: Jul, Aug, Sep
					seasonalFactor = 1.1;
				}

				// Add trend component (slight growth over time)
				const trendFactor = 1 + i * 0.02;

				// Add some randomness
				const randomFactor = 0.1;
				const randomVariation = (Math.random() * 2 - 1) * randomFactor;

				// Calculate forecast quantity
				const quantity = Math.round(
					baselineAvailability *
						seasonalFactor *
						trendFactor *
						(1 + randomVariation)
				);

				// Calculate confidence intervals
				const confidenceIntervalUpper = Math.round(
					quantity * (1 + (0.15 * (i + 1)) / months)
				);
				const confidenceIntervalLower = Math.round(
					quantity * (1 - (0.1 * (i + 1)) / months)
				);

				dataPoints.push({
					date: date.toISOString().split("T")[0], // Format as YYYY-MM-DD
					quantity,
					confidenceIntervalUpper,
					confidenceIntervalLower,
				});
			}

			const areaChartData: AreaChartData = {
				title: `Market Availability Forecast`,
				data: dataPoints,
				xAxisKey: "date",
				yAxisKey: "quantity",
				upperKey: "confidenceIntervalUpper",
				lowerKey: "confidenceIntervalLower",
			};

			return NextResponse.json({ areaChartData });
		},
		"market_trends_get",
		RATE_LIMIT
	);
}
