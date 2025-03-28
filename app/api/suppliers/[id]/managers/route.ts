// app/api/suppliers/[id]/managers/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import User from "../../../models/User";
import { UserRole } from "@/lib/types";
import mongoose from "mongoose";

const LIST_RATE_LIMIT = 30;
const UPDATE_RATE_LIMIT = 10;

// Helper function to check if user has access to supplier
async function hasAccessToSupplier(userId: string, supplierId: string) {
	const user = await User.findById(userId);
	if (!user) return false;

	if (user.role === UserRole.ADMIN) return true;

	if (user.role === UserRole.MANAGER) {
		const supplier = await User.findOne({
			_id: supplierId,
			role: UserRole.SUPPLIER,
			assignedManagers: { $in: [userId] },
		});
		return !!supplier;
	}

	if (user.role === UserRole.SUPPLIER) {
		return userId === supplierId;
	}

	return false;
}

// GET /api/suppliers/[id]/managers - Get managers assigned to a supplier
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate supplier ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid supplier ID" },
					{ status: 400 }
				);
			}

			// Get user for role check
			const user = await User.findById(userId);
			if (!user) {
				return NextResponse.json(
					{ code: "USER_NOT_FOUND", message: "User not found" },
					{ status: 404 }
				);
			}

			// Check access
			const hasAccess = await hasAccessToSupplier(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{
						code: "UNAUTHORIZED",
						message: "Not authorized to view managers for this supplier",
					},
					{ status: 403 }
				);
			}

			// Find supplier (user with supplier role)
			const supplier = await User.findOne({
				_id: id,
				role: UserRole.SUPPLIER,
			});

			if (!supplier) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Supplier not found" },
					{ status: 404 }
				);
			}

			// Get assigned managers
			const managers = await User.find({
				_id: { $in: supplier.assignedManagers || [] },
				role: UserRole.MANAGER,
			}).select("_id firstName lastName email");

			return NextResponse.json(managers);
		},
		"supplier_managers_list",
		LIST_RATE_LIMIT
	);
}

// PUT /api/suppliers/[id]/managers - Update managers assigned to a supplier
export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate supplier ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid supplier ID" },
					{ status: 400 }
				);
			}

			// Get user for role check
			const user = await User.findById(userId);
			if (!user) {
				return NextResponse.json(
					{ code: "USER_NOT_FOUND", message: "User not found" },
					{ status: 404 }
				);
			}

			// Only admins can update manager assignments
			if (user.role !== UserRole.ADMIN) {
				return NextResponse.json(
					{
						code: "UNAUTHORIZED",
						message: "Only admins can update manager assignments",
					},
					{ status: 403 }
				);
			}

			// Find supplier (user with supplier role)
			const supplier = await User.findOne({
				_id: id,
				role: UserRole.SUPPLIER,
			});

			if (!supplier) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Supplier not found" },
					{ status: 404 }
				);
			}

			const { managerIds } = await req.json();

			// Validate manager IDs
			if (!Array.isArray(managerIds)) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message: "Manager IDs must be an array",
					},
					{ status: 400 }
				);
			}

			// Verify all IDs are valid and belong to managers
			for (const managerId of managerIds) {
				if (!mongoose.Types.ObjectId.isValid(managerId)) {
					return NextResponse.json(
						{
							code: "INVALID_ID",
							message: `Invalid manager ID: ${managerId}`,
						},
						{ status: 400 }
					);
				}

				const manager = await User.findOne({
					_id: managerId,
					role: UserRole.MANAGER,
				});

				if (!manager) {
					return NextResponse.json(
						{
							code: "INVALID_MANAGER",
							message: `User ${managerId} is not a manager`,
						},
						{ status: 400 }
					);
				}
			}

			// Update supplier's assigned managers
			supplier.assignedManagers = managerIds;
			await supplier.save();

			// Format response to match expected supplier format
			const formattedSupplier = {
				id: supplier._id,
				name: `${supplier.firstName} ${supplier.lastName}`,
				contactPerson: `${supplier.firstName} ${supplier.lastName}`,
				email: supplier.email,
				phoneNumber: supplier.phoneNumber || "",
				avatarUrl: supplier.avatarUrl || "",
				userId: supplier._id,
				assignedManagers: supplier.assignedManagers,
			};

			return NextResponse.json(formattedSupplier);
		},
		"supplier_managers_update",
		UPDATE_RATE_LIMIT
	);
}
