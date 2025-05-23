// app/api/contracts/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Contract from "../models/Contract";
import User from "../models/User";
import { UserRole } from "@/lib/types";
import { hasAccessToSupplier } from "../suppliers/[id]/route";
import { notifyAllSuppliersAboutOpenContract } from "@/app/actions/notifications";

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

			const data = await req.json();

			// Handle case where supplierId is "no-supplier"
			let isNoSupplierCase = false;
			if (data.supplierId === "no-supplier") {
				data.supplierId = userId;
				data.status = "open";
				isNoSupplierCase = true;
			}

			const createContract = async () => {
				data.createdBy = userId;
				const contract = new Contract(data);
				await contract.save();

				// If this is an open contract, notify all suppliers
				if (contract.status === "open") {
					await notifyAllSuppliersAboutOpenContract(
						contract._id.toString(),
						contract.contractNumber,
						contract.title
					);
				}

				return contract;
			};

			if (user.role === UserRole.ADMIN) {
				try {
					const contract = await createContract();
					return NextResponse.json(contract);
				} catch (error: any) {
					return NextResponse.json(
						{
							code: "INTERNAL_SERVER_ERROR",
							message: error.message || "Error creating contract",
						},
						{ status: 500 }
					);
				}
			}

			if (user.role === UserRole.MANAGER) {
				if (!data.supplierId && data.status !== "open") {
					return NextResponse.json(
						{
							code: "BAD_REQUEST",
							message: "Supplier ID is required for non-open contracts",
						},
						{ status: 400 }
					);
				}

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
					const contract = await createContract();
					return NextResponse.json(contract);
				} catch (error: any) {
					return NextResponse.json(
						{
							code: "INTERNAL_SERVER_ERROR",
							message: error.message || "Error creating contract",
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
