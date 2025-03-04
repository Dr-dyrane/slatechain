// app/api/freights/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Freight from "../../models/Freight";
import mongoose from "mongoose";

const UPDATE_RATE_LIMIT = 20;
const DELETE_RATE_LIMIT = 10;

// GET /api/freights/[id] - Get a single freight
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate freight ID
			if (!mongoose.Types.ObjectId.isValid(params.id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid freight ID" },
					{ status: 400 }
				);
			}

			// Find freight and ensure it belongs to the user
			const freight = await Freight.findOne({ _id: params.id, userId });

			if (!freight) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Freight not found or unauthorized" },
					{ status: 404 }
				);
			}

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
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate freight ID
			if (!mongoose.Types.ObjectId.isValid(params.id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid freight ID" },
					{ status: 400 }
				);
			}

			const updates = await req.json();
			const freight = await Freight.findOne({ _id: params.id, userId });

			if (!freight) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Freight not found or unauthorized" },
					{ status: 404 }
				);
			}

			// Update freight
			const updatedFreight = await Freight.findByIdAndUpdate(
				params.id,
				updates,
				{ new: true }
			);

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
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate freight ID
			if (!mongoose.Types.ObjectId.isValid(params.id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid freight ID" },
					{ status: 400 }
				);
			}

			// Find freight and ensure it belongs to the user
			const freight = await Freight.findOne({ _id: params.id, userId });

			if (!freight) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Freight not found or unauthorized" },
					{ status: 404 }
				);
			}

			// Check if freight is used in any shipments
			const Shipment = mongoose.models.Shipment;
			const shipmentCount = await Shipment.countDocuments({
				freightId: freight._id,
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
