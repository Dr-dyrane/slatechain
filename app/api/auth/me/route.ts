// api/auth/me/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../index";
import User from "@/app/api/models/User";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { withRateLimit } from "@/lib/utils";

export async function GET(req: Request) {
	// Rate limit: 100 requests per minute per token
	// Higher limit since this is used frequently for session validation
	const { headers, limited } = await withRateLimit(req, "me", 100);

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

		// Get the Authorization header directly from the request
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

		// Extract and verify the token
		const token = authorization.split(" ")[1];
		const decoded = verifyAccessToken(token);

		if (!decoded) {
			return NextResponse.json(
				{
					code: "INVALID_TOKEN",
					message: "Your session has expired, please log in again",
				},
				{ status: 401, headers }
			);
		}

		// Find the user
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

		// Return user data
		return NextResponse.json(
			{
				code: "SUCCESS",
				user: user.toAuthJSON(),
				accessToken: token,
			},
			{ headers }
		);
	} catch (error: any) {
		console.error("Get User Data Error:", error);
		return NextResponse.json(
			{
				message:
					error.message ||
					"An unexpected error occurred. Please try again later.",
			},
			{ status: 500, headers }
		);
	}
}
