// app/api/onboarding/progress/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../index";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { withRateLimit } from "@/lib/utils";
import Onboarding from "../../models/Onboarding";
import User from "../../models/User";
import { OnboardingStatus } from "@/lib/types";
import { MAX_STEPS } from "@/lib/constants/onboarding-steps";

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

		// First check if user exists
		const user = await User.findById(decoded.userId);
		if (!user) {
			return NextResponse.json(
				{
					code: "USER_NOT_FOUND",
					message: "User not found",
				},
				{ status: 404, headers }
			);
		}

		// Find or create onboarding progress
		let onboarding = await Onboarding.findOne({ userId: decoded.userId });

		// If no onboarding record exists, create one
		if (!onboarding) {
			onboarding = await Onboarding.create({
				userId: decoded.userId,
				status: OnboardingStatus.NOT_STARTED,
				currentStep: 0,
				steps: [],
			});
		}

		// Ensure current step doesn't exceed maximum
		if (onboarding.currentStep >= MAX_STEPS) {
			onboarding.currentStep = MAX_STEPS - 1;
			await onboarding.save();
		}

		 // Filter completed steps to ensure they don't exceed maximum
		 const completedSteps = onboarding.steps
		 .filter((step: any) => step.status === "COMPLETED" && step.stepId < MAX_STEPS)
		 .map((step: any) => step.stepId)
   
	   // Filter steps array to remove any steps beyond the maximum
	   const validSteps = onboarding.steps.filter((step: any) => step.stepId < MAX_STEPS)

		return NextResponse.json(
			{
				code: "SUCCESS",
				data: {
					status: onboarding.status,
					currentStep: onboarding.currentStep,
					completedSteps: onboarding.steps
						.filter((step: any) => step.status === "COMPLETED")
						.map((step: any) => step.stepId),
					steps: onboarding.steps,
					completed: onboarding.status === OnboardingStatus.COMPLETED,
					roleSpecificData: onboarding.roleSpecificData || {},
				},
			},
			{ headers }
		);
	} catch (error) {
		console.error("Fetch Onboarding Progress Error:", error);
		return NextResponse.json(
			{
				code: "SERVER_ERROR",
				message: "Failed to fetch onboarding progress",
			},
			{ status: 500, headers }
		);
	}
}
