// app/api/inventory/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Inventory from "../../models/Inventory";
import { createNotification } from "@/app/actions/notifications";
import mongoose from "mongoose";

const UPDATE_RATE_LIMIT = 20;
const DELETE_RATE_LIMIT = 10;

// GET /api/inventory/[id] - Get a single inventory item
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = await params
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

			// Fetch inventory item and ensure it belongs to the user
			const item = await Inventory.findOne({ _id: id, userId });

			if (!item) {
				return NextResponse.json(
					{
						code: "NOT_FOUND",
						message: "Inventory item not found or unauthorized",
					},
					{ status: 404 }
				);
			}

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
	const { id } = await params
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

			const updates = await req.json();
			const item = await Inventory.findById(id);

			if (!item) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Inventory item not found" },
					{ status: 404 }
				);
			}

			// Check if quantity is being updated
			const quantityChanged =
				updates.quantity !== undefined && updates.quantity !== item.quantity;
			const previousQuantity = item.quantity;

			// Update item
			const updatedItem = await Inventory.findByIdAndUpdate(
				id,
				updates,
				{ new: true }
			);

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
	const { id } = await params
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

			const item = await Inventory.findById(id);
			if (!item) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Inventory item not found" },
					{ status: 404 }
				);
			}

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
