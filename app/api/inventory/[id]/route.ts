// app/api/inventory/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Inventory from "../../models/Inventory";
import User from "../../models/User";
import { createNotification } from "@/app/actions/notifications";
import mongoose from "mongoose";
import { UserRole } from "@/lib/types";

const UPDATE_RATE_LIMIT = 20;
const DELETE_RATE_LIMIT = 10;

// Helper function to check if user has access to an inventory item
async function hasAccessToItem(userId: string, itemId: string) {
	// Get user to determine role
	const user = await User.findById(userId);
	if (!user) return false;

	// Find the inventory item
	const item = await Inventory.findById(itemId);
	if (!item) return false;

	// Check access based on role
	if (user.role === UserRole.ADMIN) {
		// Admin has access to all items
		return true;
	} else if (user.role === UserRole.MANAGER) {
		// Manager has access to their own items and items of suppliers they manage
		const managedSupplierIds = user.assignedManagers || [];
		return (
			item.supplierId === userId || managedSupplierIds.includes(item.supplierId)
		);
	} else {
		// Suppliers and other roles only have access to their own items
		return item.supplierId === userId;
	}
}

// GET /api/inventory/[id] - Get a single inventory item
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = await params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate inventory ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid inventory ID" },
					{ status: 400 }
				);
			}

			// Check if user has access to this item
			const hasAccess = await hasAccessToItem(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{
						code: "NOT_FOUND",
						message: "Inventory item not found or unauthorized",
					},
					{ status: 404 }
				);
			}

			// Fetch the item
			const item = await Inventory.findById(id);
			return NextResponse.json(item);
		},
		"inventory_get",
		UPDATE_RATE_LIMIT
	);
}

// PUT /api/inventory/[id] - Update an inventory item
export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = await params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate inventory ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid inventory ID" },
					{ status: 400 }
				);
			}

			// Check if user has access to this item
			const hasAccess = await hasAccessToItem(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{
						code: "NOT_FOUND",
						message: "Inventory item not found or unauthorized",
					},
					{ status: 404 }
				);
			}

			const updates = await req.json();
			const item = await Inventory.findById(id);

			// Check if quantity is being updated
			const quantityChanged =
				updates.quantity !== undefined && updates.quantity !== item.quantity;
			const previousQuantity = item.quantity;

			// Update item
			const updatedItem = await Inventory.findByIdAndUpdate(id, updates, {
				new: true,
			});

			// Create notification for quantity change
			if (quantityChanged) {
				await createNotification(
					userId,
					"INVENTORY_UPDATE",
					`Inventory Quantity Updated: ${item.name}`,
					`Quantity changed from ${previousQuantity} to ${updates.quantity}`,
					{
						itemId: item._id,
						sku: item.sku,
						previousQuantity,
						newQuantity: updates.quantity,
					}
				);
			}

			return NextResponse.json(updatedItem);
		},
		"inventory_update",
		UPDATE_RATE_LIMIT
	);
}

// DELETE /api/inventory/[id] - Delete an inventory item
export async function DELETE(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = await params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate inventory ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid inventory ID" },
					{ status: 400 }
				);
			}

			// Check if user has access to this item
			const hasAccess = await hasAccessToItem(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{
						code: "NOT_FOUND",
						message: "Inventory item not found or unauthorized",
					},
					{ status: 404 }
				);
			}

			const item = await Inventory.findById(id);
			await item.deleteOne();

			// Create notification for item deletion
			await createNotification(
				userId,
				"INVENTORY_UPDATE",
				`Inventory Item Deleted: ${item.name}`,
				`SKU: ${item.sku} has been removed from inventory.`,
				{
					itemId: item._id,
					sku: item.sku,
				}
			);

			return NextResponse.json({ success: true });
		},
		"inventory_delete",
		DELETE_RATE_LIMIT
	);
}
