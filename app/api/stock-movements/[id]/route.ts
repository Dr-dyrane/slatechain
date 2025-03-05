// app/api/services/stock-movements/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import StockMovement from "../../models/StockMovement";
import { createNotification } from "@/app/actions/notifications";
import mongoose from "mongoose";

const UPDATE_RATE_LIMIT = 20;

// GET /api/stock-movements/[id] - Get a single stock movement
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = await params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate movement ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid movement ID" },
					{ status: 400 }
				);
			}

			// Fetch the stock movement and ensure it belongs to the user
			const movement = await StockMovement.findOne({ _id: id, userId });

			if (!movement) {
				return NextResponse.json(
					{
						code: "NOT_FOUND",
						message: "Stock movement not found or unauthorized",
					},
					{ status: 404 }
				);
			}

			return NextResponse.json(movement);
		},
		"stock_movement_get",
		UPDATE_RATE_LIMIT
	);
}

// PUT /api/stock-movements/[id] - Update a stock movement
export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = await params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate movement ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid movement ID" },
					{ status: 400 }
				);
			}

			const updates = await req.json();
			const movement = await StockMovement.findById(id);

			if (!movement) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Stock movement not found" },
					{ status: 404 }
				);
			}

			// Check if status is being updated
			const statusChanged =
				updates.status && updates.status !== movement.status;
			const previousStatus = movement.status;

			// Update movement
			const updatedMovement = await StockMovement.findByIdAndUpdate(
				id,
				updates,
				{ new: true }
			);

			// Create notification for status change
			if (statusChanged) {
				await createNotification(
					userId,
					"STOCK_MOVEMENT",
					`Stock Movement Status Updated`,
					`Movement status changed from ${previousStatus} to ${updates.status}`,
					{
						movementId: movement._id,
						previousStatus,
						newStatus: updates.status,
					}
				);
			}

			return NextResponse.json(updatedMovement);
		},
		"stock_movement_update",
		UPDATE_RATE_LIMIT
	);
}
