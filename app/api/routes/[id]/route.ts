// app/api/routes/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Route from "../../models/Route";
import mongoose from "mongoose";

const UPDATE_RATE_LIMIT = 20;
const DELETE_RATE_LIMIT = 10;

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

			// Find route and ensure it belongs to the user
			const route = await Route.findOne({ _id: id, userId });

			if (!route) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Route not found or unauthorized" },
					{ status: 404 }
				);
			}

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

			const updates = await req.json();
			const route = await Route.findOne({ _id: id, userId });

			if (!route) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Route not found or unauthorized" },
					{ status: 404 }
				);
			}

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

			// Find route and ensure it belongs to the user
			const route = await Route.findOne({ _id: id, userId });

			if (!route) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Route not found or unauthorized" },
					{ status: 404 }
				);
			}

			// Check if route is used in any shipments
			const Shipment = mongoose.models.Shipment;
			const shipmentCount = await Shipment.countDocuments({
				routeId: route._id,
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

			await route.deleteOne();

			return NextResponse.json({ success: true });
		},
		"route_delete",
		DELETE_RATE_LIMIT
	);
}
