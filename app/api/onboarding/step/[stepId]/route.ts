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
			// Find onboarding record
			const onboarding = await Onboarding.findOne({ userId: decoded.userId });
			if (!onboarding) {
				return NextResponse.json(
					{
						code: "NOT_FOUND",
						message: "Onboarding progress not found",
					},
					{ status: 404, headers }
				);
			}

			// If onboarding is already completed, don't allow updates
			if (onboarding.status === OnboardingStatus.COMPLETED) {
				return NextResponse.json(
					{
						code: "ONBOARDING_COMPLETE",
						message: "Onboarding is already completed",
					},
					{ status: 400, headers }
				);
			}

			// Update onboarding status to IN_PROGRESS if it's NOT_STARTED
			if (onboarding.status === OnboardingStatus.NOT_STARTED) {
				onboarding.status = OnboardingStatus.IN_PROGRESS;
			}

			// Update step
			const stepIndex = onboarding.steps.findIndex(
				(step: OnboardingStepSchemaType) => step.stepId === stepId
			);

			if (stepIndex === -1) {
				return NextResponse.json(
					{
						code: "INVALID_STEP",
						message: "Step not found",
					},
					{ status: 400, headers }
				);
			}

			// Validate step data if provided
			if (data && !onboarding.validateStepData(stepId, data, user.role)) {
				return NextResponse.json(
					{
						code: "INVALID_DATA",
						message: "Invalid step data",
					},
					{ status: 400, headers }
				);
			}

			// Update step status (using type assertion for safety)
			(onboarding.steps[stepIndex] as OnboardingStepSchemaType).status = status; // Type assertion

			// Update step data if provided
			if (data) {
				(onboarding.steps[stepIndex] as OnboardingStepSchemaType).data = {
					// Type assertion
					...onboarding.steps[stepIndex].data,
					...data,
				};
			}

			// Update timestamps based on status
			if (status === OnboardingStepStatus.COMPLETED) {
				(onboarding.steps[stepIndex] as OnboardingStepSchemaType).completedAt =
					new Date(); // Type assertion

				// Update current step if completing current
				if (onboarding.currentStep === stepId && stepId < MAX_STEPS - 1) {
					onboarding.currentStep = stepId + 1;
				}
			}

			// Save role-specific data
			if (data && data.roleSpecificData) {
				onboarding.roleSpecificData = {
					...onboarding.roleSpecificData,
					...data.roleSpecificData,
				};
			}

			// Save onboarding changes - this will trigger the post-save hook to sync with user
			await onboarding.save({ session });

			// Commit the transaction
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
			// If anything fails, abort the transaction
			await session.abortTransaction();
			throw error;
		} finally {
			// End the session
			session.endSession();
		}
	} catch (error) {
		console.error("Update Onboarding Step Error:", error);
		return NextResponse.json(
			{
				code: "SERVER_ERROR",
				message: error instanceof Error ? error.message : "Failed to update onboarding step",
			},
			{ status: 500, headers }
		);
	}
}
