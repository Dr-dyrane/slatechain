// app/api/auth/register/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../index";
import type { RegisterRequest } from "@/lib/types";
import { generateAccessToken, generateRefreshToken } from "@/lib/auth/jwt";
import User from "../../models/User";
import RefreshToken from "../../models/RefreshToken";
import crypto from "crypto";
import { withRateLimit } from "@/lib/utils";

export async function POST(req: Request) {
	// Rate limit: 3 registrations per hour per IP
	const { headers, limited } = await withRateLimit(
		req,
		"register",
		3,
		60 * 60 * 1000
	);

	if (limited) {
		return NextResponse.json(
			{
				code: "RATE_LIMIT",
				message: "Too many registration attempts. Please try again later.",
			},
			{ status: 429, headers }
		);
	}

	try {
		await connectToDatabase();

		const body: RegisterRequest = await req.json();

		// Input validation
		if (!body.email || !body.password || !body.firstName || !body.lastName) {
			return NextResponse.json(
				{
					code: "INVALID_INPUT",
					message: "All fields are required",
				},
				{ status: 400, headers }
			);
		}

		// Email format validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(body.email)) {
			return NextResponse.json(
				{
					code: "INVALID_EMAIL",
					message: "Please enter a valid email address",
				},
				{ status: 400, headers }
			);
		}

		// Password strength validation
		if (body.password.length < 8) {
			return NextResponse.json(
				{
					code: "WEAK_PASSWORD",
					message: "Password must be at least 8 characters long",
				},
				{ status: 400, headers }
			);
		}

		// Check if user exists
		const existingUser = await User.findOne({ email: body.email });
		if (existingUser) {
			return NextResponse.json(
				{
					code: "EMAIL_EXISTS",
					message: "This email is already registered",
				},
				{ status: 409, headers }
			);
		}

		// Create new user
		const user = await User.create({
			firstName: body.firstName,
			lastName: body.lastName,
			email: body.email,
			password: body.password,
			role: body.role,
		});

		// Generate unique token ID for refresh token
		const tokenId = crypto.randomUUID();

		// Generate tokens
		const accessToken = generateAccessToken(user.toAuthJSON());
		const refreshToken = generateRefreshToken(user.toAuthJSON(), tokenId);

		// Store refresh token in database
		await RefreshToken.create({
			userId: user._id,
			tokenId,
			token: refreshToken,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
		});

		return NextResponse.json(
			{
				user: user.toAuthJSON(),
				accessToken,
				refreshToken,
			},
			{ headers }
		);
	} catch (error: any) {
		console.error("Registration Error:", error);
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
