// app/api/kyc/start/route.ts

import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "../../index";
import { withRateLimit } from "@/lib/utils";
import User from "../../models/User";
import { KYCStatus } from "@/lib/types";
import mongoose from "mongoose";

export async function POST(req: Request) {
	// Rate limit: 3 starts per hour
	const { headers, limited } = await withRateLimit(
		req,
		"kyc_start",
		3,
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

	try {
		await connectToDatabase();

		// Verify authentication token
		const authorization = req.headers.get("Authorization");
		if (!authorization?.startsWith("Bearer ")) {
			return NextResponse.json(
				{
					code: "NO_TOKEN",
					message: "Authentication required",
				},
				{ status: 401, headers }
			);
		}

		const token = authorization.split(" ")[1];
		const decoded = verifyAccessToken(token);

		if (!decoded) {
			return NextResponse.json(
				{
					code: "INVALID_TOKEN",
					message: "Invalid or expired token",
				},
				{ status: 401, headers }
			);
		}

		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			// Get user and update KYC status
			const user = await User.findById(decoded.userId).session(session);
			if (!user) {
				return NextResponse.json(
					{
						code: "USER_NOT_FOUND",
						message: "User not found",
					},
					{ status: 404, headers }
				);
			}

			// Check if KYC is already in progress or completed
			if (user.kycStatus !== KYCStatus.NOT_STARTED) {
				return NextResponse.json(
					{
						code: "INVALID_STATUS",
						message: "KYC process has already been started",
					},
					{ status: 400, headers }
				);
			}

			// Update user KYC status
			user.kycStatus = KYCStatus.IN_PROGRESS;
			await user.save({ session });

			await session.commitTransaction();

			return NextResponse.json(user.kycStatus, { headers });
		} catch (error) {
			await session.abortTransaction();
			throw error;
		} finally {
			session.endSession();
		}
	} catch (error) {
		console.error("Start KYC Error:", error);
		return NextResponse.json(
			{
				code: "SERVER_ERROR",
				message: "Failed to start KYC process",
			},
			{ status: 500, headers }
		);
	}
}
