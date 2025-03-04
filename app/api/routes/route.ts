// app/api/routes/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Route from "../models/Route";

const LIST_RATE_LIMIT = 30;
const CREATE_RATE_LIMIT = 10;

// GET /api/routes - List routes for a specific user
export async function GET(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Find all routes for this user
			const routes = await Route.find({ userId }).sort({ name: 1 });

			// Return raw routes array
			return NextResponse.json(routes);
		},
		"routes_list",
		LIST_RATE_LIMIT
	);
}

// POST /api/routes - Create a new route
export async function POST(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			const routeData = await req.json();

			// Validate required fields
			if (
				!routeData.name ||
				!routeData.startLocation ||
				!routeData.endLocation ||
				routeData.distance === undefined ||
				routeData.estimatedDuration === undefined
			) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message:
							"Name, start location, end location, distance, and estimated duration are required",
					},
					{ status: 400 }
				);
			}

			// Create route
			const route = await Route.create({
				...routeData,
				userId,
			});

			return NextResponse.json(route);
		},
		"route_create",
		CREATE_RATE_LIMIT
	);
}
