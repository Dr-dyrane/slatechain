// app/api/transports/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Transport from "../../models/Transport";
import mongoose from "mongoose";

const UPDATE_RATE_LIMIT = 20;
const DELETE_RATE_LIMIT = 10;

// GET /api/transports/[id] - Get a single transport
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate transport ID
			if (!mongoose.Types.ObjectId.isValid(params.id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid transport ID" },
					{ status: 400 }
				);
			}

			// Find transport and ensure it belongs to the user
			const transport = await Transport.findOne({ _id: params.id, userId });

			if (!transport) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Transport not found or unauthorized" },
					{ status: 404 }
				);
			}

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
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate transport ID
			if (!mongoose.Types.ObjectId.isValid(params.id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid transport ID" },
					{ status: 400 }
				);
			}

			const updates = await req.json();
			const transport = await Transport.findOne({ _id: params.id, userId });

			if (!transport) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Transport not found or unauthorized" },
					{ status: 404 }
				);
			}

			// Update transport
			const updatedTransport = await Transport.findByIdAndUpdate(
				params.id,
				updates,
				{ new: true }
			);

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
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate transport ID
			if (!mongoose.Types.ObjectId.isValid(params.id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid transport ID" },
					{ status: 400 }
				);
			}

			// Find transport and ensure it belongs to the user
			const transport = await Transport.findOne({ _id: params.id, userId });

			if (!transport) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Transport not found or unauthorized" },
					{ status: 404 }
				);
			}

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

			await transport.deleteOne();

			return NextResponse.json({ success: true });
		},
		"transport_delete",
		DELETE_RATE_LIMIT
	);
}
