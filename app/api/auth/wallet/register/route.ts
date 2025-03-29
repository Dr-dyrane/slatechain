// app/api/auth/wallet/register/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../index";
import User from "@/app/api/models/User";
import RefreshToken from "@/app/api/models/RefreshToken";
import { generateAccessToken, generateRefreshToken } from "@/lib/auth/jwt";
import { ethers } from "ethers";
import crypto from "crypto";
import { withRateLimit } from "@/lib/utils";
import { UserRole } from "@/lib/types";

export async function POST(req: Request) {
	// Rate limit: 3 registrations per hour per IP
	const { headers, limited } = await withRateLimit(
		req,
		"wallet_register",
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

		const { address, message, signature, email, firstName, lastName } =
			await req.json();

		// Input validation
		if (
			!address ||
			!message ||
			!signature ||
			!email ||
			!firstName ||
			!lastName
		) {
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
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{
					code: "INVALID_EMAIL",
					message: "Please enter a valid email address",
				},
				{ status: 400, headers }
			);
		}

		// Verify the signature
		const recoveredAddress = ethers.verifyMessage(message, signature);

		if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
			return NextResponse.json(
				{
					code: "INVALID_SIGNATURE",
					message: "Invalid signature",
				},
				{ status: 401, headers }
			);
		}

		// Check if user exists with this wallet address
		const existingWalletUser = await User.findOne({
			"blockchain.walletAddress": address,
		});
		if (existingWalletUser) {
			return NextResponse.json(
				{
					code: "WALLET_EXISTS",
					message: "This wallet address is already registered",
				},
				{ status: 409, headers }
			);
		}

		// Check if user exists with this email
		const existingEmailUser = await User.findOne({ email });
		if (existingEmailUser) {
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
			firstName,
			lastName,
			email,
			// Generate a random password for wallet users
			password: crypto.randomBytes(32).toString("hex"),
			role: UserRole.CUSTOMER,
			blockchain: {
				walletAddress: address,
				registeredAt: new Date(),
			},
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
		console.error("Wallet Registration Error:", error);
		return NextResponse.json(
			{
				code: "SERVER_ERROR",
				message: "An unexpected error occurred. Please try again later.",
			},
			{ status: 500, headers }
		);
	}
}
