// app/api/warehouses/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Warehouse from "../models/Warehouse";
import User from "../models/User";
import { createNotification } from "@/app/actions/notifications";
import { UserRole } from "@/lib/types";

const LIST_RATE_LIMIT = 30;
const CREATE_RATE_LIMIT = 10;

// GET /api/warehouses - List warehouses based on user role
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
				// Admin sees all warehouses
				query = {};
			} else if (user.role === UserRole.MANAGER) {
				// Manager sees warehouses they manage and warehouses of suppliers under them
				const managedSupplierIds = user.assignedManagers || [];
				query = {
					$or: [
						{ createdBy: userId },
						{ createdBy: { $in: managedSupplierIds } },
					],
				};
			} else {
				// Suppliers and other roles only see warehouses they created
				query = { createdBy: userId };
			}

			const warehouses = await Warehouse.find(query).sort({
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
				!warehouseData.name ||
				!warehouseData.location ||
				!warehouseData.capacity
			) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message: "Name, location, and capacity are required",
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

			// Set default values if not provided
			if (!warehouseData.utilizationPercentage) {
				warehouseData.utilizationPercentage = 0;
			}

			if (!warehouseData.status) {
				warehouseData.status = "ACTIVE";
			}

			if (!warehouseData.zones) {
				warehouseData.zones = [];
			}

			// Add creator information
			warehouseData.createdBy = userId;

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
