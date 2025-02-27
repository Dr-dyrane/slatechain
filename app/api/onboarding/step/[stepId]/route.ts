// app/api/onboarding/step/[stepId]/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../index";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { withRateLimit } from "@/lib/utils";
import Onboarding from "../../../models/Onboarding";
import { OnboardingStep, OnboardingStepStatus } from "@/lib/types";

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

		const { status, data } = await req.json();
		const stepId = Number.parseInt(params.stepId);

		if (!Object.values(OnboardingStepStatus).includes(status)) {
			return NextResponse.json(
				{
					code: "INVALID_STATUS",
					message: "Invalid step status",
				},
				{ status: 400, headers }
			);
		}

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

		// Update step
		const stepIndex = onboarding.steps.findIndex(
			(step: any) => step.stepId === stepId
		);
		if (stepIndex === -1) {
			onboarding.steps.push({
				stepId,
				status,
				data,
				completedAt:
					status === OnboardingStepStatus.COMPLETED ? new Date() : undefined,
			});
		} else {
			onboarding.steps[stepIndex] = {
				...onboarding.steps[stepIndex],
				status,
				data: { ...onboarding.steps[stepIndex].data, ...data },
				completedAt:
					status === OnboardingStepStatus.COMPLETED ? new Date() : undefined,
			};
		}

		// Update current step if completing current
		if (
			status === OnboardingStepStatus.COMPLETED &&
			onboarding.currentStep === stepId
		) {
			onboarding.currentStep = stepId + 1;
		}

		// Save role-specific data
		if (data) {
			onboarding.roleSpecificData = { ...onboarding.roleSpecificData, ...data };
		}

		await onboarding.save();

		return NextResponse.json(
			{
				code: "SUCCESS",
				data: {
					id: stepId,
					status,
					data: onboarding.steps[stepIndex]?.data || data,
				},
			},
			{ headers }
		);
	} catch (error) {
		console.error("Update Onboarding Step Error:", error);
		return NextResponse.json(
			{
				code: "SERVER_ERROR",
				message: "Failed to update onboarding step",
			},
			{ status: 500, headers }
		);
	}
}
