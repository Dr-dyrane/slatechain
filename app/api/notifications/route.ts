// app/api/notifications/route.ts

import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { withRateLimit } from "@/lib/utils";
import { connectToDatabase } from "..";
import Notification from "../models/Notification";




export async function GET(req: Request) {
	// Rate limit: 30 requests per minute for admin listing
	const { headers, limited } = await withRateLimit(
		req,
		"list_notifications",
		30
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

		//Get the Id
		const userId = decoded.userId;

		// Get query parameters for pagination
		const url = new URL(req.url);
		const page = Number.parseInt(url.searchParams.get("page") || "1");
		const limit = Number.parseInt(url.searchParams.get("limit") || "10");

		// Calculate skip value
		const skip = (page - 1) * limit;

		// Get submissions with pagination
		const [notifications, total] = await Promise.all([
			Notification.find({ userId: userId })
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.populate("userId", "firstName lastName email"),
			Notification.countDocuments({ userId: userId }),
		]);

		//Make sure the return value is of the proper type.
		return NextResponse.json(
			{
				notifications,
				pagination: {
					total,
					page,
					limit,
					pages: Math.ceil(total / limit),
				},
			},
			{ headers }
		);
	} catch (error) {
		console.error("List KYC Submissions Error:", error);
		return NextResponse.json(
			{
				code: "SERVER_ERROR",
				message: "Failed to list KYC submissions",
			},
			{ status: 500, headers }
		);
	}
}
