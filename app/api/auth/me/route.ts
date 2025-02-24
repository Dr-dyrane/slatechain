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
			{ error: "Too many requests. Please try again later." },
			{ status: 429, headers }
		);
	}

	try {
		await connectToDatabase();

		// Get the Authorization header directly from the request
		const authorization = req.headers.get("Authorization");

		if (!authorization || !authorization.startsWith("Bearer ")) {
			return NextResponse.json(
				{ error: "No token provided" },
				{ status: 401, headers }
			);
		}

		// Extract and verify the token
		const token = authorization.split(" ")[1];
		const decoded = verifyAccessToken(token);

		if (!decoded) {
			return NextResponse.json(
				{ error: "Invalid or expired token" },
				{ status: 401, headers }
			);
		}

		// Find the user
		const user = await User.findById(decoded.userId);
		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404, headers }
			);
		}

		// Return user data
		return NextResponse.json(
			{
				user: user.toAuthJSON(),
				accessToken: token, // Return the same access token if it's still valid
			},
			{ headers }
		);
	} catch (error) {
		console.error("Get User Data Error:", error);
		return NextResponse.json(
			{ error: "Failed to get user data" },
			{ status: 500, headers }
		);
	}
}
