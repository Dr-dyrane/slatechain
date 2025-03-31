// app/api/orders/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import { createNotification } from "@/app/actions/notifications";
import Order from "../models/Order";
import User from "../models/User";
import { UserRole } from "@/lib/types";
import Inventory from "../models/Inventory";

const LIST_RATE_LIMIT = 30;
const CREATE_RATE_LIMIT = 10;

// GET /api/orders - List orders based on user role
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
				// Admin sees all orders
				query = {};
			} else if (user.role === UserRole.MANAGER) {
				// Manager sees orders from their own suppliers and assigned suppliers
				const managedSupplierIds = user.assignedManagers || [];

				// Find all inventory items from managed suppliers
				const supplierProducts = await Inventory.find({
					supplierId: { $in: managedSupplierIds },
				}).select("_id");
				const supplierProductIds = supplierProducts.map((item) => item._id);

				query = {
					$or: [
						{ "items.productId": { $in: supplierProductIds } }, // Orders with items from managed suppliers
						{ supplierId: { $in: managedSupplierIds } }, // Orders directly from managed suppliers
					],
				};
			} else if (user.role === UserRole.SUPPLIER) {
				// Supplier sees only orders containing their own products
				const supplierProducts = await Inventory.find({
					supplierId: userId,
				}).select("_id");
				const supplierProductIds = supplierProducts.map((item) => item._id);

				query = {
					"items.productId": { $in: supplierProductIds }, // Check if any order item belongs to the supplier
				};
			} else if (user.role === UserRole.CUSTOMER) {
				// Customer sees orders they placed
				query = { customerId: userId };
			} else {
				return NextResponse.json(
					{ code: "UNAUTHORIZED", message: "Unauthorized to view orders." },
					{ status: 403 }
				);
			}

			// Execute query to get all orders without pagination
			const orders = await Order.find(query).sort({ createdAt: -1 });

			return NextResponse.json(orders);
		},
		"orders_list",
		LIST_RATE_LIMIT
	);
}

// POST /api/orders - Create a new order
export async function POST(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			const orderData = await req.json();

			// Validate required fields
			if (
				!orderData.customerId ||
				!orderData.items ||
				orderData.items.length === 0
			) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message: "Customer ID and at least one item are required",
					},
					{ status: 400 }
				);
			}

			// Calculate total amount
			const totalAmount = orderData.items.reduce(
				(sum: number, item: { quantity: number; price: number }) =>
					sum + item.quantity * item.price,
				0
			);

			// Create order
			const order = await Order.create({
				...orderData,
				totalAmount,
				createdBy: userId,
			});

			// Create notification for new order
			await createNotification(
				userId,
				"ORDER_UPDATE",
				`New Order ${order.orderNumber}`,
				`Order ${order.orderNumber} has been created and is pending processing.`,
				{
					orderId: order._id,
					orderNumber: order.orderNumber,
					status: order.status,
				}
			);

			return NextResponse.json(order);
		},
		"order_create",
		CREATE_RATE_LIMIT
	);
}
