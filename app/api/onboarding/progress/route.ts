// app/api/onboarding/progress/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../index";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { withRateLimit } from "@/lib/utils";
import Onboarding from "../../models/Onboarding";

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

		return NextResponse.json(
			{
				code: "SUCCESS",
				data: {
					currentStep: onboarding.currentStep,
					completedSteps: onboarding.steps
						.filter((step: any) => step.status === "COMPLETED")
						.map((step: any) => step.stepId),
					completed: onboarding.status === "COMPLETED",
					roleSpecificData: onboarding.roleSpecificData,
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
