// app/api/transports/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Transport from "../models/Transport";

const LIST_RATE_LIMIT = 30;
const CREATE_RATE_LIMIT = 10;

// GET /api/transports - List transports for a specific user
export async function GET(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Find all transports for this user
			const transports = await Transport.find({ userId }).sort({
				createdAt: -1,
			});

			// Return raw transports array
			return NextResponse.json(transports);
		},
		"transports_list",
		LIST_RATE_LIMIT
	);
}

// POST /api/transports - Create a new transport
export async function POST(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			const transportData = await req.json();

			// Validate required fields
			if (
				!transportData.type ||
				transportData.capacity === undefined ||
				!transportData.currentLocation ||
				!transportData.carrierId
			) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message:
							"Type, capacity, current location, and carrier ID are required",
					},
					{ status: 400 }
				);
			}

			// Create transport
			const transport = await Transport.create({
				...transportData,
				userId,
			});

			return NextResponse.json(transport);
		},
		"transport_create",
		CREATE_RATE_LIMIT
	);
}
