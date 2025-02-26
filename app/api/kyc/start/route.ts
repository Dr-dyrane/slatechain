// app/api/kyc/start/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../index";
import User from "../../models/User";
import { KYCStatus } from "@/lib/types";
import { withAuth } from "@/lib/auth/withAuth";

export async function POST(req: Request) {
	// Rate limit: 5 attempts per hour per user
	const { userId, headers, limited } = await withAuth(
		req,
		"kyc_start",
		5,
		60 * 60 * 1000
	);

	if (limited) {
		return NextResponse.json(
			{
				code: "RATE_LIMIT",
				message: "Too many attempts. Please try again later.",
			},
			{ status: 429, headers }
		);
	}

	if (!userId) {
		return NextResponse.json(
			{
				code: "UNAUTHORIZED",
				message: "Authentication required",
			},
			{ status: 401, headers }
		);
	}

	try {
		await connectToDatabase();

		// Find user and update KYC status
		const user = await User.findById(userId);
		if (!user) {
			return NextResponse.json(
				{
					code: "USER_NOT_FOUND",
					message: "User not found",
				},
				{ status: 404, headers }
			);
		}

		// Only update if not already in progress or completed
		if (user.kycStatus === KYCStatus.NOT_STARTED) {
			user.kycStatus = KYCStatus.IN_PROGRESS;
			await user.save();
		}

		return NextResponse.json(user.kycStatus, { headers });
	} catch (error: any) {
		console.error("KYC Start Error:", error);
		return NextResponse.json(
			{
				code: "SERVER_ERROR",
				message: "An unexpected error occurred. Please try again later.",
			},
			{ status: 500, headers }
		);
	}
}
