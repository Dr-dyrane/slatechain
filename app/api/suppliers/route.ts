// app/api/suppliers/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
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
			let query: Record<string, any> = { role: UserRole.SUPPLIER };

			switch (user.role) {
				case UserRole.ADMIN:
					// Admins can see all suppliers
					break;
				case UserRole.MANAGER:
					// Managers can only see suppliers assigned to them
					query = {
						...query,
						assignedManagers: { $in: [userId] },
					};
					break;
				case UserRole.SUPPLIER:
					// Suppliers can only see themselves
					query = {
						...query,
						_id: userId,
					};
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

			// Find users with supplier role based on role-specific query
			const suppliers = await User.find(query)
				.select("_id firstName lastName email phoneNumber avatarUrl")
				.sort({ firstName: 1, lastName: 1 });

			// Transform to match expected supplier format
			const formattedSuppliers = suppliers.map((supplier) => {
				// Get supplier metadata from the user document
				const supplierMetadata = supplier.supplierMetadata || {
					address: "",
					rating: 3,
					status: "ACTIVE",
				};

				return {
					id: supplier._id,
					name: `${supplier.firstName} ${supplier.lastName}`,
					contactPerson: `${supplier.firstName} ${supplier.lastName}`,
					email: supplier.email,
					phoneNumber: supplier.phoneNumber || "",
					avatarUrl: supplier.avatarUrl || "",
					userId: supplier._id, // Same as ID since user is the supplier
					address: supplierMetadata.address || "",
					rating: supplierMetadata.rating || 3,
					status: supplierMetadata.status || "ACTIVE",
				};
			});

			// Return suppliers array
			return NextResponse.json(formattedSuppliers);
		},
		"suppliers_list",
		LIST_RATE_LIMIT
	);
}

// POST /api/suppliers - Create a new supplier (or convert existing user to supplier)
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

			// Extract user fields and supplier-specific fields
			const {
				firstName,
				lastName,
				email,
				password,
				phoneNumber,
				role,
				// Supplier-specific fields
				address,
				rating,
				status,
				...otherData
			} = supplierData;

			// Check if we're updating an existing user or creating a new one
			if (supplierData.userId) {
				// Update existing user to be a supplier
				const existingUser = await User.findById(supplierData.userId);
				if (!existingUser) {
					return NextResponse.json(
						{ code: "USER_NOT_FOUND", message: "User not found" },
						{ status: 404 }
					);
				}

				// Update user to have supplier role
				existingUser.role = UserRole.SUPPLIER;

				// Store supplier-specific metadata
				existingUser.supplierMetadata = {
					address: address || "",
					rating: rating || 3,
					status: status || "ACTIVE",
				};

				// If manager is creating, automatically assign themselves
				if (user.role === UserRole.MANAGER) {
					if (!existingUser.assignedManagers) {
						existingUser.assignedManagers = [];
					}
					if (!existingUser.assignedManagers.includes(userId)) {
						existingUser.assignedManagers.push(userId);
					}
				}

				await existingUser.save();

				// Return formatted supplier
				return NextResponse.json({
					id: existingUser._id,
					name: `${existingUser.firstName} ${existingUser.lastName}`,
					contactPerson: `${existingUser.firstName} ${existingUser.lastName}`,
					email: existingUser.email,
					phoneNumber: existingUser.phoneNumber || "",
					avatarUrl: existingUser.avatarUrl || "",
					userId: existingUser._id,
					address: existingUser.supplierMetadata?.address || "",
					rating: existingUser.supplierMetadata?.rating || 3,
					status: existingUser.supplierMetadata?.status || "ACTIVE",
				});
			} else {
				// Creating a new user with supplier role
				// Validate required fields
				if (!firstName || !lastName || !email || !password) {
					return NextResponse.json(
						{
							code: "INVALID_INPUT",
							message:
								"First name, last name, email, and password are required",
						},
						{ status: 400 }
					);
				}

				// Check if user with this email already exists
				const existingUser = await User.findOne({
					email: email,
				});
				if (existingUser) {
					return NextResponse.json(
						{
							code: "DUPLICATE_EMAIL",
							message: "A user with this email already exists",
						},
						{ status: 400 }
					);
				}

				// Prepare user data
				const userData = {
					firstName,
					lastName,
					email,
					password,
					phoneNumber: phoneNumber || "",
					role: UserRole.SUPPLIER,
					assignedManagers: user.role === UserRole.MANAGER ? [userId] : [],
					supplierMetadata: {
						address: address || "",
						rating: rating || 3,
						status: status || "ACTIVE",
					},
				};

				// Create user with supplier role
				const newUser = await User.create(userData);

				// Return formatted supplier
				return NextResponse.json({
					id: newUser._id,
					name: `${newUser.firstName} ${newUser.lastName}`,
					contactPerson: `${newUser.firstName} ${newUser.lastName}`,
					email: newUser.email,
					phoneNumber: newUser.phoneNumber || "",
					avatarUrl: newUser.avatarUrl || "",
					userId: newUser._id,
					address: newUser.supplierMetadata?.address || "",
					rating: newUser.supplierMetadata?.rating || 3,
					status: newUser.supplierMetadata?.status || "ACTIVE",
				});
			}
		},
		"supplier_create",
		CREATE_RATE_LIMIT
	);
}
