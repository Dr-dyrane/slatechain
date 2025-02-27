// app/api/onboarding/complete/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../index";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { withRateLimit } from "@/lib/utils";
import Onboarding from "../../models/Onboarding";
import { OnboardingStatus } from "@/lib/types";
import mongoose from "mongoose";
import User from "../../models/User";

export async function GET(req: Request) {
	const { headers, limited } = await withRateLimit(
		req,
		"onboarding_progress",
		20
	);

	if (limited) {
		return NextResponse.json(
			{
				code: "RATE_LIMIT",
				message: "Too many requests. Please try again later.",
			},
			{ status: 429, headers }
		);
	}

	try {
		await connectToDatabase();

		const authorization = req.headers.get("Authorization");
		if (!authorization || !authorization.startsWith("Bearer ")) {
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

		// Use a session to ensure atomic updates
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			// Check if user exists
			const user = await User.findById(decoded.userId).session(session);
			if (!user) {
				await session.abortTransaction();
				return NextResponse.json(
					{
						code: "USER_NOT_FOUND",
						message: "User not found",
					},
					{ status: 404, headers }
				);
			}

			// Find onboarding record
			const onboarding = await Onboarding.findOne({
				userId: decoded.userId,
			}).session(session);
			if (!onboarding) {
				await session.abortTransaction();
				return NextResponse.json(
					{
						code: "NOT_FOUND",
						message: "Onboarding progress not found",
					},
					{ status: 404, headers }
				);
			}

			// If already completed, return success
			if (onboarding.status === OnboardingStatus.COMPLETED) {
				await session.abortTransaction();
				return NextResponse.json(
					{
						code: "SUCCESS",
						data: {
							success: true,
							completedAt: onboarding.completedAt,
						},
					},
					{ headers }
				);
			}

			// Update onboarding status
			onboarding.status = OnboardingStatus.COMPLETED;
			onboarding.completedAt = new Date();

			// Save onboarding changes - this will trigger the post-save hook to sync with user
			await onboarding.save({ session });

			// Commit the transaction
			await session.commitTransaction();

			return NextResponse.json(
				{
					code: "SUCCESS",
					data: {
						success: true,
						completedAt: onboarding.completedAt,
					},
				},
				{ headers }
			);
		} catch (error) {
			// If anything fails, abort the transaction
			await session.abortTransaction();
			throw error;
		} finally {
			// End the session
			session.endSession();
		}
	} catch (error) {
		console.error("Complete Onboarding Error:", error);
		return NextResponse.json(
			{
				code: "SERVER_ERROR",
				message: "Failed to complete onboarding",
			},
			{ status: 500, headers }
		);
	}
}
