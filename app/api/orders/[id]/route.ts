// app/api/orders/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Order from "../../models/Order";
import { createNotification } from "@/app/actions/notifications";
import mongoose from "mongoose";

const UPDATE_RATE_LIMIT = 20;
const DELETE_RATE_LIMIT = 10;

// GET /api/orders/[id] - Get a single order
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate order ID
			if (!mongoose.Types.ObjectId.isValid(params.id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid order ID" },
					{ status: 400 }
				);
			}

			// Fetch the order and ensure it belongs to the user
			const order = await Order.findOne({ _id: params.id, userId });

			if (!order) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Order not found or unauthorized" },
					{ status: 404 }
				);
			}

			return NextResponse.json(order);
		},
		"order_get",
		UPDATE_RATE_LIMIT
	);
}

// PUT /api/orders/[id] - Update an order
export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate order ID
			if (!mongoose.Types.ObjectId.isValid(params.id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid order ID" },
					{ status: 400 }
				);
			}

			const updates = await req.json();
			const order = await Order.findById(params.id);

			if (!order) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Order not found" },
					{ status: 404 }
				);
			}

			// Calculate new total if items changed
			if (updates.items) {
				updates.totalAmount = updates.items.reduce(
					(sum: number, item: { quantity: number; price: number }) =>
						sum + item.quantity * item.price,
					0
				);
			}

			// Check if status is being updated
			const statusChanged = updates.status && updates.status !== order.status;
			const previousStatus = order.status;

			// Update order
			const updatedOrder = await Order.findByIdAndUpdate(params.id, updates, {
				new: true,
			});

			// Create notification for status change
			if (statusChanged) {
				await createNotification(
					order.customerId,
					"ORDER_UPDATE",
					`Order ${order.orderNumber} Status Updated`,
					`Your order status has been updated from ${previousStatus} to ${updates.status}`,
					{
						orderId: order._id,
						orderNumber: order.orderNumber,
						previousStatus,
						newStatus: updates.status,
					}
				);
			}

			return NextResponse.json(updatedOrder);
		},
		"order_update",
		UPDATE_RATE_LIMIT
	);
}

// DELETE /api/orders/[id] - Delete an order
export async function DELETE(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate order ID
			if (!mongoose.Types.ObjectId.isValid(params.id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid order ID" },
					{ status: 400 }
				);
			}

			const order = await Order.findById(params.id);
			if (!order) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Order not found" },
					{ status: 404 }
				);
			}

			// Only allow deletion of pending orders
			if (order.status !== "PENDING") {
				return NextResponse.json(
					{
						code: "INVALID_STATUS",
						message: "Only pending orders can be deleted",
					},
					{ status: 400 }
				);
			}

			await order.deleteOne();

			// Create notification for order deletion
			await createNotification(
				order.customerId,
				"ORDER_UPDATE",
				`Order ${order.orderNumber} Deleted`,
				`Order ${order.orderNumber} has been deleted.`,
				{
					orderId: order._id,
					orderNumber: order.orderNumber,
				}
			);

			return NextResponse.json({ success: true });
		},
		"order_delete",
		DELETE_RATE_LIMIT
	);
}
