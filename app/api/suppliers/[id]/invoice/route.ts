// api/suppliers/[id]/invoice/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import User from "../../../models/User";
import { UserRole } from "@/lib/types";
import mongoose from "mongoose";

// GET /api/suppliers/[id]/invoice - Get a single supplier for invoice
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;
	return handleRequest(
		req,
		async () => {
			// Validate supplier ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid supplier ID" },
					{ status: 400 }
				);
			}

			// Find supplier (user with supplier role)
			const supplier = await User.findOne({
				_id: id,
			});

			if (!supplier) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Supplier not found" },
					{ status: 404 }
				);
			}

			// Get supplier metadata
			const supplierMetadata = supplier.supplierMetadata || {
				address: "",
				rating: 3,
				status: "ACTIVE",
			};

			// Format response to match expected supplier format
			const invoiceSupplier = {
				id: supplier._id,
				name: `${supplier.firstName} ${supplier.lastName}`,
				contactPerson: `${supplier.firstName} ${supplier.lastName}`,
				email: supplier.email,
				phoneNumber: supplier.phoneNumber || "",
				avatarUrl: supplier.avatarUrl || "",
				userId: supplier._id,
				assignedManagers: supplier.assignedManagers || [],
				address: supplierMetadata.address || "",
				rating: supplierMetadata.rating || 3,
				status: supplierMetadata.status || "ACTIVE",
			};

			return NextResponse.json(invoiceSupplier);
		},
		"supplier_invoice_get",
		LIST_RATE_LIMIT
	);
}

const LIST_RATE_LIMIT = 100;
