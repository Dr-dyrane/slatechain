// app/api/inventory/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Inventory from "../models/Inventory";
import User from "../models/User";
import { createNotification } from "@/app/actions/notifications";
import { UserRole } from "@/lib/types";

const LIST_RATE_LIMIT = 30;
const CREATE_RATE_LIMIT = 10;

// GET /api/inventory - List inventory items based on user role
export async function GET(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Get pagination parameters
			const { searchParams } = new URL(req.url);
			const page = Number.parseInt(searchParams.get("page") || "1");
			const limit = Number.parseInt(searchParams.get("limit") || "50");

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
			let additionalFilters = {};

			if (user.role === UserRole.ADMIN) {
				// Admin sees all inventory
				query = {};
			} else if (user.role === UserRole.MANAGER) {
				// Manager sees their own inventory and inventory of suppliers under them
				const managedSupplierIds = user.assignedManagers || [];
				query = {
					$or: [
						{ supplierId: userId },
						{ supplierId: { $in: managedSupplierIds } },
					],
				};
			} else if (user.role === UserRole.SUPPLIER) {
				query = { supplierId: userId }; // Suppliers see their own inventory
			} else if (user.role === UserRole.CUSTOMER) {
				// 1. Fetch all suppliers
				const suppliers = await User.find({ role: UserRole.SUPPLIER }).select(
					"_id firstName lastName email phoneNumber avatarUrl supplierMetadata"
				);
				// 2. Filter for active suppliers based on supplierMetadata.status
				const activeSuppliers = suppliers.filter(
					(supplier) =>
						supplier.supplierMetadata &&
						supplier.supplierMetadata.status === "ACTIVE"
				);
				// 3. Extract IDs of active suppliers
				const activeSupplierIds = activeSuppliers.map(
					(supplier) => supplier._id
				);
				additionalFilters = {
					quantity: { $gt: 0 }, // In-stock items only
					supplierId: { $in: activeSupplierIds }, // Items from active suppliers only
				};
			} else {
				return NextResponse.json(
					{ code: "UNAUTHORIZED", message: "Unauthorized to view inventory." },
					{ status: 403 }
				); // Default: no access
			}

			// Merge the main query and role based filters
			query = { ...query, ...additionalFilters };

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

			// Get user to determine role
			const user = await User.findById(userId);
			if (!user) {
				return NextResponse.json(
					{ code: "USER_NOT_FOUND", message: "User not found" },
					{ status: 404 }
				);
			}

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

			// Generate a unique SKU
			const generateSKU = (name: string): string => {
				const randomSegment = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
				const nameSegment = name.substring(0, 3).toUpperCase(); // First 3 letters of product name
				return `${nameSegment}-${randomSegment}`;
			};

			let sku = generateSKU(itemData.name);
			let existingItem = await Inventory.findOne({ sku });

			// Ensure uniqueness by regenerating if duplicate
			while (existingItem) {
				sku = generateSKU(itemData.name);
				existingItem = await Inventory.findOne({ sku });
			}

			// Assign the generated SKU to itemData
			itemData.sku = sku;

			// Set supplierId based on role
			if (!itemData.supplierId) {
				// If supplierId is not provided, use the current user's ID
				itemData.supplierId = userId;
			} else if (
				user.role !== UserRole.ADMIN &&
				itemData.supplierId !== userId
			) {
				// Non-admins can only create items for themselves
				return NextResponse.json(
					{
						code: "UNAUTHORIZED",
						message: "You can only create inventory items for yourself",
					},
					{ status: 403 }
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
