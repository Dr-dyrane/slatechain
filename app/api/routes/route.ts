// app/api/routes/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Route from "../models/Route";
import User from "../models/User";
import { UserRole } from "@/lib/types";
import mongoose from "mongoose";

const LIST_RATE_LIMIT = 30;
const CREATE_RATE_LIMIT = 10;

// GET /api/routes - List routes based on user role
export async function GET(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Get user to determine role
			const user = await User.findById(userId);
			if (!user) {
				return NextResponse.json(
					{ code: "USER_NOT_FOUND", message: "User not found" },
					{ status: 404 }
				);
			}

			// Build query based on user role
			let query = {};

			if (user.role === UserRole.ADMIN) {
				// Admin sees all routes
				query = {};
			} else if (user.role === UserRole.MANAGER) {
				// Manager sees routes they created and routes of suppliers they manage
				const managedSupplierIds = user.assignedManagers || [];
				query = {
					$or: [
						{ createdBy: userId },
						{ createdBy: { $in: managedSupplierIds } },
					],
				};
			} else {
				// Suppliers and other roles only see routes they created
				query = { createdBy: userId };
			}

			// Find routes based on role-specific query
			const routes = await Route.find(query).sort({ name: 1 });

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
				routeData.estimatedDuration === undefined ||
				!routeData.type ||
				!routeData.origin ||
				!routeData.destination ||
				!routeData.schedule
			) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message: "Missing required fields for route creation",
					},
					{ status: 400 }
				);
			}

			// Start a transaction
			const session = await mongoose.startSession();
			session.startTransaction();

			try {
				// Set creator information
				routeData.createdBy = userId;
				routeData.userId = userId;

				// Create route
				const route = await Route.create([routeData], { session });

				await session.commitTransaction();
				return NextResponse.json(route[0]);
			} catch (error: any) {
				await session.abortTransaction();
				return NextResponse.json(
					{
						code: "CREATE_ERROR",
						message: error.message || "Failed to create route",
					},
					{ status: 400 }
				);
			} finally {
				session.endSession();
			}
		},
		"route_create",
		CREATE_RATE_LIMIT
	);
}
