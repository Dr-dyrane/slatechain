// app/api/onboarding/progress/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../index";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { withRateLimit } from "@/lib/utils";
import Onboarding, { OnboardingStepSchemaType } from "../../models/Onboarding";
import User from "../../models/User";
import { OnboardingStatus, OnboardingStepStatus, UserRole } from "@/lib/types";
import mongoose from "mongoose";
import { STEP_DETAILS } from "@/lib/constants/onboarding-steps";

interface OnboardingStep {
	stepId: number;
	title: string;
	status: OnboardingStepStatus;
}

// Define the default onboarding steps for each role
function getDefaultSteps(role: UserRole): OnboardingStep[] {
	return Object.entries(STEP_DETAILS).map(([id, details]) => ({
		stepId: Number.parseInt(id),
		title: details.title,
		status: OnboardingStepStatus.NOT_STARTED,
	}));
}

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
				{ code: "NO_TOKEN", message: "Authentication required" },
				{ status: 401, headers }
			);
		}

		const token = authorization.split(" ")[1];
		const decoded = verifyAccessToken(token);

		if (!decoded) {
			return NextResponse.json(
				{ code: "INVALID_TOKEN", message: "Invalid or expired token" },
				{ status: 401, headers }
			);
		}

		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			const user = await User.findById(decoded.userId).session(session);
			if (!user) {
				await session.abortTransaction();
				return NextResponse.json(
					{ code: "USER_NOT_FOUND", message: "User not found" },
					{ status: 404, headers }
				);
			}

			let onboarding = await Onboarding.findOne({
				userId: decoded.userId,
			}).session(session);

			if (!onboarding) {
				const defaultSteps = getDefaultSteps(user.role);
				onboarding = new Onboarding({
					userId: decoded.userId,
					steps: defaultSteps,
					currentStep: 0,
					status: OnboardingStatus.NOT_STARTED,
					roleSpecificData: {},
				});

				user.onboardingStatus = OnboardingStatus.NOT_STARTED;
				await Promise.all([
					user.save({ session }),
					onboarding.save({ session }),
				]);
			}

			const completedSteps = onboarding.steps
				.filter(
					(step: OnboardingStepSchemaType) =>
						step.status === OnboardingStepStatus.COMPLETED
				)
				.map((step: OnboardingStepSchemaType) => step.stepId);

			await session.commitTransaction();

			return NextResponse.json(
				{
					code: "SUCCESS",
					data: {
						status: onboarding.status,
						currentStep: onboarding.currentStep,
						completedSteps,
						steps: onboarding.steps,
						completed: onboarding.status === OnboardingStatus.COMPLETED,
						roleSpecificData: onboarding.roleSpecificData || {},
					},
				},
				{ headers }
			);
		} catch (error) {
			await session.abortTransaction();
			throw error;
		} finally {
			session.endSession();
		}
	} catch (error) {
		console.error("Fetch Onboarding Progress Error:", error);
		return NextResponse.json(
			{
				code: "SERVER_ERROR",
				message:
					error instanceof Error
						? error.message
						: "Failed to fetch onboarding progress",
			},
			{ status: 500, headers }
		);
	}
}
