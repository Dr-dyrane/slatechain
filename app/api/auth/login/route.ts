// app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../index";
import User from "@/app/api/models/User";
import RefreshToken from "@/app/api/models/RefreshToken"; // New model
import { generateAccessToken, generateRefreshToken } from "@/lib/auth/jwt";
import type { LoginRequest } from "@/lib/types";
import crypto from "crypto";

export async function POST(req: Request) {
	try {
		await connectToDatabase();

		const { email, password }: LoginRequest = await req.json();

		// Find user
		const user = await User.findOne({ email });
		if (!user) {
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 401 }
			);
		}

		// Verify password
		const isValid = await user.comparePassword(password);
		if (!isValid) {
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 401 }
			);
		}

		// Generate unique token ID for refresh token
		const tokenId = crypto.randomUUID();

		// Generate tokens
		const accessToken = generateAccessToken(user.toAuthJSON());
		const refreshToken = generateRefreshToken(user.toAuthJSON(), tokenId);

		// Store refresh token in database (instead of user document)
		await RefreshToken.create({
			userId: user.id,
			tokenId,
			token: refreshToken,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
		});

		return NextResponse.json({
			user: user.toAuthJSON(),
			accessToken,
			refreshToken,
		});
	} catch (error) {
		console.error("Login Error:", error);
		return NextResponse.json({ error: "Login failed" }, { status: 500 });
	}
}
