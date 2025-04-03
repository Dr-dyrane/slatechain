import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../index";
import User from "@/app/api/models/User";
import { Redis } from "@upstash/redis";
import { withRateLimit } from "@/lib/utils";

// Initialize Redis client
const redis = Redis.fromEnv();

export async function POST(req: Request) {
	// Rate limit: 5 attempts per hour
	const { headers, limited } = await withRateLimit(
		req,
		"password_reset",
		5,
		60 * 60 * 1000
	);

	if (limited) {
		return NextResponse.json(
			{
				code: "RATE_LIMIT",
				message: "Too many password reset attempts. Please try again later.",
			},
			{ status: 429, headers }
		);
	}
	try {
		await connectToDatabase();

		const { code, newPassword } = await req.json();

		if (!code || !newPassword) {
			return NextResponse.json(
				{
					code: "INVALID_INPUT",
					message: "Reset code and new password are required",
				},
				{ status: 400, headers }
			);
		}

		// Verify reset code from Redis
		const userId = await redis.get(`pwd_reset:${code}`);
		if (!userId) {
			return NextResponse.json(
				{
					code: "INVALID_CODE",
					message: "Invalid or expired reset code",
				},
				{ status: 400, headers }
			);
		}

		// Find user
		const user = await User.findById(userId);
		if (!user) {
			return NextResponse.json(
				{
					code: "USER_NOT_FOUND",
					message: "User not found",
				},
				{ status: 404, headers }
			);
		}

		// Update password
		user.password = newPassword;
		await user.save();

		// Find and delete all reset codes for this user
		// First, get all keys with the pwd_reset: prefix
		const keys = await redis.keys("pwd_reset:*");

		// Check each key to see if it belongs to this user
		for (const key of keys) {
			const keyUserId = await redis.get(key);
			if (keyUserId === userId) {
				// Delete this reset code since it belongs to the same user
				await redis.del(key);
			}
		}

		return NextResponse.json(
			{
				code: "SUCCESS",
				message: "Password reset successful",
			},
			{ headers }
		);
	} catch (error: any) {
		console.error("Password Reset Error:", error);
		return NextResponse.json(
			{
				message: error.message || "Failed to reset password",
			},
			{ status: 500, headers }
		);
	}
}
