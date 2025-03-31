// app/api/freights/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Freight from "../models/Freight";
import User from "../models/User";
import { UserRole } from "@/lib/types";
import mongoose from "mongoose";

const LIST_RATE_LIMIT = 30;
const CREATE_RATE_LIMIT = 10;

// GET /api/freights - List freights based on user role
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
				// Admin sees all freights
				query = {};
			} else if (user.role === UserRole.MANAGER) {
				// Manager sees freights they created and freights of suppliers they manage
				const managedSupplierIds = user.assignedManagers || [];
				query = {
					$or: [
						{ createdBy: userId },
						{ createdBy: { $in: managedSupplierIds } },
					],
				};
			} else {
				// Suppliers and other roles only see freights they created
				query = { createdBy: userId };
			}

			// Find freights based on role-specific query
			const freights = await Freight.find(query).sort({ createdAt: -1 });

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
				!freightData.type ||
				!freightData.carrierId ||
				!freightData.routeId ||
				!freightData.schedule ||
				!freightData.vehicle
			) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message: "Missing required fields for freight creation",
					},
					{ status: 400 }
				);
			}

			// Start a transaction
			const session = await mongoose.startSession();
			session.startTransaction();

			try {
				// Set creator information
				freightData.createdBy = userId;

				// Create freight
				const freight = await Freight.create([freightData], { session });

				await session.commitTransaction();
				return NextResponse.json(freight[0]);
			} catch (error: any) {
				await session.abortTransaction();
				return NextResponse.json(
					{
						code: "CREATE_ERROR",
						message: error.message || "Failed to create freight",
					},
					{ status: 400 }
				);
			} finally {
				session.endSession();
			}
		},
		"freight_create",
		CREATE_RATE_LIMIT
	);
}
