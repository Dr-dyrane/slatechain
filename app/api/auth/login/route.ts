// app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../index";
import User from "@/app/api/models/User";
import RefreshToken from "@/app/api/models/RefreshToken";
import { generateAccessToken, generateRefreshToken } from "@/lib/auth/jwt";
import type { LoginRequest } from "@/lib/types";
import crypto from "crypto";
import { withRateLimit } from "@/lib/utils";

export async function POST(req: Request) {
	// Rate limit: 5 attempts per minute
	const { headers, limited } = await withRateLimit(req, "login", 5);

	if (limited) {
		return NextResponse.json(
			{
				code: "RATE_LIMIT",
				message: "Too many login attempts. Please try again later.",
			},
			{
				status: 429,
				headers,
			}
		);
	}

	try {
		await connectToDatabase();

		const { email, password }: LoginRequest = await req.json();

		// Input validation
		if (!email || !password) {
			return NextResponse.json(
				{
					code: "INVALID_INPUT",
					message: "Email and password are required",
				},
				{ status: 400, headers }
			);
		}

		// Find user
		const user = await User.findOne({ email });
		if (!user) {
			return NextResponse.json(
				{
					code: "INVALID_CREDENTIALS",
					message: "Invalid email or password",
				},
				{
					status: 401,
					headers,
				}
			);
		}

		// Verify password
		const isValid = await user.comparePassword(password);
		if (!isValid) {
			return NextResponse.json(
				{
					code: "INVALID_CREDENTIALS",
					message: "Invalid email or password",
				},
				{
					status: 401,
					headers,
				}
			);
		}

		// Generate unique token ID for refresh token
		const tokenId = crypto.randomUUID();

		// Generate tokens
		const accessToken = generateAccessToken(user.toAuthJSON());
		const refreshToken = generateRefreshToken(user.toAuthJSON(), tokenId);

		// Store refresh token in database
		await RefreshToken.create({
			userId: user.id,
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
	} catch (error) {
		console.error("Login Error:", error);
		return NextResponse.json(
			{
				code: "SERVER_ERROR",
				message: "An unexpected error occurred. Please try again later.",
			},
			{
				status: 500,
				headers,
			}
		);
	}
}
