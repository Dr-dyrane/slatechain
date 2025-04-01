// app/api/transports/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Transport from "../../models/Transport";
import User from "../../models/User";
import mongoose from "mongoose";
import { UserRole } from "@/lib/types";

const UPDATE_RATE_LIMIT = 20;
const DELETE_RATE_LIMIT = 10;

// Helper function to check if user has access to a transport
async function hasAccessToTransport(userId: string, transportId: string) {
	// Get user to determine role
	const user = await User.findById(userId);
	if (!user) return false;

	// Find the transport
	const transport = await Transport.findById(transportId);
	if (!transport) return false;

	// Check access based on role
	if (user.role === UserRole.ADMIN) {
		// Admin has access to all transports
		return true;
	} else if (user.role === UserRole.MANAGER) {
		// Manager has access to transports they created and transports of suppliers they manage
		const managedSupplierIds = user.assignedManagers || [];
		return (
			transport.userId.toString() === userId ||
			managedSupplierIds.includes(transport.userId.toString())
		);
	} else {
		// Suppliers and other roles only have access to transports they created
		return transport.userId.toString() === userId;
	}
}

// GET /api/transports/[id] - Get a single transport
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = await params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate transport ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid transport ID" },
					{ status: 400 }
				);
			}

			// Check if user has access to this transport
			const hasAccess = await hasAccessToTransport(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Transport not found or unauthorized" },
					{ status: 404 }
				);
			}

			// Fetch the transport
			const transport = await Transport.findById(id);
			return NextResponse.json(transport);
		},
		"transport_get",
		UPDATE_RATE_LIMIT
	);
}

// PUT /api/transports/[id] - Update a transport
export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = await params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate transport ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid transport ID" },
					{ status: 400 }
				);
			}

			// Check if user has access to this transport
			const hasAccess = await hasAccessToTransport(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Transport not found or unauthorized" },
					{ status: 404 }
				);
			}

			const updates = await req.json();

			// Validate required fields
			if (!updates.name) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message: "Name is required",
					},
					{ status: 400 }
				);
			}

			// Update transport
			const updatedTransport = await Transport.findByIdAndUpdate(id, updates, {
				new: true,
			});

			return NextResponse.json(updatedTransport);
		},
		"transport_update",
		UPDATE_RATE_LIMIT
	);
}

// DELETE /api/transports/[id] - Delete a transport
export async function DELETE(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = await params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate transport ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid transport ID" },
					{ status: 400 }
				);
			}

			// Check if user has access to this transport
			const hasAccess = await hasAccessToTransport(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Transport not found or unauthorized" },
					{ status: 404 }
				);
			}

			const transport = await Transport.findById(id);

			// Only allow deletion of available transports
			if (transport.status !== "AVAILABLE") {
				return NextResponse.json(
					{
						code: "INVALID_STATUS",
						message: "Cannot delete transport that is not available",
					},
					{ status: 400 }
				);
			}

			// Check if transport is used in any shipments or freight
			const Freight = mongoose.models.Freight;
			const freightCount = await Freight.countDocuments({
				"vehicle.identifier": transport._id.toString(),
			});

			if (freightCount > 0) {
				return NextResponse.json(
					{
						code: "TRANSPORT_IN_USE",
						message: "Cannot delete transport that is used in freight",
					},
					{ status: 400 }
				);
			}

			await transport.deleteOne();

			return NextResponse.json({ success: true });
		},
		"transport_delete",
		DELETE_RATE_LIMIT
	);
}
