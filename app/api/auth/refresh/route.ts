// app/api/auth/refresh/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../index";
import User from "@/app/api/models/User";
import RefreshToken from "@/app/api/models/RefreshToken";
import {
	verifyRefreshToken,
	generateAccessToken,
	generateRefreshToken,
} from "@/lib/auth/jwt";
import crypto from "crypto";
import { withRateLimit } from "@/lib/utils";

export async function POST(req: Request) {
	// Rate limit: 30 refreshes per minute per token
	// Higher limit since this is used frequently
	const { headers, limited } = await withRateLimit(req, "refresh", 30);

	if (limited) {
		return NextResponse.json(
			{ error: "Too many refresh attempts. Please try again later." },
			{ status: 429, headers }
		);
	}

	try {
		await connectToDatabase();

		const { refreshToken } = await req.json();

		if (!refreshToken) {
			return NextResponse.json(
				{ error: "Refresh token is required" },
				{ status: 400, headers }
			);
		}

		// Verify the refresh token
		const decoded = verifyRefreshToken(refreshToken);
		if (!decoded) {
			return NextResponse.json(
				{ error: "Invalid refresh token" },
				{ status: 401, headers }
			);
		}

		// Find the refresh token in the database
		const existingToken = await RefreshToken.findOne({
			userId: decoded.userId,
			tokenId: decoded.tokenId,
			token: refreshToken,
		});

		if (!existingToken) {
			return NextResponse.json(
				{ error: "Refresh token not found" },
				{ status: 401, headers }
			);
		}

		// Check if the token has expired
		if (existingToken.expiresAt < new Date()) {
			await RefreshToken.deleteOne({ _id: existingToken._id });
			return NextResponse.json(
				{ error: "Refresh token has expired" },
				{ status: 401, headers }
			);
		}

		// Find the user
		const user = await User.findById(decoded.userId);
		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 401, headers }
			);
		}

		// Generate new token ID and tokens
		const newTokenId = crypto.randomUUID();
		const newAccessToken = generateAccessToken(user.toAuthJSON());
		const newRefreshToken = generateRefreshToken(user.toAuthJSON(), newTokenId);

		// Delete old refresh token and create new one
		await RefreshToken.deleteOne({ _id: existingToken._id });
		await RefreshToken.create({
			userId: user._id,
			tokenId: newTokenId,
			token: newRefreshToken,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
		});

		return NextResponse.json(
			{
				accessToken: newAccessToken,
				refreshToken: newRefreshToken,
			},
			{ headers }
		);
	} catch (error) {
		console.error("Token Refresh Error:", error);
		return NextResponse.json(
			{ error: "Failed to refresh token" },
			{ status: 500, headers }
		);
	}
}
