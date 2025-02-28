// app/api/onboarding/progress/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../index";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { withRateLimit } from "@/lib/utils";
import Onboarding, { OnboardingStepSchemaType } from "../../models/Onboarding";
import User from "../../models/User";
import { OnboardingStatus, OnboardingStepStatus, UserRole } from "@/lib/types";
import { MAX_STEPS, STEP_DETAILS } from "@/lib/constants/onboarding-steps";
import errorMap from "zod/locales/en.js";

interface OnboardingStep {
	stepId: number;
	title: string;
	status: OnboardingStepStatus;
}

// Helper function to get default steps based on user role
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

		const user = await User.findById(decoded.userId);
		if (!user) {
			return NextResponse.json(
				{ code: "USER_NOT_FOUND", message: "User not found" },
				{ status: 404, headers }
			);
		}

		let onboarding = await Onboarding.findOne({ userId: decoded.userId });

		if (!onboarding) {
			const defaultSteps = getDefaultSteps(user.role);
			onboarding = await Onboarding.create({
				userId: decoded.userId,
				status: OnboardingStatus.NOT_STARTED,
				currentStep: 0,
				steps: defaultSteps,
				roleSpecificData: {}, // Initialize roleSpecificData
			});
		}

		// Validate and Correct Onboarding Data

		onboarding.currentStep = Math.min(onboarding.currentStep, MAX_STEPS - 1); // Ensure currentStep is within bounds
		onboarding.steps = onboarding.steps.filter(
			(step: any) => step.stepId < MAX_STEPS
		);

		for (const step of onboarding.steps) {
			if (
				step.status === OnboardingStepStatus.COMPLETED &&
				step.stepId >= onboarding.currentStep
			) {
				// If a step beyond the current step is marked as completed, reset its status
				step.status = OnboardingStepStatus.NOT_STARTED;
			}
		}

		await onboarding.save();

		onboarding.steps = onboarding.steps.filter(
			(step: OnboardingStepSchemaType) => step.stepId < MAX_STEPS
		);

		const completedSteps = onboarding.steps
			.filter(
				(step: OnboardingStepSchemaType) =>
					step.status === OnboardingStepStatus.COMPLETED
			)
			.map((step: OnboardingStepSchemaType) => step.stepId);

		return NextResponse.json(
			{
				code: "SUCCESS",
				data: {
					status: onboarding.status,
					currentStep: onboarding.currentStep,
					completedSteps: completedSteps,
					steps: onboarding.steps,
					completed: onboarding.status === OnboardingStatus.COMPLETED,
					roleSpecificData: onboarding.roleSpecificData || {}, // Include roleSpecificData
				},
			},
			{ headers }
		);
	} catch (error) {
		console.error("Fetch Onboarding Progress Error:", error);
		return NextResponse.json(
			{ code: "SERVER_ERROR", 
				message: error instanceof Error ? error.message : "Failed to fetch onboarding progress" 
			},
			{ status: 500, headers }
		);
	}
}
