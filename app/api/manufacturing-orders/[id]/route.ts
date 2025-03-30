// app/api/manufacturing-orders/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import ManufacturingOrder from "../../models/ManufacturingOrder";
import User from "../../models/User";
import { createNotification } from "@/app/actions/notifications";
import mongoose from "mongoose";
import { UserRole } from "@/lib/types";

const UPDATE_RATE_LIMIT = 20;
const DELETE_RATE_LIMIT = 10;

// Helper function to check if user has access to a manufacturing order
async function hasAccessToOrder(userId: string, orderId: string) {
	// Get user to determine role
	const user = await User.findById(userId);
	if (!user) return false;

	// Find the order
	const order = await ManufacturingOrder.findById(orderId);
	if (!order) return false;

	// Check access based on role
	if (user.role === UserRole.ADMIN) {
		// Admin has access to all orders
		return true;
	} else if (user.role === UserRole.MANAGER) {
		// Manager has access to orders they created and orders of suppliers they manage
		const managedSupplierIds = user.assignedManagers || [];
		return (
			order.createdBy === userId || managedSupplierIds.includes(order.createdBy)
		);
	} else {
		// Suppliers and other roles only have access to orders they created
		return order.createdBy === userId;
	}
}

// GET /api/manufacturing-orders/[id] - Get a single manufacturing order
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;
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

			// Check if user has access to this order
			const hasAccess = await hasAccessToOrder(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{
						code: "NOT_FOUND",
						message: "Manufacturing order not found or unauthorized",
					},
					{ status: 404 }
				);
			}

			// Fetch the order
			const order = await ManufacturingOrder.findById(id);
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
	const { id } = params;
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

			// Check if user has access to this order
			const hasAccess = await hasAccessToOrder(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{
						code: "NOT_FOUND",
						message: "Manufacturing order not found or unauthorized",
					},
					{ status: 404 }
				);
			}

			const updates = await req.json();
			const order = await ManufacturingOrder.findById(id);

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
	const { id } = params;
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

			// Check if user has access to this order
			const hasAccess = await hasAccessToOrder(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{
						code: "NOT_FOUND",
						message: "Manufacturing order not found or unauthorized",
					},
					{ status: 404 }
				);
			}

			const order = await ManufacturingOrder.findById(id);

			// Only allow deletion of PLANNED orders
			if (order.status !== "PLANNED") {
				return NextResponse.json(
					{
						code: "ORDER_NOT_DELETABLE",
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
