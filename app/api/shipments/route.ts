// app/api/shipments/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Shipment from "../models/Shipment";
import { createNotification } from "@/app/actions/notifications";

const LIST_RATE_LIMIT = 30;
const CREATE_RATE_LIMIT = 10;

// GET /api/shipments - List shipments for a specific user
export async function GET(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Find all shipments for this user
			const shipments = await Shipment.find({ userId }).sort({ createdAt: -1 });

			// Return raw shipments array
			return NextResponse.json(shipments);
		},
		"shipments_list",
		LIST_RATE_LIMIT
	);
}

// POST /api/shipments - Create a new shipment
export async function POST(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			const shipmentData = await req.json();

			// Validate required fields
			if (
				!shipmentData.name ||
				!shipmentData.orderId ||
				!shipmentData.destination
			) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message: "Name, order ID, and destination are required",
					},
					{ status: 400 }
				);
			}

			// Create shipment
			const shipment = await Shipment.create({
				...shipmentData,
				userId,
			});

			// Create notification for new shipment
			await createNotification(
				userId,
				"ORDER_UPDATE",
				`New Shipment Created: ${shipment.trackingNumber}`,
				`A new shipment has been created for your order and is being prepared.`,
				{
					shipmentId: shipment._id,
					trackingNumber: shipment.trackingNumber,
					status: shipment.status,
				}
			);

			return NextResponse.json(shipment);
		},
		"shipment_create",
		CREATE_RATE_LIMIT
	);
}
