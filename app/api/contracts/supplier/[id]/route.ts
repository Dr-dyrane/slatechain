// app/api/contracts/supplier/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Contract from "../../../models/Contract";
import mongoose from "mongoose";
import User from "../../../models/User";
import { UserRole } from "@/lib/types";
import { hasAccessToContract } from "../../route";

const LIST_RATE_LIMIT = 20;

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
					{ code: "INVALID_ID", message: "Invalid supplier ID" },
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

			// Admins can see all contracts for a supplier
			if (user.role === UserRole.ADMIN) {
				const contracts = await Contract.find({ supplierId: id });
				return NextResponse.json(contracts);
			}

			// Managers can only see contracts for suppliers they manage
			if (user.role === UserRole.MANAGER) {
				const hasAccess = await hasAccessToContract(userId, id);
				if (!hasAccess) {
					return NextResponse.json(
						{
							code: "FORBIDDEN",
							message: "You do not have access to this supplier",
						},
						{ status: 403 }
					);
				}

				const contracts = await Contract.find({ supplierId: id });
				return NextResponse.json(contracts);
			}

			if (user.role === UserRole.SUPPLIER && user._id.toString() === id) {
				const supplierContracts = await Contract.find({ supplierId: id });
				const openContracts = await Contract.find({ status: "open" });

				// Create a map to avoid duplicates using contract ID
				const contractMap = new Map();

				// Add supplier-specific contracts
				supplierContracts.forEach((contract) => {
					contractMap.set(contract._id.toString(), contract);
				});

				// Add open contracts, only if not already added
				openContracts.forEach((contract) => {
					if (!contractMap.has(contract._id.toString())) {
						contractMap.set(contract._id.toString(), contract);
					}
				});

				// Convert map values back to array
				const mergedContracts = Array.from(contractMap.values());

				return NextResponse.json(mergedContracts);
			}

			return NextResponse.json(
				{ code: "UNAUTHORIZED", message: "You do not have access" },
				{ status: 403 }
			);
		},
		"contract_supplier_list",
		LIST_RATE_LIMIT
	);
}
