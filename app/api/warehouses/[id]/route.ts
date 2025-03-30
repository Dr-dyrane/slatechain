// app/api/warehouses/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Warehouse from "../../models/Warehouse";
import User from "../../models/User";
import { createNotification } from "@/app/actions/notifications";
import mongoose from "mongoose";
import { UserRole } from "@/lib/types";

const UPDATE_RATE_LIMIT = 20;
const DELETE_RATE_LIMIT = 10;

// Helper function to check if user has access to a warehouse
async function hasAccessToWarehouse(userId: string, warehouseId: string) {
	// Get user to determine role
	const user = await User.findById(userId);
	if (!user) return false;

	// Find the warehouse
	const warehouse = await Warehouse.findById(warehouseId);
	if (!warehouse) return false;

	// Check access based on role
	if (user.role === UserRole.ADMIN) {
		// Admin has access to all warehouses
		return true;
	} else if (user.role === UserRole.MANAGER) {
		// Manager has access to warehouses they created and warehouses of suppliers they manage
		const managedSupplierIds = user.assignedManagers || [];
		return (
			warehouse.createdBy === userId ||
			managedSupplierIds.includes(warehouse.createdBy)
		);
	} else {
		// Suppliers and other roles only have access to warehouses they created
		return warehouse.createdBy === userId;
	}
}

// GET /api/warehouses/[id] - Get a single warehouse
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate warehouse ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid warehouse ID" },
					{ status: 400 }
				);
			}

			// Check if user has access to this warehouse
			const hasAccess = await hasAccessToWarehouse(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Warehouse not found or unauthorized" },
					{ status: 404 }
				);
			}

			// Fetch the warehouse
			const warehouse = await Warehouse.findById(id);
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
	const { id } = params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate warehouse ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid warehouse ID" },
					{ status: 400 }
				);
			}

			// Check if user has access to this warehouse
			const hasAccess = await hasAccessToWarehouse(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Warehouse not found or unauthorized" },
					{ status: 404 }
				);
			}

			const updates = await req.json();
			const warehouse = await Warehouse.findById(id);

			// Check if status is being updated
			const statusChanged =
				updates.status && updates.status !== warehouse.status;
			const previousStatus = warehouse.status;

			// Update warehouse
			const updatedWarehouse = await Warehouse.findByIdAndUpdate(id, updates, {
				new: true,
			});

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
	const { id } = params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate warehouse ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid warehouse ID" },
					{ status: 400 }
				);
			}

			// Check if user has access to this warehouse
			const hasAccess = await hasAccessToWarehouse(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Warehouse not found or unauthorized" },
					{ status: 404 }
				);
			}

			const warehouse = await Warehouse.findById(id);

			// Check if warehouse has inventory items
			const Inventory = mongoose.model("Inventory");
			const itemCount = await Inventory.countDocuments({
				warehouseId: id,
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
