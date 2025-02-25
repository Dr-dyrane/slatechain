// app/api/users/me/profile/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../index";
import User from "@/app/api/models/User";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { withRateLimit } from "@/lib/utils";

export async function PUT(req: Request) {
	// Rate limit: 10 updates per hour
	const { headers, limited } = await withRateLimit(
		req,
		"profile_update",
		10,
		60 * 60 * 1000
	);

	if (limited) {
		return NextResponse.json(
			{
				code: "RATE_LIMIT",
				message: "Too many profile update attempts. Please try again later.",
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

		// Get profile data
		const profileData = await req.json();

		// Find and update user
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

		// Only allow updating specific fields
		const allowedUpdates = [
			"firstName",
			"lastName",
			"phoneNumber",
			"avatarUrl",
			"integrations",
		];

		// Filter out non-allowed fields
		const updates = Object.keys(profileData)
			.filter((key) => allowedUpdates.includes(key))
			.reduce(
				(obj, key) => {
					obj[key] = profileData[key];
					return obj;
				},
				{} as Record<string, any>
			);

		if (Object.keys(updates).length === 0) {
			return NextResponse.json(
				{
					code: "INVALID_UPDATE",
					message: "No valid fields to update",
				},
				{ status: 400, headers }
			);
		}

		// Update user
		Object.assign(user, updates);
		await user.save();

		return NextResponse.json(
			{
				code: "SUCCESS",
				user: user.toAuthJSON(),
			},
			{ headers }
		);
	} catch (error) {
		console.error("Profile Update Error:", error);
		return NextResponse.json(
			{
				code: "SERVER_ERROR",
				message: "Failed to update profile",
			},
			{ status: 500, headers }
		);
	}
}

export async function GET(req: Request) {
	// Rate limit: 100 requests per minute
	const { headers, limited } = await withRateLimit(req, "profile_get", 100);

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

		return NextResponse.json(
			{
				code: "SUCCESS",
				user: user.toAuthJSON(),
			},
			{ headers }
		);
	} catch (error) {
		console.error("Get Profile Error:", error);
		return NextResponse.json(
			{
				code: "SERVER_ERROR",
				message: "Failed to get profile",
			},
			{ status: 500, headers }
		);
	}
}
