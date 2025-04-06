// app/api/bids/route.ts

import { NextRequest, NextResponse } from "next/server";
import { handleRequest } from "..";
import User from "../models/User";
import { UserRole } from "@/lib/types";
import Bid from "../models/Bid";

const READ_RATE_LIMIT = 30;

// GET /api/bids - Fetch all bids
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

			// Admin can fetch all bids
			if (user.role === UserRole.ADMIN) {
				try {
					const bids = await Bid.find().populate("supplierId"); // Assuming Bid schema references supplierId
					return NextResponse.json(bids);
				} catch (error: any) {
					return NextResponse.json(
						{
							code: "INTERNAL_SERVER_ERROR",
							message: error.message || "An error occurred while fetching bids",
						},
						{ status: 500 }
					);
				}
			}

			// Managers or other roles can fetch bids based on their access
			if (user.role === UserRole.MANAGER) {
				// Managers might need filtering, e.g., fetching only bids related to suppliers they manage
				const bids = await Bid.find({ supplierId: { $in: user.managedSuppliers } }).populate("supplierId");
				return NextResponse.json(bids);
			}

			return NextResponse.json(
				{
					code: "FORBIDDEN",
					message: "You do not have access to view bids",
				},
				{ status: 403 }
			);
		},
		"bids_get",
		READ_RATE_LIMIT
	);
}
