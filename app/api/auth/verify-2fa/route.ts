// app/api/auth/verify-2fa/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../index";
import User from "@/app/api/models/User";
import OTP from "@/app/api/models/OTP";
import RefreshToken from "@/app/api/models/RefreshToken";
import {
	generateAccessToken,
	generateRefreshToken,
	verifyTempToken,
} from "@/lib/auth/jwt";
import { withRateLimit } from "@/lib/utils";
import crypto from "crypto";

export async function POST(req: Request) {
	// Rate limit: 5 attempts per minute
	const { headers, limited } = await withRateLimit(req, "verify_2fa", 5);

	if (limited) {
		return NextResponse.json(
			{
				code: "RATE_LIMIT",
				message: "Too many verification attempts. Please try again later.",
			},
			{ status: 429, headers }
		);
	}

	try {
		await connectToDatabase();

		const { token, code } = await req.json();

		// Validate input
		if (!token || !code) {
			return NextResponse.json(
				{
					code: "INVALID_INPUT",
					message: "Token and verification code are required",
				},
				{ status: 400, headers }
			);
		}

		// Verify the temporary token
		const decoded = verifyTempToken(token);
		if (!decoded || !decoded.userId) {
			return NextResponse.json(
				{ code: "INVALID_TOKEN", message: "Invalid or expired token" },
				{ status: 401, headers }
			);
		}

		// Find user
		const user = await User.findById(decoded.userId);
		if (!user) {
			return NextResponse.json(
				{ code: "USER_NOT_FOUND", message: "User not found" },
				{ status: 404, headers }
			);
		}

		// Find OTP associated with the user's phone number
		const storedOTP = await OTP.findOne({ phoneNumber: user.phoneNumber });

		if (!storedOTP) {
			return NextResponse.json(
				{ code: "OTP_NOT_FOUND", message: "OTP not found" },
				{ status: 400, headers }
			);
		}

		// Check if OTP has expired
		if (storedOTP.expiresAt < new Date()) {
			// Delete the expired OTP
			await OTP.deleteOne({ phoneNumber: user.phoneNumber });
			return NextResponse.json(
				{ code: "OTP_EXPIRED", message: "OTP has expired" },
				{ status: 400, headers }
			);
		}

		// Check if OTP matches
		if (storedOTP.otp !== code) {
			return NextResponse.json(
				{ code: "INVALID_OTP", message: "Invalid OTP" },
				{ status: 401, headers }
			);
		}

		// Delete OTP after successful verification
		await OTP.deleteOne({ phoneNumber: user.phoneNumber });

		// Update last verified timestamp
		user.twoFactorAuth.lastVerified = new Date();
		await user.save();

		// Generate tokens for authentication
		const tokenId = crypto.randomUUID();
		const accessToken = generateAccessToken(user.toAuthJSON());
		const refreshToken = generateRefreshToken(user.toAuthJSON(), tokenId);

		// Store refresh token
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
	} catch (error: any) {
		console.error("Verify 2FA Error:", error);
		return NextResponse.json(
			{
				code: "SERVER_ERROR",
				message:
					error.message ||
					"An unexpected error occurred. Please try again later.",
			},
			{ status: 500, headers }
		);
	}
}
