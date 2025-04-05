// app/api/contracts/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Contract from "../models/Contract";
import User from "../models/User";
import { UserRole } from "@/lib/types";
import { hasAccessToSupplier } from "../suppliers/[id]/route";

export async function hasAccessToContract(
	userId: string,
	supplierId: string
): Promise<boolean> {
	// Admin always has access
	const user = await User.findById(userId);
	if (!user) return false;

	if (user.role === UserRole.ADMIN) return true;

	// Case 1: If supplier is set, validate access
	if (supplierId) {
		const hasSupplierAccess = await hasAccessToSupplier(userId, supplierId);
		return hasSupplierAccess;
	}

	// Fallback: no access
	return false;
}

const CREATE_RATE_LIMIT = 10;
const LIST_RATE_LIMIT = 30;

// GET /api/contracts - Get all contracts (admin or manager assigned to supplier)
export async function GET(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			const user = await User.findById(userId);
			if (!user) {
				return NextResponse.json(
					{ code: "UNAUTHORIZED", message: "User not found" },
					{ status: 404 }
				);
			}

			// Admins can see all contracts
			if (user.role === UserRole.ADMIN) {
				const contracts = await Contract.find({});
				return NextResponse.json(contracts);
			}

			// Managers can only see contracts for suppliers they manage
			if (user.role === UserRole.MANAGER) {
				const supplierIds = await User.find({
					role: UserRole.SUPPLIER,
					assignedManagers: { $in: [userId] },
				}).select("_id");

				const contractList = await Contract.find({
					supplierId: { $in: supplierIds.map((supplier) => supplier._id) },
				});

				return NextResponse.json(contractList);
			}

			// Suppliers can only see their own contracts
			if (user.role === UserRole.SUPPLIER) {
				const contracts = await Contract.find({ supplierId: userId });
				return NextResponse.json(contracts);
			}

			return NextResponse.json(
				{ code: "UNAUTHORIZED", message: "Access denied" },
				{ status: 403 }
			);
		},
		"contract_list",
		LIST_RATE_LIMIT
	);
}

// POST /api/contracts - Create a new contract (admin or manager assigned to supplier)
export async function POST(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			const user = await User.findById(userId);
			if (!user) {
				return NextResponse.json(
					{ code: "UNAUTHORIZED", message: "User not found" },
					{ status: 404 }
				);
			}

			// Admin can create contracts for any supplier
			if (user.role === UserRole.ADMIN) {
				const data = await req.json();

				// Case where no supplierId is provided (open contract)
				if (!data.supplierId) {
					// You might want to set the contract status to "open"
					data.status = "open"; // Ensure that the status is marked as open
				}

				try {
					const contract = new Contract(data);
					await contract.save();
					return NextResponse.json(contract);
				} catch (error) {
					return NextResponse.json(
						{
							code: "INTERNAL_SERVER_ERROR",
							message: "An error occurred while creating the contract",
						},
						{ status: 500 }
					);
				}
			}

			// Managers can create contracts for suppliers they manage
			if (user.role === UserRole.MANAGER) {
				const data = await req.json();

				// Ensure supplierId exists if the contract is not open
				if (!data.supplierId && data.status !== "open") {
					return NextResponse.json(
						{
							code: "BAD_REQUEST",
							message: "Supplier ID is required for non-open contracts",
						},
						{ status: 400 }
					);
				}

				// If a supplierId is provided, ensure the manager has access to it
				if (
					data.supplierId &&
					!(await hasAccessToContract(userId, data.supplierId))
				) {
					return NextResponse.json(
						{
							code: "FORBIDDEN",
							message: "You do not have access to this supplier",
						},
						{ status: 403 }
					);
				}

				try {
					const contract = new Contract(data);
					await contract.save();
					return NextResponse.json(contract);
				} catch (error) {
					return NextResponse.json(
						{
							code: "INTERNAL_SERVER_ERROR",
							message: "An error occurred while creating the contract",
						},
						{ status: 500 }
					);
				}
			}

			return NextResponse.json(
				{
					code: "UNAUTHORIZED",
					message: "Only admin or manager can create contracts",
				},
				{ status: 403 }
			);
		},
		"contract_create",
		CREATE_RATE_LIMIT
	);
}
