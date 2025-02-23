// app/api/auth/refresh/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../index";

import {
	verifyRefreshToken,
	generateAccessToken,
	generateRefreshToken,
} from "@/lib/auth/jwt";
import User from "../../models/User";

export async function POST(req: Request) {
	try {
		await connectToDatabase();

		const { refreshToken } = await req.json();

		// Verify refresh token
		const payload = verifyRefreshToken(refreshToken);
		if (!payload || !("userId" in payload)) {
			return NextResponse.json(
				{ error: "Invalid refresh token" },
				{ status: 401 }
			);
		}

		// Find user and verify refresh token
		const user = await User.findOne({
			_id: payload.userId,
			refreshToken,
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Invalid refresh token" },
				{ status: 401 }
			);
		}

		// Generate new tokens
		const newAccessToken = generateAccessToken(user.toAuthJSON());
		const newRefreshToken = generateRefreshToken(user.toAuthJSON());

		// Update refresh token
		user.refreshToken = newRefreshToken;
		await user.save();

		return NextResponse.json({
			accessToken: newAccessToken,
			refreshToken: newRefreshToken,
		});
	} catch (error) {
		console.error("Token Refresh Error:", error);
		return NextResponse.json(
			{ error: "Token refresh failed" },
			{ status: 500 }
		);
	}
}
