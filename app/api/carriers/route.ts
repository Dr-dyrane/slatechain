// app/api/carriers/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Carrier from "../models/Carrier";
import User from "../models/User";
import { UserRole } from "@/lib/types";
import mongoose from "mongoose";

const LIST_RATE_LIMIT = 30;
const CREATE_RATE_LIMIT = 10;

// GET /api/carriers - List carriers based on user role
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
				// Admin sees all carriers
				query = {};
			} else if (user.role === UserRole.MANAGER) {
				// Manager sees carriers they created and carriers of suppliers they manage
				const managedSupplierIds = user.assignedManagers || [];
				query = {
					$or: [{ userId }, { userId: { $in: managedSupplierIds } }],
				};
			} else {
				// Suppliers and other roles only see carriers they created
				query = { userId };
			}

			// Find carriers based on role-specific query
			const carriers = await Carrier.find(query).sort({ name: 1 });

			return NextResponse.json(carriers);
		},
		"carriers_list",
		LIST_RATE_LIMIT
	);
}

// POST /api/carriers - Create a new carrier
export async function POST(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			const carrierData = await req.json();

			// Validate required fields
			if (
				!carrierData.name ||
				!carrierData.contactPerson ||
				!carrierData.email ||
				!carrierData.phone
			) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message: "Name, contact person, email, and phone are required",
					},
					{ status: 400 }
				);
			}

			// Start a transaction
			const session = await mongoose.startSession();
			session.startTransaction();

			try {
				// Set default values if not provided
				if (!carrierData.status) {
					carrierData.status = "ACTIVE";
				}

				if (!carrierData.rating) {
					carrierData.rating = 3;
				}

				// Create carrier
				const carrier = await Carrier.create(
					[
						{
							...carrierData,
							userId,
						},
					],
					{ session }
				);

				await session.commitTransaction();
				return NextResponse.json(carrier[0]);
			} catch (error: any) {
				await session.abortTransaction();
				return NextResponse.json(
					{
						code: "CREATE_ERROR",
						message: error.message || "Failed to create carrier",
					},
					{ status: 400 }
				);
			} finally {
				session.endSession();
			}
		},
		"carrier_create",
		CREATE_RATE_LIMIT
	);
}
