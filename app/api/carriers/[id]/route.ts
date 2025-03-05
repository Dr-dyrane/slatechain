// app/api/carriers/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Carrier from "../../models/Carrier";
import mongoose from "mongoose";

const UPDATE_RATE_LIMIT = 20;
const DELETE_RATE_LIMIT = 10;

// GET /api/carriers/[id] - Get a single carrier
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = await params;
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

			// Find carrier and ensure it belongs to the user
			const carrier = await Carrier.findOne({ _id: id, userId });

			if (!carrier) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Carrier not found or unauthorized" },
					{ status: 404 }
				);
			}

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
	const { id } = await params;
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

			const updates = await req.json();
			const carrier = await Carrier.findOne({ _id: id, userId });

			if (!carrier) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Carrier not found or unauthorized" },
					{ status: 404 }
				);
			}

			// Update carrier
			const updatedCarrier = await Carrier.findByIdAndUpdate(
				id,
				updates,
				{ new: true }
			);

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
	const { id } = await params;
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

			// Find carrier and ensure it belongs to the user
			const carrier = await Carrier.findOne({ _id: id, userId });

			if (!carrier) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Carrier not found or unauthorized" },
					{ status: 404 }
				);
			}

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

			await carrier.deleteOne();

			return NextResponse.json({ success: true });
		},
		"carrier_delete",
		DELETE_RATE_LIMIT
	);
}
