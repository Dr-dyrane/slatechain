import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../index";
import User from "@/app/api/models/User";
import crypto from "crypto";
import { Redis } from "@upstash/redis";
import nodemailer from "nodemailer";
import { withRateLimit } from "@/lib/utils";
import { passwordResetEmail } from "@/lib/emails/password-reset";

const redis = Redis.fromEnv();

// Configure Nodemailer with Gmail
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.NEXT_PUBLIC_GMAIL_USER, // Your Gmail address
		pass: process.env.NEXT_PUBLIC_GMAIL_APP_PASSWORD, // Your Gmail App Password
	},
});

// Generate a random 6-digit code
function generateResetCode(): string {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

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
			{
				code: "RATE_LIMIT",
				message: "Too many password reset attempts. Please try again later.",
			},
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
		if (!email) {
			// For security, don't reveal if email exists
			return NextResponse.json(
				{
					code: "INVALID_INPUT",
					message: "Email is required",
				},
				{ headers }
			);
		}

		// Email format validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{
					code: "INVALID_EMAIL",
					message: "Please enter a valid email address",
				},
				{ status: 400, headers }
			);
		}

		// For security, always return the same response whether the email exists or not
		const genericResponse = {
			code: "SUCCESS",
			message: "If an account exists, a reset email will be sent",
		};
		// If no user found, return generic response without sending email
		if (!user) {
			return NextResponse.json(genericResponse, { headers });
		}

		// Generate a 6-digit reset code
		const resetCode = generateResetCode();

		// Also generate a unique token for the link (for backward compatibility)
		const resetToken = crypto.randomBytes(32).toString("hex");

		// Store code in Redis with 1 hour expiry
		await redis.set(`pwd_reset:${resetCode}`, user.id, { ex: 3600 });

		// Also store the token (for backward compatibility)
		await redis.set(`pwd_reset:${resetToken}`, user.id, { ex: 3600 });

		// Generate reset link
		const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?code=${resetToken}&email=${email}`;

		try {
			// Render the email HTML with both the link and the 6-digit code
			const emailHtml = passwordResetEmail(
				resetLink,
				user.firstName || "there",
				resetCode
			);

			// Send email
			await transporter.sendMail({
				from: `"Supply Cycles" <${process.env.NEXT_PUBLIC_GMAIL_USER}>`,
				to: email,
				subject: "Reset Your Password",
				html: emailHtml,
			});

			return NextResponse.json(genericResponse, { headers });
		} catch (error: any) {
			console.error("Email Send Error:", error);
			return NextResponse.json(
				{
					code: "EMAIL_SEND_ERROR",
					message:
						error.message ||
						"Failed to send reset email. Please try again later.",
				},
				{ status: 500, headers }
			);
		}
	} catch (error: any) {
		console.error("Password Reset Request Error:", error);
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
