// app/api/onboarding/step/[stepId]/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../index";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { withRateLimit } from "@/lib/utils";
import Onboarding, {
	OnboardingStepSchemaType,
} from "../../../models/Onboarding";
import User from "../../../models/User";
import { OnboardingStatus, OnboardingStepStatus } from "@/lib/types";
import { MAX_STEPS, STEP_DETAILS } from "@/lib/constants/onboarding-steps";
import mongoose from "mongoose";

export async function PUT(
	req: Request,
	{ params }: { params: { stepId: string } }
) {
	// Apply rate limiting to prevent abuse
	const { headers, limited } = await withRateLimit(
		req,
		"onboarding_update",
		10
	);

	if (limited) {
		return NextResponse.json(
			{
				code: "RATE_LIMIT",
				message: "Too many update attempts. Please try again later.",
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

		// Check if user exists
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

		const { status, data } = await req.json();
		const stepId = Number.parseInt(params.stepId);

		// Validate step ID
		if (stepId < 0 || stepId >= MAX_STEPS || !STEP_DETAILS[stepId]) {
			return NextResponse.json(
				{
					code: "INVALID_STEP",
					message: "Invalid step ID",
				},
				{ status: 400, headers }
			);
		}

		// Validate step status
		if (!Object.values(OnboardingStepStatus).includes(status)) {
			return NextResponse.json(
				{
					code: "INVALID_STATUS",
					message: "Invalid step status",
				},
				{ status: 400, headers }
			);
		}

		// Use a session to ensure atomic updates
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			let onboarding = await Onboarding.findOne({
				userId: decoded.userId,
			}).session(session);

			// Initialize onboarding process if not started
			if (!onboarding) {
				if (stepId !== 0) {
					return NextResponse.json(
						{
							code: "ONBOARDING_NOT_STARTED",
							message: "Please start onboarding at step 0.",
						},
						{ status: 400, headers }
					);
				}

				onboarding = new Onboarding({
					userId: decoded.userId,
					steps: Object.values(STEP_DETAILS).map((step, index) => ({
						stepId: index,
						title: step.title,
						status: OnboardingStepStatus.NOT_STARTED,
						data: {},
					})),
					currentStep: 1,
					status: OnboardingStatus.IN_PROGRESS,
				});

				// Update user's onboarding status
				user.onboardingStatus = OnboardingStatus.IN_PROGRESS;
				await user.save({ session });
				await onboarding.save({ session });

				// Mark initial step as completed
				onboarding.steps[0].status = OnboardingStepStatus.COMPLETED;
				onboarding.currentStep = 1;
				await onboarding.save({ session });
			}

			// Prevent updates if onboarding is complete
			if (onboarding.status === OnboardingStatus.COMPLETED) {
				return NextResponse.json(
					{
						code: "ONBOARDING_COMPLETE",
						message: "Onboarding already completed.",
					},
					{ status: 400, headers }
				);
			}

			// Find step index
			const stepIndex = onboarding.steps.findIndex(
				(step: OnboardingStepSchemaType) => step.stepId === stepId
			);

			if (stepIndex === -1) {
				return NextResponse.json(
					{ code: "INVALID_STEP", message: "Step not found" },
					{ status: 400, headers }
				);
			}

			onboarding.steps[stepIndex].status = status;
			if (data) {
				onboarding.steps[stepIndex].data = {
					...onboarding.steps[stepIndex].data,
					...data,
				};
			}

			// Mark step as completed and move to next step
			if (status === OnboardingStepStatus.COMPLETED) {
				onboarding.steps[stepIndex].completedAt = new Date();
				if (onboarding.currentStep === stepId && stepId < MAX_STEPS - 1) {
					onboarding.currentStep = stepId + 1;
				}
			}

			// Skip step and move to next step
			if (data?.roleSpecificData) {
				onboarding.roleSpecificData = {
					...onboarding.roleSpecificData,
					...data.roleSpecificData,
				};
			}

			// Save onboarding progress
			await onboarding.save({ session });
			// Commit transaction
			await session.commitTransaction();

			return NextResponse.json(
				{
					code: "SUCCESS",
					data: {
						id: stepId,
						status,
						data: onboarding.steps[stepIndex].data,
						currentStep: onboarding.currentStep,
					},
				},
				{ headers }
			);
		} catch (error) {
			// Rollback transaction on error
			await session.abortTransaction();
			throw error;
		} finally {
			// End session
			session.endSession();
		}
	} catch (error) {
		console.error("Update Onboarding Step Error:", error);
		return NextResponse.json(
			{
				code: "SERVER_ERROR",
				message:
					error instanceof Error
						? error.message
						: "Failed to update onboarding step",
			},
			{ status: 500, headers }
		);
	}
}
