// app/api/stock-movements/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import StockMovement from "../models/StockMovement";
import { createNotification } from "@/app/actions/notifications";
import Inventory from "../models/Inventory";
import mongoose from "mongoose";

const LIST_RATE_LIMIT = 30;
const CREATE_RATE_LIMIT = 10;

// GET /api/stock-movements - List all stock movements
export async function GET(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			const movements = await StockMovement.find().sort({ createdAt: -1 });
			return NextResponse.json(movements);
		},
		"stock_movement_list",
		LIST_RATE_LIMIT
	);
}

// POST /api/stock-movements - Create a new stock movement
export async function POST(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			const movementData = await req.json();

			// Validate required fields
			if (
				!movementData.type ||
				!movementData.sourceLocationId ||
				!movementData.destinationLocationId ||
				!movementData.items
			) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message:
							"Type, source location, destination location, and items are required",
					},
					{ status: 400 }
				);
			}

			// Start a transaction
			const session = await mongoose.startSession();
			session.startTransaction();

			try {
				// Validate items exist and have sufficient quantity
				for (const item of movementData.items) {
					const inventoryItem = await Inventory.findById(
						item.inventoryItemId
					).session(session);
					if (!inventoryItem) {
						throw new Error(`Inventory item ${item.inventoryItemId} not found`);
					}

					if (
						movementData.type !== "RECEIVING" &&
						inventoryItem.quantity < item.quantity
					) {
						throw new Error(
							`Insufficient quantity for item ${inventoryItem.sku}`
						);
					}
				}

				// Create movement record
				const movement = await StockMovement.create(
					[
						{
							...movementData,
							handledBy: userId,
							status: "PENDING",
						},
					],
					{ session }
				);

				// Create notification
				await createNotification(
					userId,
					"STOCK_MOVEMENT",
					`New Stock Movement Created`,
					`A new ${movementData.type.toLowerCase()} movement has been created`,
					{
						movementId: movement[0]._id,
						type: movementData.type,
						items: movementData.items,
					}
				);

				await session.commitTransaction();
				return NextResponse.json(movement[0]);
			} catch (error) {
				await session.abortTransaction();
				throw error;
			} finally {
				session.endSession();
			}
		},
		"stock_movement_create",
		CREATE_RATE_LIMIT
	);
}
