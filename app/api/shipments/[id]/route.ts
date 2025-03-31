// app/api/shipments/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Shipment from "../../models/Shipment";
import User from "../../models/User";
import { createNotification } from "@/app/actions/notifications";
import mongoose from "mongoose";
import { UserRole } from "@/lib/types";

const UPDATE_RATE_LIMIT = 20;
const DELETE_RATE_LIMIT = 10;

// Helper function to check if user has access to a shipment
async function hasAccessToShipment(userId: string, shipmentId: string) {
	// Get user to determine role
	const user = await User.findById(userId);
	if (!user) return false;

	// Find the shipment
	const shipment = await Shipment.findById(shipmentId);
	if (!shipment) return false;

	// Check access based on role
	if (user.role === UserRole.ADMIN) {
		// Admin has access to all shipments
		return true;
	} else if (user.role === UserRole.MANAGER) {
		// Manager has access to shipments they created and shipments of suppliers they manage
		const managedSupplierIds = user.assignedManagers || [];
		return (
			shipment.userId.toString() === userId ||
			managedSupplierIds.includes(shipment.userId.toString())
		);
	} else {
		// Suppliers and other roles only have access to shipments they created
		return shipment.userId.toString() === userId;
	}
}

// GET /api/shipments/[id] - Get a single shipment
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate shipment ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid shipment ID" },
					{ status: 400 }
				);
			}

			// Check if user has access to this shipment
			const hasAccess = await hasAccessToShipment(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Shipment not found or unauthorized" },
					{ status: 404 }
				);
			}

			// Fetch the shipment
			const shipment = await Shipment.findById(id);
			return NextResponse.json(shipment);
		},
		"shipment_get",
		UPDATE_RATE_LIMIT
	);
}

// PUT /api/shipments/[id] - Update a shipment
export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate shipment ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid shipment ID" },
					{ status: 400 }
				);
			}

			// Check if user has access to this shipment
			const hasAccess = await hasAccessToShipment(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Shipment not found or unauthorized" },
					{ status: 404 }
				);
			}

			const updates = await req.json();
			const shipment = await Shipment.findById(id);

			// Check if status is being updated
			const statusChanged =
				updates.status && updates.status !== shipment.status;
			const previousStatus = shipment.status;

			// Update shipment
			const updatedShipment = await Shipment.findByIdAndUpdate(id, updates, {
				new: true,
			});

			// Create notification for status change if not handled by pre-save hook
			if (statusChanged && !updatedShipment) {
				await createNotification(
					userId,
					"ORDER_UPDATE",
					`Shipment Status Updated: ${shipment.trackingNumber}`,
					`Shipment status has been updated from ${previousStatus} to ${updates.status}`,
					{
						shipmentId: shipment._id,
						trackingNumber: shipment.trackingNumber,
						previousStatus,
						newStatus: updates.status,
					}
				);
			}

			return NextResponse.json(updatedShipment);
		},
		"shipment_update",
		UPDATE_RATE_LIMIT
	);
}

// DELETE /api/shipments/[id] - Delete a shipment
export async function DELETE(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate shipment ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid shipment ID" },
					{ status: 400 }
				);
			}

			// Check if user has access to this shipment
			const hasAccess = await hasAccessToShipment(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Shipment not found or unauthorized" },
					{ status: 404 }
				);
			}

			const shipment = await Shipment.findById(id);

			// Only allow deletion of shipments that are not in transit or delivered
			if (shipment.status === "IN_TRANSIT" || shipment.status === "DELIVERED") {
				return NextResponse.json(
					{
						code: "INVALID_STATUS",
						message: "Cannot delete shipments that are in transit or delivered",
					},
					{ status: 400 }
				);
			}

			await shipment.deleteOne();

			// Create notification for shipment deletion
			await createNotification(
				userId,
				"ORDER_UPDATE",
				`Shipment Deleted: ${shipment.trackingNumber}`,
				`The shipment has been deleted.`,
				{
					shipmentId: shipment._id,
					trackingNumber: shipment.trackingNumber,
				}
			);

			return NextResponse.json({ success: true });
		},
		"shipment_delete",
		DELETE_RATE_LIMIT
	);
}
