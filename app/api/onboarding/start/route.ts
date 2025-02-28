import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";

import { OnboardingStatus, OnboardingStepStatus } from "@/lib/types";
import { STEP_DETAILS } from "@/lib/constants/onboarding-steps"; // Import your step details
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
			let user = await User.findById(decoded.userId).session(session);
			if (!user) {
				return NextResponse.json(
					{
						/* user not found error ...*/
					},
					{ status: 404 }
				);
			}

			let onboarding = await Onboarding.findOne({
				userId: decoded.userId,
			}).session(session);

			if (onboarding) {
				//If onboarding already exists for the user:
				// You can either reset it or return an error, depending on your requirements:
				// Option 1: Reset onboarding (recommended)
				onboarding.steps = Object.values(STEP_DETAILS).map((step, index) => ({
					stepId: index,
					title: step.title,
					status: OnboardingStepStatus.NOT_STARTED,
					data: {},
				}));
				onboarding.currentStep = 0;
				onboarding.status = OnboardingStatus.NOT_STARTED;
				// Option 2: Return an error because onboarding is already initialized
				// return NextResponse.json({ code: "ONBOARDING_ALREADY_STARTED", message: "Onboarding has already been started for this user." }, { status: 400 });
			} else {
				// Create new onboarding document

				onboarding = new Onboarding({
					userId: decoded.userId,
					steps: Object.values(STEP_DETAILS).map((step, index) => ({
						// ... your steps map
					})),
					currentStep: 0, // Start at 0
					status: OnboardingStatus.NOT_STARTED,
					roleSpecificData: {},
				});
			}

			user.onboardingStatus = OnboardingStatus.NOT_STARTED; // Set user's onboarding status here
			await user.save({ session });

			await onboarding.save({ session });

			await session.commitTransaction();
			return NextResponse.json(
				{ code: "SUCCESS", data: onboarding },
				{ status: 201 }
			); // 201 Created
		} catch (error) {
			// Rollback transaction on error
			await session.abortTransaction();
			throw error;
		} finally {
			// End session
			session.endSession();
		}
	} catch (error) {
		console.error("Start Onboarding:", error);
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
