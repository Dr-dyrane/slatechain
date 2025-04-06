// app/api/contracts/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import mongoose from "mongoose";
import Contract from "../../models/Contract";
import User from "../../models/User";
import { UserRole } from "@/lib/types";
import { hasAccessToContract } from "../route"; // Import the helper function

const UPDATE_RATE_LIMIT = 20;
const DELETE_RATE_LIMIT = 10;

// GET /api/contracts/:id - Get a single contract
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = await params;

	return handleRequest(
		req,
		async (req, userId) => {
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid contract ID" },
					{ status: 400 }
				);
			}

			const user = await User.findById(userId);
			if (!user) {
				return NextResponse.json(
					{ code: "USER_NOT_FOUND", message: "User not found" },
					{ status: 404 }
				);
			}

			const contract = await Contract.findById(id);
			if (!contract) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Contract not found" },
					{ status: 404 }
				);
			}

			// Admins can view all contracts
			if (user.role === UserRole.ADMIN) {
				return NextResponse.json(contract);
			}

			// Managers can view contracts for suppliers they manage
			if (user.role === UserRole.MANAGER) {
				if (
					!(await hasAccessToContract(userId, contract.supplierId.toString()))
				) {
					return NextResponse.json(
						{
							code: "FORBIDDEN",
							message: "You do not have access to this contract",
						},
						{ status: 403 }
					);
				}
				return NextResponse.json(contract);
			}

			// Suppliers can only view their own contracts
			if (
				user.role === UserRole.SUPPLIER &&
				user._id.toString() === contract.supplierId.toString()
			) {
				return NextResponse.json(contract);
			}

			return NextResponse.json(
				{
					code: "UNAUTHORIZED",
					message: "You do not have access to this contract",
				},
				{ status: 403 }
			);
		},
		"contract_get",
		UPDATE_RATE_LIMIT
	);
}

// PUT /api/contracts/:id - Update a contract
export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = await params;

	return handleRequest(
		req,
		async (req, userId) => {
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid contract ID" },
					{ status: 400 }
				);
			}

			const user = await User.findById(userId);
			if (!user) {
				return NextResponse.json(
					{ code: "USER_NOT_FOUND", message: "User not found" },
					{ status: 404 }
				);
			}

			const updates = await req.json();
			const contract = await Contract.findById(id);

			if (!contract) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Contract not found" },
					{ status: 404 }
				);
			}

			// Admins can update any contract
			if (user.role === UserRole.ADMIN) {
				const updatedContract = await Contract.findByIdAndUpdate(id, updates, {
					new: true,
				});
				return NextResponse.json(updatedContract);
			}

			// Managers can update contracts for suppliers they manage
			if (user.role === UserRole.MANAGER) {
				if (
					!(await hasAccessToContract(userId, contract.supplierId.toString()))
				) {
					return NextResponse.json(
						{
							code: "FORBIDDEN",
							message: "You do not have access to update this contract",
						},
						{ status: 403 }
					);
				}

				const updatedContract = await Contract.findByIdAndUpdate(id, updates, {
					new: true,
				});
				return NextResponse.json(updatedContract);
			}

			// Suppliers can only update their own contracts
			if (
				user.role === UserRole.SUPPLIER &&
				user._id.toString() === contract.supplierId.toString()
			) {
				const updatedContract = await Contract.findByIdAndUpdate(id, updates, {
					new: true,
				});
				return NextResponse.json(updatedContract);
			}

			return NextResponse.json(
				{
					code: "UNAUTHORIZED",
					message: "You do not have access to update this contract",
				},
				{ status: 403 }
			);
		},
		"contract_update",
		UPDATE_RATE_LIMIT
	);
}

// DELETE /api/contracts/:id - Terminate/Delete a contract
export async function DELETE(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = await params;

	return handleRequest(
		req,
		async (req, userId) => {
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid contract ID" },
					{ status: 400 }
				);
			}

			const user = await User.findById(userId);
			if (!user) {
				return NextResponse.json(
					{ code: "USER_NOT_FOUND", message: "User not found" },
					{ status: 404 }
				);
			}

			const contract = await Contract.findById(id);
			if (!contract) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Contract not found" },
					{ status: 404 }
				);
			}

			// Admins can delete any contract
			if (user.role === UserRole.ADMIN) {
				await Contract.findByIdAndDelete(id);
				return NextResponse.json({ success: true });
			}

			// Managers can delete contracts for suppliers they manage
			if (user.role === UserRole.MANAGER) {
				if (
					!(await hasAccessToContract(userId, contract.supplierId.toString()))
				) {
					return NextResponse.json(
						{
							code: "FORBIDDEN",
							message: "You do not have access to delete this contract",
						},
						{ status: 403 }
					);
				}
				await Contract.findByIdAndDelete(id);
				return NextResponse.json({ success: true });
			}

			// Suppliers can only delete their own contracts
			if (
				user.role === UserRole.SUPPLIER &&
				user._id.toString() === contract.supplierId.toString()
			) {
				await Contract.findByIdAndDelete(id);
				return NextResponse.json({ success: true });
			}

			return NextResponse.json(
				{
					code: "UNAUTHORIZED",
					message: "You do not have access to delete this contract",
				},
				{ status: 403 }
			);
		},
		"contract_delete",
		DELETE_RATE_LIMIT
	);
}
