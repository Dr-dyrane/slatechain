// app/api/contracts/bid/[bidId]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Bid from "../../../models/Bid";
import User from "../../../models/User";
import { UserRole } from "@/lib/types";
import Contract from "../../../models/Contract";
import { handleRequest } from "@/app/api";

// Define rate limits
const UPDATE_BID_RATE_LIMIT = 10;
const GET_BID_RATE_LIMIT = 30;
const DELETE_BID_RATE_LIMIT = 10;

export async function PUT(
	req: NextRequest,
	{ params }: { params: { bidId: string } }
) {
	return handleRequest(
		req,
		async (req, userId) => {
			const { bidId } = params;
			const {
				amount,
				terms,
				deliveryDate,
				title,
				description,
				durationInDays,
				validUntil,
				notes,
				tags,
			} = await req.json();

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
			if (bid.supplierId.toString() !== userId) {
				return NextResponse.json(
					{ code: "FORBIDDEN", message: "You can only update your own bid" },
					{ status: 403 }
				);
			}

			// Check if the associated contract is still open
			const contract = await Contract.findById(bid.linkedContractId);
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
			if (amount !== undefined) bid.proposedAmount = amount;
			if (title !== undefined) bid.title = title;
			if (description !== undefined) bid.description = description;
			if (durationInDays !== undefined) bid.durationInDays = durationInDays;
			if (validUntil !== undefined) bid.validUntil = new Date(validUntil);
			if (notes !== undefined) bid.notes = notes;
			if (tags !== undefined) bid.tags = tags;

			// Save terms in the description if provided
			if (terms !== undefined && !description) {
				bid.description = terms;
			}

			try {
				await bid.save();
				return NextResponse.json({ message: "Bid updated successfully", bid });
			} catch (error: any) {
				return NextResponse.json(
					{
						code: "BID_UPDATE_ERROR",
						message: `Failed to update bid: ${error.message}`,
					},
					{ status: 400 }
				);
			}
		},
		"update_bid",
		UPDATE_BID_RATE_LIMIT
	);
}

export async function GET(
	req: NextRequest,
	{ params }: { params: { bidId: string } }
) {
	return handleRequest(
		req,
		async (req, userId) => {
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

			// Get the user to check their role
			const user = await User.findById(userId);
			if (!user) {
				return NextResponse.json(
					{ code: "UNAUTHORIZED", message: "User not found" },
					{ status: 404 }
				);
			}

			// Check if user has permission to view this bid
			if (
				user.role !== UserRole.ADMIN &&
				user.role !== UserRole.MANAGER &&
				bid.supplierId.toString() !== userId
			) {
				return NextResponse.json(
					{
						code: "FORBIDDEN",
						message: "You don't have permission to view this bid",
					},
					{ status: 403 }
				);
			}

			return NextResponse.json(bid);
		},
		"get_bid",
		GET_BID_RATE_LIMIT
	);
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: { bidId: string } }
) {
	return handleRequest(
		req,
		async (req, userId) => {
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

			// Ensure that only the user who created the bid can delete it
			if (bid.supplierId.toString() !== userId) {
				return NextResponse.json(
					{ code: "FORBIDDEN", message: "You can only delete your own bid" },
					{ status: 403 }
				);
			}

			// Delete the bid
			await bid.deleteOne();

			return NextResponse.json({ message: "Bid deleted successfully" });
		},
		"delete_bid",
		DELETE_BID_RATE_LIMIT
	);
}
