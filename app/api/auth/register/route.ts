// app/api/auth/register/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../index";

import type { RegisterRequest } from "@/lib/types";
import { generateAccessToken, generateRefreshToken } from "@/lib/auth/jwt";
import User from "../../models/User";
import RefreshToken from "../../models/RefreshToken"; // Import the new model

export async function POST(req: Request) {
	try {
		await connectToDatabase();

		const body: RegisterRequest = await req.json();

		// Check if user exists
		const existingUser = await User.findOne({ email: body.email });
		if (existingUser) {
			return NextResponse.json(
				{ error: "Email already registered" },
				{ status: 409 }
			);
		}

		// Create new user
		const user = await User.create({
			firstName: body.firstName,
			lastName: body.lastName,
			email: body.email,
			password: body.password,
			role: body.role,
		});

		// Generate unique token ID for refresh token
		const tokenId = crypto.randomUUID();

		// Generate tokens
		const accessToken = generateAccessToken(user.toAuthJSON());
		const refreshToken = generateRefreshToken(user.toAuthJSON(), tokenId);

		// Store refresh token in database
		await RefreshToken.create({
			userId: user._id,
			token: refreshToken,
		});

		return NextResponse.json({
			user: user.toAuthJSON(),
			accessToken,
			refreshToken,
		});
	} catch (error: any) {
		console.error("Registration Error:", error);
		return NextResponse.json({ error: "Registration failed" }, { status: 500 });
	}
}
