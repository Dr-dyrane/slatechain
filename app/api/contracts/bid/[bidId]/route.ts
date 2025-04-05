// app/api/contracts/bid/[bidId]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Bid from "../../../models/Bid";
import { UserRole } from "@/lib/types";
import Contract from "../../../models/Contract";

export async function PUT(
	req: NextRequest,
	{ params }: { params: { bidId: string } }
) {
	const { bidId } = params;
	const { amount, terms, deliveryDate } = await req.json();
	const userId = req.headers.get("user-id");

	if (!mongoose.Types.ObjectId.isValid(bidId)) {
		return NextResponse.json(
			{ code: "INVALID_ID", message: "Invalid bid ID" },
			{ status: 400 }
		);
	}

	// Find the bid and validate it
	const bid = await Bid.findById(bidId);
	if (!bid) {
		return NextResponse.json(
			{ code: "BID_NOT_FOUND", message: "Bid not found" },
			{ status: 404 }
		);
	}

	// Ensure the user is the one who created the bid
	if (bid.userId.toString() !== userId) {
		return NextResponse.json(
			{ code: "FORBIDDEN", message: "You can only update your own bid" },
			{ status: 403 }
		);
	}

	// Check if the associated contract is still open (not awarded)
	const contract = await Contract.findById(bid.contractId);
	if (contract?.status !== "open") {
		return NextResponse.json(
			{
				code: "CONTRACT_CLOSED",
				message: "This contract is no longer open for bids",
			},
			{ status: 403 }
		);
	}

	// Update the bid details
	bid.amount = amount;
	bid.terms = terms;
	bid.deliveryDate = deliveryDate;

	await bid.save();

	return NextResponse.json({ message: "Bid updated successfully", bid });
}

export async function GET(
	req: NextRequest,
	{ params }: { params: { bidId: string } }
) {
	const { bidId } = params;

	if (!mongoose.Types.ObjectId.isValid(bidId)) {
		return NextResponse.json(
			{ code: "INVALID_ID", message: "Invalid bid ID" },
			{ status: 400 }
		);
	}

	const bid = await Bid.findById(bidId);
	if (!bid) {
		return NextResponse.json(
			{ code: "BID_NOT_FOUND", message: "Bid not found" },
			{ status: 404 }
		);
	}

	return NextResponse.json(bid);
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: { bidId: string } }
) {
	const { bidId } = params;
	const userId = req.headers.get("user-id");

	if (!mongoose.Types.ObjectId.isValid(bidId)) {
		return NextResponse.json(
			{ code: "INVALID_ID", message: "Invalid bid ID" },
			{ status: 400 }
		);
	}

	const bid = await Bid.findById(bidId);
	if (!bid) {
		return NextResponse.json(
			{ code: "BID_NOT_FOUND", message: "Bid not found" },
			{ status: 404 }
		);
	}

	// Ensure that only the user who created the bid can delete it
	if (bid.userId.toString() !== userId) {
		return NextResponse.json(
			{ code: "FORBIDDEN", message: "You can only delete your own bid" },
			{ status: 403 }
		);
	}

	// Delete the bid
	await bid.deleteOne();

	return NextResponse.json({ message: "Bid deleted successfully" });
}
