// app/api/transports/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Transport from "../models/Transport";
import User from "../models/User";
import { UserRole } from "@/lib/types";
import mongoose from "mongoose";

const LIST_RATE_LIMIT = 30;
const CREATE_RATE_LIMIT = 10;

// GET /api/transports - List transports based on user role
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
				// Admin sees all transports
				query = {};
			} else if (user.role === UserRole.MANAGER) {
				// Manager sees transports they created and transports of suppliers they manage
				const managedSupplierIds = user.assignedManagers || [];
				query = {
					$or: [{ userId }, { userId: { $in: managedSupplierIds } }],
				};
			} else {
				// Suppliers and other roles only see transports they created
				query = { userId };
			}

			// Find transports based on role-specific query
			const transports = await Transport.find(query).sort({ createdAt: -1 });

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
				!transportData.name ||
				!transportData.type ||
				transportData.capacity === undefined ||
				!transportData.currentLocation ||
				!transportData.carrierId
			) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message:
							"Name, type, capacity, current location, and carrier ID are required",
					},
					{ status: 400 }
				);
			}

			// Start a transaction
			const session = await mongoose.startSession();
			session.startTransaction();

			try {
				// Set default values if not provided
				if (!transportData.status) {
					transportData.status = "AVAILABLE";
				}

				// Create transport
				const transport = await Transport.create(
					[
						{
							...transportData,
							userId,
						},
					],
					{ session }
				);

				await session.commitTransaction();
				return NextResponse.json(transport[0]);
			} catch (error: any) {
				await session.abortTransaction();
				return NextResponse.json(
					{
						code: "CREATE_ERROR",
						message: error.message || "Failed to create transport",
					},
					{ status: 400 }
				);
			} finally {
				session.endSession();
			}
		},
		"transport_create",
		CREATE_RATE_LIMIT
	);
}
