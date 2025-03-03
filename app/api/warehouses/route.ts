import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Warehouse from "../models/Warehouse";
import { createNotification } from "@/app/actions/notifications";

const LIST_RATE_LIMIT = 30;
const CREATE_RATE_LIMIT = 10;

// GET /api/warehouses - List warehouses for a specific user
export async function GET(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			const warehouses = await Warehouse.find({ userId }).sort({
				createdAt: -1,
			});
			return NextResponse.json(warehouses);
		},
		"warehouse_list",
		LIST_RATE_LIMIT
	);
}

// POST /api/warehouses - Create a new warehouse
export async function POST(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			const warehouseData = await req.json();

			// Validate required fields
			if (!warehouseData.name || !warehouseData.location) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message: "Name and location are required",
					},
					{ status: 400 }
				);
			}

			// Check for duplicate name
			const existingWarehouse = await Warehouse.findOne({
				name: warehouseData.name,
			});
			if (existingWarehouse) {
				return NextResponse.json(
					{
						code: "DUPLICATE_NAME",
						message: "A warehouse with this name already exists",
					},
					{ status: 400 }
				);
			}

			// Create warehouse
			const warehouse = await Warehouse.create(warehouseData);

			// Create notification for new warehouse
			await createNotification(
				userId,
				"WAREHOUSE_UPDATE",
				"New Warehouse Added",
				`${warehouse.name} has been added to the system.`,
				{
					warehouseId: warehouse._id,
					location: warehouse.location,
				}
			);

			return NextResponse.json(warehouse);
		},
		"warehouse_create",
		CREATE_RATE_LIMIT
	);
}
