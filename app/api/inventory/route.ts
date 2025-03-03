// app/api/inventory/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Inventory from "../models/Inventory";
import { createNotification } from "@/app/actions/notifications";

const LIST_RATE_LIMIT = 30;
const CREATE_RATE_LIMIT = 10;

// GET /api/inventory - List inventory items for a specific user

export async function GET(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Get pagination parameters
			const { searchParams } = new URL(req.url);
			const page = Number.parseInt(searchParams.get("page") || "1");
			const limit = Number.parseInt(searchParams.get("limit") || "50");

			// Fetch inventory only by userId
			const query = { userId };

			// Execute query with pagination
			const [items, total] = await Promise.all([
				Inventory.find(query)
					.sort({ createdAt: -1 })
					.skip((page - 1) * limit)
					.limit(limit),
				Inventory.countDocuments(query),
			]);

			return NextResponse.json({
				items,
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			});
		},
		"inventory_list",
		LIST_RATE_LIMIT
	);
}

// POST /api/inventory - Create a new inventory item
export async function POST(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			const itemData = await req.json();

			// Validate required fields
			if (!itemData.name || !itemData.sku || !itemData.warehouseId) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message: "Name, SKU, and warehouse are required",
					},
					{ status: 400 }
				);
			}

			// Check for duplicate SKU
			const existingItem = await Inventory.findOne({ sku: itemData.sku });
			if (existingItem) {
				return NextResponse.json(
					{
						code: "DUPLICATE_SKU",
						message: "An item with this SKU already exists",
					},
					{ status: 400 }
				);
			}

			// Create inventory item
			const item = await Inventory.create(itemData);

			// Create notification for new item
			await createNotification(
				userId,
				"INVENTORY_UPDATE",
				"New Inventory Item Added",
				`${item.name} (SKU: ${item.sku}) has been added to inventory.`,
				{
					itemId: item._id,
					sku: item.sku,
					quantity: item.quantity,
				}
			);

			return NextResponse.json(item);
		},
		"inventory_create",
		CREATE_RATE_LIMIT
	);
}
