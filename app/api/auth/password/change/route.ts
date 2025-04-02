// app/api/auth/password/change/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../index";
import User from "@/app/api/models/User";
import { verifyAccessToken } from "@/lib/auth/jwt";
import type { PasswordChangeFormData } from "@/lib/types";
import { withRateLimit } from "@/lib/utils";

export async function POST(req: Request) {
	// Rate limit: 5 attempts per hour
	const { headers, limited } = await withRateLimit(
		req,
		"password_change",
		5,
		60 * 60 * 1000
	);

	if (limited) {
		return NextResponse.json(
			{
				code: "RATE_LIMIT",
				message: "Too many password change attempts. Please try again later.",
			},
			{ status: 429, headers }
		);
	}

	try {
		await connectToDatabase();

		// Get and verify token
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

		// Get password data
		const { currentPassword, newPassword }: PasswordChangeFormData =
			await req.json();

		// Validate input
		if (!currentPassword || !newPassword) {
			return NextResponse.json(
				{
					code: "INVALID_INPUT",
					message: "Current password and new password are required",
				},
				{ status: 400, headers }
			);
		}

		// Find user
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

		// Verify current password
		const isValid = await user.comparePassword(currentPassword);
		if (!isValid) {
			return NextResponse.json(
				{ code: "INVALID_PASSWORD", message: "Current password is incorrect" },
				{ status: 401, headers }
			);
		}

		// Update password
		user.password = newPassword;
		await user.save();

		return NextResponse.json(
			{
				code: "SUCCESS",
				message: "Password updated successfully",
			},
			{ headers }
		);
	} catch (error: any) {
		console.error("Password Change Error:", error);
		return NextResponse.json(
			{
				message: error.message || "Failed to change password",
			},
			{ status: 500, headers }
		);
	}
}
