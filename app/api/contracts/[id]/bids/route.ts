// app/api/contracts/[id]/bids/route.ts

import { type NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Contract from "../../../models/Contract";
import Bid from "../../../models/Bid";
import User from "../../../models/User";
import { UserRole } from "@/lib/types";
import { handleRequest } from "@/app/api";
import { generateReferenceNumber } from "@/lib/utils";

// Define rate limits
const CREATE_BID_RATE_LIMIT = 10;
const LIST_BIDS_RATE_LIMIT = 30;

export async function POST(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	return handleRequest(
		req,
		async (req, userId) => {
			const { id } = params;
			const {
				proposedAmount,
				terms,
				deliveryDate,
				title,
				description,
				durationInDays,
				validUntil: validUntilInput,
				notes,
				tags,
			} = await req.json();

			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid contract ID" },
					{ status: 400 }
				);
			}

			// Validate the contract exists
			const contract = await Contract.findById(id);
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

			// Generate a reference number for the bid
			const referenceNumber = generateReferenceNumber("BID");

			// Set submission date to current date
			const submissionDate = new Date();

			// Set valid until date (default to 30 days from now if not provided)
			const validUntil = validUntilInput
				? new Date(validUntilInput)
				: new Date(submissionDate.getTime() + 30 * 24 * 60 * 60 * 1000);

			// Create the bid with all required fields
			const bid = new Bid({
				title: title || `Bid for ${contract.title}`,
				referenceNumber,
				description: description || terms || "",
				status: "submitted", // Use a valid enum value
				submissionDate,
				validUntil,
				proposedAmount,
				durationInDays: durationInDays || 30, // Default to 30 days if not provided
				supplierId: userId,
				notes: notes || "",
				tags: tags || [],
				linkedContractId: id,
				createdBy: userId,
			});

			try {
				await bid.save();
				return NextResponse.json({
					message: "Bid created successfully",
					bid,
				});
			} catch (error: any) {
				console.error("Bid creation error:", error);
				return NextResponse.json(
					{
						code: "BID_CREATION_ERROR",
						message: `Failed to create bid: ${error.message}`,
					},
					{ status: 400 }
				);
			}
		},
		"create_bid",
		CREATE_BID_RATE_LIMIT
	);
}

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	return handleRequest(
		req,
		async (req, userId) => {
			const { id } = params;

			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid contract ID" },
					{ status: 400 }
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

			// Find the contract to check permissions
			const contract = await Contract.findById(id);
			if (!contract) {
				return NextResponse.json(
					{ code: "CONTRACT_NOT_FOUND", message: "Contract not found" },
					{ status: 404 }
				);
			}

			// Determine which bids the user can see based on their role
			let bidsQuery: Record<string, any> = { linkedContractId: id };

			// If user is a supplier, they can only see their own bids
			if (user.role === UserRole.SUPPLIER) {
				bidsQuery.supplierId = userId;
			}

			// Admins and managers can see all bids for the contract
			const bids = await Bid.find(bidsQuery);

			return NextResponse.json(bids);
		},
		"list_bids",
		LIST_BIDS_RATE_LIMIT
	);
}
