// app/api/auth/setup-2fa/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../index";
import User from "@/app/api/models/User";
import OTP from "@/app/api/models/OTP";
import { withRateLimit } from "@/lib/utils";
import crypto from "crypto";
import { sendOTP } from "@/app/actions/whatsapp";

export async function POST(req: Request) {
	const { headers, limited } = await withRateLimit(req, "setup_2fa", 5);

	if (limited) {
		return NextResponse.json(
			{
				code: "RATE_LIMIT",
				message: "Too many 2FA setup attempts. Please try again later.",
			},
			{ status: 429, headers }
		);
	}

	try {
		await connectToDatabase();

		const { phoneNumber } = await req.json();

		// Validate input
		if (!phoneNumber) {
			return NextResponse.json(
				{ code: "INVALID_INPUT", message: "Phone number is required" },
				{ status: 400, headers }
			);
		}

		// Generate OTP code
		const otpCode = crypto.randomInt(100000, 999999).toString();

		// Set OTP expiration to 10 minutes from now
		const otpExpiration = new Date();
		otpExpiration.setMinutes(otpExpiration.getMinutes() + 10);

		// Store OTP in the database
		await OTP.create({
			phoneNumber,
			otp: otpCode,
			expiresAt: otpExpiration,
		});

		// Send OTP via WhatsApp
		await sendOTP(phoneNumber, otpCode);

		return NextResponse.json(
			{ message: "OTP sent to your WhatsApp for 2FA setup" },
			{ headers }
		);
	} catch (error: any) {
		console.error("Setup 2FA Error:", error);
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
