// app/api/contracts/[id]/bids/route.ts

import { type NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Contract from "../../../models/Contract";
import Bid from "../../../models/Bid";
import User from "../../../models/User";
import { UserRole } from "@/lib/types";

export async function POST(
	req: NextRequest,
	{ params }: { params: { contractId: string } }
) {
	const { contractId } = await params;
	const { amount, terms, deliveryDate } = await req.json();
	const userId = req.headers.get("user-id"); // Assuming you're passing the user ID in headers

	if (!mongoose.Types.ObjectId.isValid(contractId)) {
		return NextResponse.json(
			{ code: "INVALID_ID", message: "Invalid contract ID" },
			{ status: 400 }
		);
	}

	// Validate the contract exists
	const contract = await Contract.findById(contractId);
	if (!contract) {
		return NextResponse.json(
			{ code: "CONTRACT_NOT_FOUND", message: "Contract not found" },
			{ status: 404 }
		);
	}

	// Validate if the user has permission to bid (only suppliers can bid)
	const user = await User.findById(userId);
	if (!user || user.role !== UserRole.SUPPLIER) {
		return NextResponse.json(
			{ code: "UNAUTHORIZED", message: "Only suppliers can bid" },
			{ status: 403 }
		);
	}

	// Create the bid
	const bid = new Bid({
		userId,
		contractId,
		amount,
		terms,
		deliveryDate,
		status: "pending", // Default status can be pending
	});

	await bid.save();

	return NextResponse.json({ message: "Bid created successfully", bid });
}

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = await params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return NextResponse.json(
			{ code: "INVALID_ID", message: "Invalid contract ID" },
			{ status: 400 }
		);
	}

	const bids = await Bid.find({ id });

	return NextResponse.json(bids);
}
