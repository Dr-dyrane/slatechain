// api/suppliers/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import User from "../../models/User";
import { UserRole } from "@/lib/types";
import mongoose from "mongoose";

const UPDATE_RATE_LIMIT = 20;
const DELETE_RATE_LIMIT = 10;

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

// GET /api/suppliers/[id] - Get a single supplier
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

			// Check access
			const hasAccess = await hasAccessToSupplier(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{
						code: "UNAUTHORIZED",
						message: "Not authorized to view this supplier",
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

			// Format response to match expected supplier format
			const formattedSupplier = {
				id: supplier._id,
				name: `${supplier.firstName} ${supplier.lastName}`,
				contactPerson: `${supplier.firstName} ${supplier.lastName}`,
				email: supplier.email,
				phoneNumber: supplier.phoneNumber || "",
				avatarUrl: supplier.avatarUrl || "",
				userId: supplier._id,
				assignedManagers: supplier.assignedManagers || [],
			};

			return NextResponse.json(formattedSupplier);
		},
		"supplier_get",
		UPDATE_RATE_LIMIT
	);
}

// PUT /api/suppliers/[id] - Update a supplier
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

			// Check access
			const hasAccess = await hasAccessToSupplier(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{
						code: "UNAUTHORIZED",
						message: "Not authorized to update this supplier",
					},
					{ status: 403 }
				);
			}

			const updates = await req.json();

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

			// Only update allowed fields
			const allowedUpdates = [
				"firstName",
				"lastName",
				"email",
				"phoneNumber",
				"avatarUrl",
			];

			for (const field of allowedUpdates) {
				if (updates[field] !== undefined) {
					supplier[field] = updates[field];
				}
			}

			// Save updated supplier
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
				assignedManagers: supplier.assignedManagers || [],
			};

			return NextResponse.json(formattedSupplier);
		},
		"supplier_update",
		UPDATE_RATE_LIMIT
	);
}

// DELETE /api/suppliers/[id] - Delete a supplier (or just remove supplier role)
export async function DELETE(
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

			// Only admins can delete suppliers
			if (user.role !== UserRole.ADMIN) {
				return NextResponse.json(
					{ code: "UNAUTHORIZED", message: "Only admins can delete suppliers" },
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

			// Option 1: Change role to customer instead of deleting
			supplier.role = UserRole.CUSTOMER;
			await supplier.save();

			// Option 2: Delete the user entirely (uncomment if you want this behavior)
			// await supplier.deleteOne();

			return NextResponse.json({ success: true });
		},
		"supplier_delete",
		DELETE_RATE_LIMIT
	);
}
