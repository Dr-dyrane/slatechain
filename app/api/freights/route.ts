// app/api/freights/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Freight from "../models/Freight";

const LIST_RATE_LIMIT = 30;
const CREATE_RATE_LIMIT = 10;

// GET /api/freights - List freights for a specific user
export async function GET(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Find all freights for this user
			const freights = await Freight.find({ userId }).sort({ name: 1 });

			// Return raw freights array
			return NextResponse.json(freights);
		},
		"freights_list",
		LIST_RATE_LIMIT
	);
}

// POST /api/freights - Create a new freight
export async function POST(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			const freightData = await req.json();

			// Validate required fields
			if (
				!freightData.name ||
				!freightData.type ||
				freightData.weight === undefined ||
				freightData.volume === undefined
			) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message: "Name, type, weight, and volume are required",
					},
					{ status: 400 }
				);
			}

			// Create freight
			const freight = await Freight.create({
				...freightData,
				userId,
			});

			return NextResponse.json(freight);
		},
		"freight_create",
		CREATE_RATE_LIMIT
	);
}
