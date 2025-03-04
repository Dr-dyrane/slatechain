// app/api/suppliers/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Supplier from "../models/Supplier";
import User from "../models/User";
import { UserRole } from "@/lib/types";

const LIST_RATE_LIMIT = 30;
const CREATE_RATE_LIMIT = 10;

// GET /api/suppliers - List suppliers with role-based access control
export async function GET(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Get user for role check
			const user = await User.findById(userId);
			if (!user) {
				return NextResponse.json(
					{ code: "USER_NOT_FOUND", message: "User not found" },
					{ status: 404 }
				);
			}

			// Build query based on user role
			let query = {};

			switch (user.role) {
				case UserRole.ADMIN:
					// Admins can see all suppliers
					break;
				case UserRole.MANAGER:
					// Managers can only see suppliers assigned to them
					query = { assignedManagers: userId };
					break;
				case UserRole.SUPPLIER:
					// Suppliers can only see themselves
					query = { userId };
					break;
				default:
					return NextResponse.json(
						{
							code: "UNAUTHORIZED",
							message: "Not authorized to view suppliers",
						},
						{ status: 403 }
					);
			}

			// Find suppliers based on role-specific query
			const suppliers = await Supplier.find(query).sort({ name: 1 });

			// Return raw suppliers array
			return NextResponse.json(suppliers);
		},
		"suppliers_list",
		LIST_RATE_LIMIT
	);
}

// POST /api/suppliers - Create a new supplier
export async function POST(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Get user for role check
			const user = await User.findById(userId);
			if (!user) {
				return NextResponse.json(
					{ code: "USER_NOT_FOUND", message: "User not found" },
					{ status: 404 }
				);
			}

			// Only admins and managers can create suppliers
			if (user.role !== UserRole.ADMIN && user.role !== UserRole.MANAGER) {
				return NextResponse.json(
					{
						code: "UNAUTHORIZED",
						message: "Not authorized to create suppliers",
					},
					{ status: 403 }
				);
			}

			const supplierData = await req.json();

			// Validate required fields
			if (
				!supplierData.name ||
				!supplierData.contactPerson ||
				!supplierData.email ||
				!supplierData.phoneNumber ||
				!supplierData.address
			) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message:
							"Name, contact person, email, phone number, and address are required",
					},
					{ status: 400 }
				);
			}

			// Check if supplier with this email already exists
			const existingSupplier = await Supplier.findOne({
				email: supplierData.email,
			});
			if (existingSupplier) {
				return NextResponse.json(
					{
						code: "DUPLICATE_EMAIL",
						message: "A supplier with this email already exists",
					},
					{ status: 400 }
				);
			}

			// If manager is creating, automatically assign themselves
			if (user.role === UserRole.MANAGER) {
				supplierData.assignedManagers = [userId];
			}

			// Create supplier
			const supplier = await Supplier.create(supplierData);

			return NextResponse.json(supplier);
		},
		"supplier_create",
		CREATE_RATE_LIMIT
	);
}
