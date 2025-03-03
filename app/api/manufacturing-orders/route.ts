// app/api/manufacturing-orders/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import ManufacturingOrder from "../models/ManufacturingOrder";
import { createNotification } from "@/app/actions/notifications";
import Inventory from "../models/Inventory";
import mongoose from "mongoose";

const LIST_RATE_LIMIT = 30;
const CREATE_RATE_LIMIT = 10;

// GET /api/manufacturing-orders - List manufacturing orders for a specific user
export async function GET(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Fetch manufacturing orders only by userId
			const orders = await ManufacturingOrder.find({ userId }).sort({
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

			// Validate required fields
			if (
				!orderData.name ||
				!orderData.inventoryItemId ||
				!orderData.quantity ||
				!orderData.startDate ||
				!orderData.endDate
			) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message:
							"Name, inventory item, quantity, start date, and end date are required",
					},
					{ status: 400 }
				);
			}

			// Start a transaction
			const session = await mongoose.startSession();
			session.startTransaction();

			try {
				// Validate inventory item exists
				const inventoryItem = await Inventory.findById(
					orderData.inventoryItemId
				).session(session);
				if (!inventoryItem) {
					throw new Error("Inventory item not found");
				}

				// Validate bill of materials if provided
				if (orderData.billOfMaterials) {
					for (const material of orderData.billOfMaterials.materials) {
						const materialItem = await Inventory.findById(
							material.materialId
						).session(session);
						if (!materialItem) {
							throw new Error(`Material ${material.materialId} not found`);
						}
					}
				}

				// Create manufacturing order
				const order = await ManufacturingOrder.create(
					[
						{
							...orderData,
							status: "PLANNED",
						},
					],
					{ session }
				);

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
			} catch (error) {
				await session.abortTransaction();
				throw error;
			} finally {
				session.endSession();
			}
		},
		"manufacturing_order_create",
		CREATE_RATE_LIMIT
	);
}
