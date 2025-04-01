// app/api/routes/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Route from "../../models/Route";
import User from "../../models/User";
import mongoose from "mongoose";
import { UserRole } from "@/lib/types";

const UPDATE_RATE_LIMIT = 20;
const DELETE_RATE_LIMIT = 10;

// Helper function to check if user has access to a route
async function hasAccessToRoute(userId: string, routeId: string) {
	// Get user to determine role
	const user = await User.findById(userId);
	if (!user) return false;

	// Find the route
	const route = await Route.findById(routeId);
	if (!route) return false;

	// Check access based on role
	if (user.role === UserRole.ADMIN) {
		// Admin has access to all routes
		return true;
	} else if (user.role === UserRole.MANAGER) {
		// Manager has access to routes they created and routes of suppliers they manage
		const managedSupplierIds = user.assignedManagers || [];
		return (
			route.createdBy.toString() === userId ||
			managedSupplierIds.includes(route.createdBy.toString())
		);
	} else {
		// Suppliers and other roles only have access to routes they created
		return route.createdBy.toString() === userId;
	}
}

// GET /api/routes/[id] - Get a single route
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = await params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate route ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid route ID" },
					{ status: 400 }
				);
			}

			// Check if user has access to this route
			const hasAccess = await hasAccessToRoute(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Route not found or unauthorized" },
					{ status: 404 }
				);
			}

			// Fetch the route
			const route = await Route.findById(id);
			return NextResponse.json(route);
		},
		"route_get",
		UPDATE_RATE_LIMIT
	);
}

// PUT /api/routes/[id] - Update a route
export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = await params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate route ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid route ID" },
					{ status: 400 }
				);
			}

			// Check if user has access to this route
			const hasAccess = await hasAccessToRoute(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Route not found or unauthorized" },
					{ status: 404 }
				);
			}

			const updates = await req.json();

			// Update route
			const updatedRoute = await Route.findByIdAndUpdate(id, updates, {
				new: true,
			});

			return NextResponse.json(updatedRoute);
		},
		"route_update",
		UPDATE_RATE_LIMIT
	);
}

// DELETE /api/routes/[id] - Delete a route
export async function DELETE(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = await params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate route ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid route ID" },
					{ status: 400 }
				);
			}

			// Check if user has access to this route
			const hasAccess = await hasAccessToRoute(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Route not found or unauthorized" },
					{ status: 404 }
				);
			}

			const route = await Route.findById(id);

			// Check if route is used in any shipments
			const Shipment = mongoose.models.Shipment;
			const shipmentCount = await Shipment.countDocuments({
				routeId: id,
			});

			if (shipmentCount > 0) {
				return NextResponse.json(
					{
						code: "ROUTE_IN_USE",
						message: "Cannot delete route that is used in shipments",
					},
					{ status: 400 }
				);
			}

			// Check if route is used in any freights
			const Freight = mongoose.models.Freight;
			const freightCount = await Freight.countDocuments({
				routeId: id,
			});

			if (freightCount > 0) {
				return NextResponse.json(
					{
						code: "ROUTE_IN_USE",
						message: "Cannot delete route that is used in freights",
					},
					{ status: 400 }
				);
			}

			await route.deleteOne();

			return NextResponse.json({ success: true });
		},
		"route_delete",
		DELETE_RATE_LIMIT
	);
}
