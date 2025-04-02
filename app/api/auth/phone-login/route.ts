// app/api/auth/phone-login/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../index";
import User from "@/app/api/models/User";
import OTP from "@/app/api/models/OTP";
import RefreshToken from "@/app/api/models/RefreshToken";
import {
	generateAccessToken,
	generateRefreshToken,
	generateTempToken,
} from "@/lib/auth/jwt";
import { withRateLimit } from "@/lib/utils";
import crypto from "crypto";
import { sendOTP } from "@/app/actions/whatsapp";

export async function POST(req: Request) {
	const { headers, limited } = await withRateLimit(req, "phone_login", 5);

	if (limited) {
		return NextResponse.json(
			{
				code: "RATE_LIMIT",
				message: "Too many login attempts. Please try again later.",
			},
			{ status: 429, headers }
		);
	}

	try {
		await connectToDatabase();

		const { phoneNumber, otp } = await req.json();

		// Validate input
		if (!phoneNumber) {
			return NextResponse.json(
				{ code: "INVALID_INPUT", message: "Phone number is required" },
				{ status: 400, headers }
			);
		}

		// Find user by phone number
		const user = await User.findOne({ phoneNumber });
		if (!user) {
			return NextResponse.json(
				{
					code: "USER_NOT_FOUND",
					message: "No account found with this phone number",
				},
				{ status: 404, headers }
			);
		}

		// If OTP is provided, verify it
		if (otp) {
			// Check if OTP exists and is valid
			const storedOTP = await OTP.findOne({ phoneNumber });

			if (!storedOTP) {
				return NextResponse.json(
					{ code: "OTP_NOT_FOUND", message: "OTP not found" },
					{ status: 400, headers }
				);
			}

			// Check if OTP has expired
			if (storedOTP.expiresAt < new Date()) {
				return NextResponse.json(
					{ code: "OTP_EXPIRED", message: "OTP has expired" },
					{ status: 400, headers }
				);
			}

			// Check if OTP matches
			if (storedOTP.otp !== otp) {
				return NextResponse.json(
					{ code: "INVALID_OTP", message: "Invalid OTP" },
					{ status: 400, headers }
				);
			}

			// OTP verified, generate access tokens
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

			// OTP is verified, delete OTP from database
			await OTP.deleteOne({ phoneNumber });

			return NextResponse.json(
				{
					user: user.toAuthJSON(),
					accessToken,
					refreshToken,
				},
				{ headers }
			);
		} else {
			// If no OTP provided, send one
			const otpCode = crypto.randomInt(100000, 999999).toString();

			// Store OTP and its expiration time
			const otpExpiration = new Date();
			otpExpiration.setMinutes(otpExpiration.getMinutes() + 10); // 10 minutes expiration

			await OTP.create({
				phoneNumber,
				otp: otpCode,
				expiresAt: otpExpiration,
			});

			// Send OTP via WhatsApp
			await sendOTP(phoneNumber, otpCode);

			return NextResponse.json(
				{ message: "OTP sent to your WhatsApp" },
				{ headers }
			);
		}
	} catch (error: any) {
		console.error("Phone Login Error:", error);
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
