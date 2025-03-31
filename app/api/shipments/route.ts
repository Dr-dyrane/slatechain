// app/api/shipments/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Shipment from "../models/Shipment";
import User from "../models/User";
import { createNotification } from "@/app/actions/notifications";
import { UserRole } from "@/lib/types";
import mongoose from "mongoose";

const LIST_RATE_LIMIT = 30;
const CREATE_RATE_LIMIT = 10;

// GET /api/shipments - List shipments based on user role
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
				// Admin sees all shipments
				query = {};
			} else if (user.role === UserRole.MANAGER) {
				// Manager sees shipments they created and shipments of suppliers they manage
				const managedSupplierIds = user.assignedManagers || [];
				query = {
					$or: [{ userId }, { userId: { $in: managedSupplierIds } }],
				};
			} else {
				// Suppliers and other roles only see shipments they created
				query = { userId };
			}

			// Find shipments based on role-specific query
			const shipments = await Shipment.find(query).sort({ createdAt: -1 });

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

			// Start a transaction
			const session = await mongoose.startSession();
			session.startTransaction();

			try {
				// Set default values if not provided
				if (!shipmentData.status) {
					shipmentData.status = "CREATED";
				}

				// Create shipment
				const shipment = await Shipment.create(
					[
						{
							...shipmentData,
							userId,
						},
					],
					{ session }
				);

				// Create notification for new shipment
				await createNotification(
					userId,
					"ORDER_UPDATE",
					`New Shipment Created: ${shipment[0].trackingNumber}`,
					`A new shipment has been created for your order and is being prepared.`,
					{
						shipmentId: shipment[0]._id,
						trackingNumber: shipment[0].trackingNumber,
						status: shipment[0].status,
					}
				);

				await session.commitTransaction();
				return NextResponse.json(shipment[0]);
			} catch (error : any) {
				await session.abortTransaction();
				return NextResponse.json(
					{
						code: "CREATE_ERROR",
						message: error.message || "Failed to create shipment",
					},
					{ status: 400 }
				);
			} finally {
				session.endSession();
			}
		},
		"shipment_create",
		CREATE_RATE_LIMIT
	);
}
