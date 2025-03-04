// app/api/kpis/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Order from "@/app/api/models/Order";
import Inventory from "@/app/api/models/Inventory";
import Shipment from "@/app/api/models/Shipment";
import { formatCurrency } from "@/lib/utils";

const RATE_LIMIT = 60; // 60 requests per minute

// function to format percentages consistently
function formatPercentage(value: number): string {
	const sign = value >= 0 ? "+" : "";
	return `${sign}${value.toFixed(1)}%`;
}

export async function GET(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Calculate total revenue from orders
			const orders = await Order.find({ status: { $ne: "CANCELLED" } });
			const totalRevenue = orders.reduce(
				(sum, order) => sum + (order.totalAmount || 0),
				0
			);

			// Calculate revenue from last month
			const lastMonth = new Date();
			lastMonth.setMonth(lastMonth.getMonth() - 1);
			const lastMonthOrders = await Order.find({
				createdAt: { $gte: lastMonth },
				status: { $ne: "CANCELLED" },
			});
			const lastMonthRevenue = lastMonthOrders.reduce(
				(sum, order) => sum + (order.totalAmount || 0),
				0
			);

			// Calculate revenue percentage change
			const previousMonth = new Date();
			previousMonth.setMonth(previousMonth.getMonth() - 2);
			const previousMonthOrders = await Order.find({
				createdAt: { $gte: previousMonth, $lt: lastMonth },
				status: { $ne: "CANCELLED" },
			});
			const previousMonthRevenue = previousMonthOrders.reduce(
				(sum, order) => sum + (order.totalAmount || 0),
				0
			);
			const revenuePercentChange =
				previousMonthRevenue > 0
					? ((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) *
						100
					: 100;

			// Get inventory count
			const inventoryCount = await Inventory.countDocuments();

			// Get inventory count from last month
			const lastMonthInventoryCount = await Inventory.countDocuments({
				createdAt: { $lt: lastMonth },
			});
			const inventoryPercentChange =
				lastMonthInventoryCount > 0
					? ((inventoryCount - lastMonthInventoryCount) /
							lastMonthInventoryCount) *
						100
					: 100;

			// Get active orders count
			const activeOrdersCount = await Order.countDocuments({
				status: { $in: ["PENDING", "PROCESSING"] },
			});

			// Get orders created in the last hour
			const lastHour = new Date();
			lastHour.setHours(lastHour.getHours() - 1);
			const lastHourOrdersCount = await Order.countDocuments({
				createdAt: { $gte: lastHour },
			});

			// Get shipments in transit count
			const shipmentsInTransitCount = await Shipment.countDocuments({
				status: "IN_TRANSIT",
			});

			// Get shipments created in the last hour
			const lastHourShipmentsCount = await Shipment.countDocuments({
				createdAt: { $gte: lastHour },
			});

			// Generate monthly revenue data for sparkline (last 12 months)
			const sparklineData = [];
			for (let i = 11; i >= 0; i--) {
				const monthStart = new Date();
				monthStart.setMonth(monthStart.getMonth() - i);
				monthStart.setDate(1);
				monthStart.setHours(0, 0, 0, 0);

				const monthEnd = new Date(monthStart);
				monthEnd.setMonth(monthEnd.getMonth() + 1);

				const monthOrders = await Order.find({
					createdAt: { $gte: monthStart, $lt: monthEnd },
					status: { $ne: "CANCELLED" },
				});

				const monthRevenue = monthOrders.reduce(
					(sum, order) => sum + (order.totalAmount || 0),
					0
				);
				sparklineData.push(monthRevenue / 1000); // Convert to thousands for better visualization
			}

			// Generate monthly orders data for sparkline (last 12 months)
			const ordersSparklineData = [];
			for (let i = 11; i >= 0; i--) {
				const monthStart = new Date();
				monthStart.setMonth(monthStart.getMonth() - i);
				monthStart.setDate(1);
				monthStart.setHours(0, 0, 0, 0);

				const monthEnd = new Date(monthStart);
				monthEnd.setMonth(monthEnd.getMonth() + 1);

				const monthOrdersCount = await Order.countDocuments({
					createdAt: { $gte: monthStart, $lt: monthEnd },
				});

				ordersSparklineData.push(monthOrdersCount);
			}

			// Calculate order fulfillment rate
			const totalOrdersCount = await Order.countDocuments();
			const fulfilledOrdersCount = await Order.countDocuments({
				status: { $in: ["SHIPPED", "DELIVERED"] },
			});
			const orderFulfillmentRate =
				totalOrdersCount > 0
					? Math.round((fulfilledOrdersCount / totalOrdersCount) * 100)
					: 0;

			// Calculate inventory by category
			const inventoryCategories = await Inventory.aggregate([
				{
					$group: {
						_id: "$category",
						count: { $sum: 1 },
					},
				},
				{
					$sort: { count: -1 },
				},
				{
					$limit: 4,
				},
			]);

			const topCategories = inventoryCategories
				.slice(0, 3)
				.map((cat) => cat._id);
			const otherCategoriesCount = inventoryCategories
				.slice(3)
				.reduce((sum, cat) => sum + cat.count, 0);

			const donutData = inventoryCategories.slice(0, 3).map((cat) => cat.count);
			if (otherCategoriesCount > 0) {
				donutData.push(otherCategoriesCount);
			}

			const donutLabels = [...topCategories];
			if (otherCategoriesCount > 0) {
				donutLabels.push("Other");
			}

			// Calculate shipment status distribution
			const inTransitCount = await Shipment.countDocuments({
				status: "IN_TRANSIT",
			});
			const pendingCount =
				(await Shipment.countDocuments({ status: "CREATED" })) +
				(await Shipment.countDocuments({ status: "PREPARING" }));
			const deliveredCount = await Shipment.countDocuments({
				status: "DELIVERED",
			});

			const shipmentDonutData = [inTransitCount, pendingCount, deliveredCount];
			const shipmentDonutLabels = ["In Transit", "Pending", "Delivered"];

			// Prepare response
			const response = {
				cardData: [
					{
						title: "Total Revenue",
						icon: "DollarSign",
						value: formatCurrency(totalRevenue),
						description: `${formatPercentage(revenuePercentChange)} from last month`,
						type: "revenue",
						sparklineData,
					},
					{
						title: "Inventory Items",
						icon: "CreditCard",
						value: `+${inventoryCount}`,
						description: `${formatPercentage(inventoryPercentChange)} from last month`,
						type: "number",
						sparklineData: null,
					},
					{
						title: "Active Orders",
						icon: "Activity",
						value: `+${activeOrdersCount}`,
						description: `+${lastHourOrdersCount} since last hour`,
						type: "orders",
						sparklineData: ordersSparklineData,
					},
					{
						title: "Shipments in Transit",
						icon: "Truck",
						value: `+${shipmentsInTransitCount}`,
						description: `+${lastHourShipmentsCount} since last hour`,
						type: "number",
						sparklineData: null,
					},
				],
				otherChartData: [
					{
						title: "Order Fulfillment",
						icon: "Package",
						type: "progress",
						progress: orderFulfillmentRate,
						label: `${orderFulfillmentRate}% Complete`,
					},
					{
						title: "Inventory by Category",
						icon: "CreditCard",
						type: "donut",
						donutData,
						donutLabels,
					},
					{
						title: "Shipment Status",
						icon: "Truck",
						type: "donut",
						donutData: shipmentDonutData,
						donutLabels: shipmentDonutLabels,
						colors: ["#38bdf8", "#f97316", "#4ade80"],
					},
				],
			};

			return NextResponse.json(response);
		},
		"kpis_get",
		RATE_LIMIT
	);
}
