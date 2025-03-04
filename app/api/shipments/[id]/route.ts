// app/api/shipments/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Shipment from "../../models/Shipment";
import { createNotification } from "@/app/actions/notifications";
import mongoose from "mongoose";

const UPDATE_RATE_LIMIT = 20;
const DELETE_RATE_LIMIT = 10;

// GET /api/shipments/[id] - Get a single shipment
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate shipment ID
			if (!mongoose.Types.ObjectId.isValid(params.id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid shipment ID" },
					{ status: 400 }
				);
			}

			// Find shipment and ensure it belongs to the user
			const shipment = await Shipment.findOne({ _id: params.id, userId });

			if (!shipment) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Shipment not found or unauthorized" },
					{ status: 404 }
				);
			}

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
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate shipment ID
			if (!mongoose.Types.ObjectId.isValid(params.id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid shipment ID" },
					{ status: 400 }
				);
			}

			const updates = await req.json();
			const shipment = await Shipment.findOne({ _id: params.id, userId });

			if (!shipment) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Shipment not found or unauthorized" },
					{ status: 404 }
				);
			}

			// Check if status is being updated
			const statusChanged =
				updates.status && updates.status !== shipment.status;
			const previousStatus = shipment.status;

			// Update shipment
			const updatedShipment = await Shipment.findByIdAndUpdate(
				params.id,
				updates,
				{ new: true }
			);

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
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate shipment ID
			if (!mongoose.Types.ObjectId.isValid(params.id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid shipment ID" },
					{ status: 400 }
				);
			}

			// Find shipment and ensure it belongs to the user
			const shipment = await Shipment.findOne({ _id: params.id, userId });

			if (!shipment) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Shipment not found or unauthorized" },
					{ status: 404 }
				);
			}

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
