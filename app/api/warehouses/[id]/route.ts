// app/api/warespaces/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Warehouse from "../../models/Warehouse";
import { createNotification } from "@/app/actions/notifications";
import mongoose from "mongoose";

const UPDATE_RATE_LIMIT = 20;
const DELETE_RATE_LIMIT = 10;

// GET /api/warehouses/[id] - Get a single warehouse
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate warehouse ID
			if (!mongoose.Types.ObjectId.isValid(params.id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid warehouse ID" },
					{ status: 400 }
				);
			}

			// Fetch the warehouse and ensure it belongs to the user
			const warehouse = await Warehouse.findOne({ _id: params.id, userId });

			if (!warehouse) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Warehouse not found or unauthorized" },
					{ status: 404 }
				);
			}

			return NextResponse.json(warehouse);
		},
		"warehouse_get",
		UPDATE_RATE_LIMIT
	);
}

// PUT /api/warehouses/[id] - Update a warehouse
export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate warehouse ID
			if (!mongoose.Types.ObjectId.isValid(params.id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid warehouse ID" },
					{ status: 400 }
				);
			}

			const updates = await req.json();
			const warehouse = await Warehouse.findById(params.id);

			if (!warehouse) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Warehouse not found" },
					{ status: 404 }
				);
			}

			// Check if status is being updated
			const statusChanged =
				updates.status && updates.status !== warehouse.status;
			const previousStatus = warehouse.status;

			// Update warehouse
			const updatedWarehouse = await Warehouse.findByIdAndUpdate(
				params.id,
				updates,
				{ new: true }
			);

			// Create notification for status change
			if (statusChanged) {
				await createNotification(
					userId,
					"WAREHOUSE_UPDATE",
					`Warehouse Status Updated: ${warehouse.name}`,
					`Status changed from ${previousStatus} to ${updates.status}`,
					{
						warehouseId: warehouse._id,
						previousStatus,
						newStatus: updates.status,
					}
				);
			}

			return NextResponse.json(updatedWarehouse);
		},
		"warehouse_update",
		UPDATE_RATE_LIMIT
	);
}

// DELETE /api/warehouses/[id] - Delete a warehouse
export async function DELETE(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate warehouse ID
			if (!mongoose.Types.ObjectId.isValid(params.id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid warehouse ID" },
					{ status: 400 }
				);
			}

			const warehouse = await Warehouse.findById(params.id);
			if (!warehouse) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Warehouse not found" },
					{ status: 404 }
				);
			}

			// Check if warehouse has inventory items
			const Inventory = mongoose.model("Inventory");
			const itemCount = await Inventory.countDocuments({
				warehouseId: params.id,
			});
			if (itemCount > 0) {
				return NextResponse.json(
					{
						code: "WAREHOUSE_NOT_EMPTY",
						message: "Cannot delete warehouse with existing inventory items",
					},
					{ status: 400 }
				);
			}

			await warehouse.deleteOne();

			// Create notification for warehouse deletion
			await createNotification(
				userId,
				"WAREHOUSE_UPDATE",
				`Warehouse Deleted: ${warehouse.name}`,
				`The warehouse at ${warehouse.location} has been removed from the system.`,
				{
					warehouseId: warehouse._id,
					location: warehouse.location,
				}
			);

			return NextResponse.json({ success: true });
		},
		"warehouse_delete",
		DELETE_RATE_LIMIT
	);
}
