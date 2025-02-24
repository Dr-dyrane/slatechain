// app/api/auth/password/forgot/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../index";
import User from "@/app/api/models/User";
import crypto from "crypto";
import { Redis } from "@upstash/redis";
import nodemailer from "nodemailer";
import { withRateLimit } from "@/lib/utils";
import PasswordResetEmail from "@/lib/emails/password-reset";

const redis = Redis.fromEnv();

// Configure Nodemailer with Gmail
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.NEXT_PUBLIC_GMAIL_USER, // Your Gmail address
		pass: process.env.NEXT_PUBLIC_GMAIL_APP_PASSWORD, // Your Gmail App Password
	},
});

export async function POST(req: Request) {
	// Rate limit: 3 attempts per hour
	const { headers, limited } = await withRateLimit(
		req,
		"password_reset",
		3,
		60 * 60 * 1000
	);

	if (limited) {
		return NextResponse.json(
			{ error: "Too many password reset attempts. Please try again later." },
			{
				status: 429,
				headers,
			}
		);
	}

	try {
		await connectToDatabase();
		const { email } = await req.json();

		// Find user
		const user = await User.findOne({ email });
		if (!user) {
			// For security, don't reveal if email exists
			return NextResponse.json(
				{ message: "If an account exists, a reset email will be sent" },
				{ headers }
			);
		}

		// Generate unique reset code
		const resetCode = crypto.randomBytes(32).toString("hex");

		// Store code in Redis with 1 hour expiry
		await redis.set(`pwd_reset:${resetCode}`, user.id, { ex: 3600 });

		// Generate reset link
		const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?code=${resetCode}?email=${email}`;

		// Send email using Nodemailer
		await transporter.sendMail({
			from: `"Slate Chain" <${process.env.NEXT_PUBLIC_GMAIL_USER}>`,
			to: email,
			subject: "Reset Your Password",
			html: PasswordResetEmail({
				resetLink,
				userName: user.firstName || "there",
			}),
		});

		return NextResponse.json(
			{ message: "If an account exists, a reset email will be sent" },
			{ headers }
		);
	} catch (error) {
		console.error("Password Reset Request Error:", error);
		return NextResponse.json(
			{ error: "Failed to process password reset request" },
			{
				status: 500,
				headers,
			}
		);
	}
}
