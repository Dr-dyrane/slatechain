// app/api/freights/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Freight from "../../models/Freight";
import User from "../../models/User";
import mongoose from "mongoose";
import { UserRole } from "@/lib/types";

const UPDATE_RATE_LIMIT = 20;
const DELETE_RATE_LIMIT = 10;

// Helper function to check if user has access to a freight
async function hasAccessToFreight(userId: string, freightId: string) {
	// Get user to determine role
	const user = await User.findById(userId);
	if (!user) return false;

	// Find the freight
	const freight = await Freight.findById(freightId);
	if (!freight) return false;

	// Check access based on role
	if (user.role === UserRole.ADMIN) {
		// Admin has access to all freights
		return true;
	} else if (user.role === UserRole.MANAGER) {
		// Manager has access to freights they created and freights of suppliers they manage
		const managedSupplierIds = user.assignedManagers || [];
		return (
			freight.createdBy.toString() === userId ||
			managedSupplierIds.includes(freight.createdBy.toString())
		);
	} else {
		// Suppliers and other roles only have access to freights they created
		return freight.createdBy.toString() === userId;
	}
}

// GET /api/freights/[id] - Get a single freight
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate freight ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid freight ID" },
					{ status: 400 }
				);
			}

			// Check if user has access to this freight
			const hasAccess = await hasAccessToFreight(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Freight not found or unauthorized" },
					{ status: 404 }
				);
			}

			// Fetch the freight
			const freight = await Freight.findById(id);
			return NextResponse.json(freight);
		},
		"freight_get",
		UPDATE_RATE_LIMIT
	);
}

// PUT /api/freights/[id] - Update a freight
export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate freight ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid freight ID" },
					{ status: 400 }
				);
			}

			// Check if user has access to this freight
			const hasAccess = await hasAccessToFreight(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Freight not found or unauthorized" },
					{ status: 404 }
				);
			}

			const updates = await req.json();

			// Update freight
			const updatedFreight = await Freight.findByIdAndUpdate(id, updates, {
				new: true,
			});

			return NextResponse.json(updatedFreight);
		},
		"freight_update",
		UPDATE_RATE_LIMIT
	);
}

// DELETE /api/freights/[id] - Delete a freight
export async function DELETE(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate freight ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid freight ID" },
					{ status: 400 }
				);
			}

			// Check if user has access to this freight
			const hasAccess = await hasAccessToFreight(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Freight not found or unauthorized" },
					{ status: 404 }
				);
			}

			const freight = await Freight.findById(id);

			// Check if freight is used in any shipments
			const Shipment = mongoose.models.Shipment;
			const shipmentCount = await Shipment.countDocuments({
				freightId: id,
			});

			if (shipmentCount > 0) {
				return NextResponse.json(
					{
						code: "FREIGHT_IN_USE",
						message: "Cannot delete freight that is used in shipments",
					},
					{ status: 400 }
				);
			}

			await freight.deleteOne();

			return NextResponse.json({ success: true });
		},
		"freight_delete",
		DELETE_RATE_LIMIT
	);
}
