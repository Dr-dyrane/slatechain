// api/onboarding/start/route.ts

import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { OnboardingStatus, OnboardingStepStatus } from "@/lib/types";
import { STEP_DETAILS } from "@/lib/constants/onboarding-steps";
import mongoose from "mongoose";
import { connectToDatabase } from "../..";
import User from "../../models/User";
import Onboarding from "../../models/Onboarding";
import { withRateLimit } from "@/lib/utils";

export async function POST(req: Request) {
	// Use POST for creating a resource
	// Apply rate limiting to prevent abuse
	const { headers, limited } = await withRateLimit(
		req,
		"onboarding_update",
		10
	);

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
			// Find user
			let user = await User.findById(decoded.userId).session(session);
			if (!user) {
				return NextResponse.json(
                    {
                        code: "USER_NOT_FOUND",
                        message: "User not found",
                    },
					{ status: 404, headers }
				);
			}

			// Find onboarding record
			let onboarding = await Onboarding.findOne({
				userId: decoded.userId,
			}).session(session);

			// If onboarding exists, don't reset if it's already in progress or completed
			if (onboarding) {
				if (onboarding.status === OnboardingStatus.COMPLETED) {
					return NextResponse.json(
						{
							code: "ONBOARDING_COMPLETED",
							message: "Onboarding is already completed",
						},
						{ status: 400, headers }
					);
				}

				onboarding.status = OnboardingStatus.IN_PROGRESS;
			} else {
				// Create new onboarding record
				onboarding = new Onboarding({
					userId: decoded.userId,
					steps: Object.values(STEP_DETAILS).map((step, index) => ({
						stepId: index,
						title: step.title,
						status: OnboardingStepStatus.IN_PROGRESS, // Start fresh
						data: {},
					})),
					currentStep: 0,
					status: OnboardingStatus.IN_PROGRESS,
					roleSpecificData: {},
				});
			}

			// Set user onboarding status
			user.onboardingStatus = OnboardingStatus.IN_PROGRESS;

			// Save user and onboarding data
			await user.save({ session });
			await onboarding.save({ session });

			// Commit transaction
			await session.commitTransaction();

			return NextResponse.json(
				{ code: "SUCCESS", data: onboarding },
				{ status: 201, headers }
			);
		} catch (error) {
			await session.abortTransaction();
			throw error;
		} finally {
			session.endSession();
		}
	} catch (error) {
		console.error("Start Onboarding Error:", error);
		return NextResponse.json(
			{
				code: "SERVER_ERROR",
				message:
					error instanceof Error ? error.message : "Failed to start onboarding",
			},
			{ status: 500, headers }
		);
	}
}
