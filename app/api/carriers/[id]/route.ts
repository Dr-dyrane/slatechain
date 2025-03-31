// app/api/carriers/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Carrier from "../../models/Carrier";
import User from "../../models/User";
import mongoose from "mongoose";
import { UserRole } from "@/lib/types";

const UPDATE_RATE_LIMIT = 20;
const DELETE_RATE_LIMIT = 10;

// Helper function to check if user has access to a carrier
async function hasAccessToCarrier(userId: string, carrierId: string) {
	// Get user to determine role
	const user = await User.findById(userId);
	if (!user) return false;

	// Find the carrier
	const carrier = await Carrier.findById(carrierId);
	if (!carrier) return false;

	// Check access based on role
	if (user.role === UserRole.ADMIN) {
		// Admin has access to all carriers
		return true;
	} else if (user.role === UserRole.MANAGER) {
		// Manager has access to carriers they created and carriers of suppliers they manage
		const managedSupplierIds = user.assignedManagers || [];
		return (
			carrier.userId.toString() === userId ||
			managedSupplierIds.includes(carrier.userId.toString())
		);
	} else {
		// Suppliers and other roles only have access to carriers they created
		return carrier.userId.toString() === userId;
	}
}

// GET /api/carriers/[id] - Get a single carrier
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate carrier ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid carrier ID" },
					{ status: 400 }
				);
			}

			// Check if user has access to this carrier
			const hasAccess = await hasAccessToCarrier(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Carrier not found or unauthorized" },
					{ status: 404 }
				);
			}

			// Fetch the carrier
			const carrier = await Carrier.findById(id);
			return NextResponse.json(carrier);
		},
		"carrier_get",
		UPDATE_RATE_LIMIT
	);
}

// PUT /api/carriers/[id] - Update a carrier
export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate carrier ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid carrier ID" },
					{ status: 400 }
				);
			}

			// Check if user has access to this carrier
			const hasAccess = await hasAccessToCarrier(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Carrier not found or unauthorized" },
					{ status: 404 }
				);
			}

			const updates = await req.json();

			// Validate required fields
			if (
				!updates.name ||
				!updates.contactPerson ||
				!updates.email ||
				!updates.phone
			) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message: "Name, contact person, email, and phone are required",
					},
					{ status: 400 }
				);
			}

			// Update carrier
			const updatedCarrier = await Carrier.findByIdAndUpdate(id, updates, {
				new: true,
			});

			return NextResponse.json(updatedCarrier);
		},
		"carrier_update",
		UPDATE_RATE_LIMIT
	);
}

// DELETE /api/carriers/[id] - Delete a carrier
export async function DELETE(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate carrier ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid carrier ID" },
					{ status: 400 }
				);
			}

			// Check if user has access to this carrier
			const hasAccess = await hasAccessToCarrier(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Carrier not found or unauthorized" },
					{ status: 404 }
				);
			}

			const carrier = await Carrier.findById(id);

			// Check if carrier is used in any shipments
			const Shipment = mongoose.models.Shipment;
			const shipmentCount = await Shipment.countDocuments({
				carrier: carrier.name,
			});

			if (shipmentCount > 0) {
				return NextResponse.json(
					{
						code: "CARRIER_IN_USE",
						message: "Cannot delete carrier that is used in shipments",
					},
					{ status: 400 }
				);
			}

			// Check if carrier is used in any transports
			const Transport = mongoose.models.Transport;
			const transportCount = await Transport.countDocuments({
				carrierId: id,
			});

			if (transportCount > 0) {
				return NextResponse.json(
					{
						code: "CARRIER_IN_USE",
						message: "Cannot delete carrier that is used in transports",
					},
					{ status: 400 }
				);
			}

			await carrier.deleteOne();

			return NextResponse.json({ success: true });
		},
		"carrier_delete",
		DELETE_RATE_LIMIT
	);
}
