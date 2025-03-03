// app/api/orders/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import { createNotification } from "@/app/actions/notifications";
import Order from "../models/Order";

const LIST_RATE_LIMIT = 30;
const CREATE_RATE_LIMIT = 10;

// GET /api/orders - List orders for a specific user
export async function GET(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			const orders = await Order.find({ userId }).sort({ createdAt: -1 });
			return NextResponse.json(orders);
		},
		"orders_list",
		LIST_RATE_LIMIT
	);
}

// POST /api/orders - Create a new order
export async function POST(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			const orderData = await req.json();

			// Validate required fields
			if (
				!orderData.customerId ||
				!orderData.items ||
				orderData.items.length === 0
			) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message: "Customer ID and at least one item are required",
					},
					{ status: 400 }
				);
			}

			// Calculate total amount
			const totalAmount = orderData.items.reduce(
				(sum: number, item: { quantity: number; price: number }) =>
					sum + item.quantity * item.price,
				0
			);

			// Create order
			const order = await Order.create({
				...orderData,
				totalAmount,
				createdBy: userId,
			});

			// Create notification for new order
			await createNotification(
				userId,
				"ORDER_UPDATE",
				`New Order ${order.orderNumber}`,
				`Order ${order.orderNumber} has been created and is pending processing.`,
				{
					orderId: order._id,
					orderNumber: order.orderNumber,
					status: order.status,
				}
			);

			return NextResponse.json(order);
		},
		"order_create",
		CREATE_RATE_LIMIT
	);
}
