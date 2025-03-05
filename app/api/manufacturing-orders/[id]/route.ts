// app/api/manufacturing-orders/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import ManufacturingOrder from "../../models/ManufacturingOrder";
import { createNotification } from "@/app/actions/notifications";
import mongoose from "mongoose";

const UPDATE_RATE_LIMIT = 20;
const DELETE_RATE_LIMIT = 10;

// GET /api/manufacturing-orders/[id] - Get a single manufacturing order
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = await params
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate order ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid order ID" },
					{ status: 400 }
				);
			}

			// Fetch the order and ensure it belongs to the user
			const order = await ManufacturingOrder.findOne({
				_id: id,
				userId,
			});

			if (!order) {
				return NextResponse.json(
					{
						code: "NOT_FOUND",
						message: "Manufacturing order not found or unauthorized",
					},
					{ status: 404 }
				);
			}

			return NextResponse.json(order);
		},
		"manufacturing_order_get",
		UPDATE_RATE_LIMIT
	);
}

// PUT /api/manufacturing-orders/[id] - Update a manufacturing order
export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = await params
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate order ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid order ID" },
					{ status: 400 }
				);
			}

			const updates = await req.json();
			const order = await ManufacturingOrder.findById(id);

			if (!order) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Manufacturing order not found" },
					{ status: 404 }
				);
			}

			// Check if status is being updated
			const statusChanged = updates.status && updates.status !== order.status;
			const previousStatus = order.status;

			// Update dates based on status change
			if (statusChanged) {
				if (updates.status === "IN_PROGRESS" && !order.actualStartDate) {
					updates.actualStartDate = new Date();
				} else if (updates.status === "COMPLETED" && !order.actualEndDate) {
					updates.actualEndDate = new Date();
				}
			}

			// Update order
			const updatedOrder = await ManufacturingOrder.findByIdAndUpdate(
				id,
				updates,
				{ new: true }
			);

			// Create notification for status change
			if (statusChanged) {
				await createNotification(
					userId,
					"MANUFACTURING_ORDER",
					`Manufacturing Order Status Updated`,
					`Order ${order.orderNumber} status changed from ${previousStatus} to ${updates.status}`,
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
		"manufacturing_order_update",
		UPDATE_RATE_LIMIT
	);
}

// DELETE /api/manufacturing-orders/[id] - Delete a manufacturing order
export async function DELETE(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = await params
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate order ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid order ID" },
					{ status: 400 }
				);
			}

			const order = await ManufacturingOrder.findById(id);
			if (!order) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Manufacturing order not found" },
					{ status: 404 }
				);
			}

			// Only allow deletion of PLANNED orders
			if (order.status !== "PLANNED") {
				return NextResponse.json(
					{
						code: "INVALID_STATUS",
						message: "Only planned orders can be deleted",
					},
					{ status: 400 }
				);
			}

			await order.deleteOne();

			// Create notification for order deletion
			await createNotification(
				userId,
				"MANUFACTURING_ORDER",
				`Manufacturing Order Deleted`,
				`Order ${order.orderNumber} has been deleted`,
				{
					orderId: order._id,
					orderNumber: order.orderNumber,
				}
			);

			return NextResponse.json({ success: true });
		},
		"manufacturing_order_delete",
		DELETE_RATE_LIMIT
	);
}
