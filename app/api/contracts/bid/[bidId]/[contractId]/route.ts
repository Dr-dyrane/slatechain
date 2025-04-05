// app/api/contracts/bid/[contractId]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Bid from "../../../../models/Bid";

export async function GET(
	req: NextRequest,
	{ params }: { params: { contractId: string } }
) {
	const { contractId } = params;

	if (!mongoose.Types.ObjectId.isValid(contractId)) {
		return NextResponse.json(
			{ code: "INVALID_ID", message: "Invalid contract ID" },
			{ status: 400 }
		);
	}

	const bids = await Bid.find({ contractId });

	return NextResponse.json(bids);
}
