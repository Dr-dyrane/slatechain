// app/api/manufacturing-orders/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import ManufacturingOrder from "../models/ManufacturingOrder";
import User from "../models/User";
import { createNotification } from "@/app/actions/notifications";
import Inventory from "../models/Inventory";
import mongoose from "mongoose";
import { UserRole } from "@/lib/types";

const LIST_RATE_LIMIT = 30;
const CREATE_RATE_LIMIT = 10;

// GET /api/manufacturing-orders - List manufacturing orders based on user role
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
				// Admin sees all manufacturing orders
				query = {};
			} else if (user.role === UserRole.MANAGER) {
				// Manager sees orders they created and orders of suppliers they manage
				const managedSupplierIds = user.assignedManagers || [];
				query = {
					$or: [
						{ createdBy: userId },
						{ createdBy: { $in: managedSupplierIds } },
					],
				};
			} else {
				// Suppliers and other roles only see orders they created
				query = { createdBy: userId };
			}

			// Fetch manufacturing orders
			const orders = await ManufacturingOrder.find(query).sort({
				createdAt: -1,
			});

			return NextResponse.json(orders);
		},
		"manufacturing_order_list",
		LIST_RATE_LIMIT
	);
}

// POST /api/manufacturing-orders - Create a new manufacturing order
export async function POST(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			const orderData = await req.json();

			// Get user to determine role
			const user = await User.findById(userId);
			if (!user) {
				return NextResponse.json(
					{ code: "USER_NOT_FOUND", message: "User not found" },
					{ status: 404 }
				);
			}

			// Validate required fields
			if (
				!orderData.name ||
				!orderData.inventoryItemId ||
				!orderData.quantity ||
				!orderData.startDate ||
				!orderData.endDate ||
				!orderData.priority
			) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message:
							"Name, inventory item, quantity, start date, end date, and priority are required",
					},
					{ status: 400 }
				);
			}

			// Start a transaction
			const session = await mongoose.startSession();
			session.startTransaction();

			try {
				// Validate inventory item exists and user has access to it
				const inventoryItem = await Inventory.findById(
					orderData.inventoryItemId
				).session(session);

				if (!inventoryItem) {
					throw new Error("Inventory item not found");
				}

				// Check if user has access to the inventory item
				let hasAccess = false;
				if (user.role === UserRole.ADMIN) {
					hasAccess = true;
				} else if (user.role === UserRole.MANAGER) {
					const managedSupplierIds = user.assignedManagers || [];
					hasAccess =
						inventoryItem.supplierId === userId ||
						managedSupplierIds.includes(inventoryItem.supplierId);
				} else {
					hasAccess = inventoryItem.supplierId === userId;
				}

				if (!hasAccess) {
					throw new Error("You don't have access to this inventory item");
				}

				// Validate bill of materials if provided
				if (orderData.billOfMaterials && orderData.billOfMaterials.materials) {
					for (const material of orderData.billOfMaterials.materials) {
						const materialItem = await Inventory.findById(
							material.materialId
						).session(session);
						if (!materialItem) {
							throw new Error(`Material ${material.materialId} not found`);
						}
					}
				} else {
					// Initialize empty bill of materials if not provided
					orderData.billOfMaterials = {
						materials: [],
						laborHours: 0,
						machineHours: 0,
						instructions: "",
						version: "1.0",
					};
				}

				// Add creator information
				orderData.createdBy = userId;

				// Set default status if not provided
				if (!orderData.status) {
					orderData.status = "PLANNED";
				}

				// Create manufacturing order
				const order = await ManufacturingOrder.create([orderData], { session });

				// Create notification
				await createNotification(
					userId,
					"MANUFACTURING_ORDER",
					`New Manufacturing Order Created`,
					`Order ${order[0].orderNumber} has been created for ${order[0].name}`,
					{
						orderId: order[0]._id,
						orderNumber: order[0].orderNumber,
						productName: order[0].name,
					}
				);

				await session.commitTransaction();
				return NextResponse.json(order[0]);
			} catch (error: any) {
				await session.abortTransaction();
				return NextResponse.json(
					{
						code: "CREATE_ERROR",
						message: error.message || "Failed to create manufacturing order",
					},
					{ status: 400 }
				);
			} finally {
				session.endSession();
			}
		},
		"manufacturing_order_create",
		CREATE_RATE_LIMIT
	);
}
