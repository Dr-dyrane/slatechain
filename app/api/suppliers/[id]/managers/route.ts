// app/api/suppliers/[id]/managers/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Supplier from "../../../models/Supplier";
import User from "../../../models/User";
import { UserRole } from "@/lib/types";
import mongoose from "mongoose";

const LIST_RATE_LIMIT = 30;
const UPDATE_RATE_LIMIT = 10;

// GET /api/suppliers/[id]/managers - Get managers assigned to a supplier
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = await params;
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

			// Only admins and managers assigned to this supplier can view managers
			if (user.role !== UserRole.ADMIN) {
				const hasAccess = await Supplier.findOne({
					_id: id,
					assignedManagers: userId,
				});

				if (!hasAccess) {
					return NextResponse.json(
						{
							code: "UNAUTHORIZED",
							message: "Not authorized to view managers for this supplier",
						},
						{ status: 403 }
					);
				}
			}

			// Find supplier
			const supplier = await Supplier.findById(id);
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
	const { id } = await params;
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

			// Find supplier
			const supplier = await Supplier.findById(id);
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
			const updatedSupplier = await Supplier.findByIdAndUpdate(
				id,
				{ assignedManagers: managerIds },
				{ new: true }
			);

			return NextResponse.json(updatedSupplier);
		},
		"supplier_managers_update",
		UPDATE_RATE_LIMIT
	);
}
