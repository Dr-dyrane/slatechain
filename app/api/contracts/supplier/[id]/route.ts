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
	const { id } = params;

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

			// Admins can see all contracts
			if (user.role === UserRole.ADMIN) {
				const contracts = await Contract.find({ supplierId: id });
				return NextResponse.json(contracts);
			}

			// Managers can see contracts for suppliers they are assigned to
			if (user.role === UserRole.MANAGER) {
				if (!(await hasAccessToContract(userId, id))) {
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

			// Suppliers can only see their own contracts
			if (user.role === UserRole.SUPPLIER && user._id.toString() === id) {
				const contracts = await Contract.find({ supplierId: id });
				return NextResponse.json(contracts);
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
