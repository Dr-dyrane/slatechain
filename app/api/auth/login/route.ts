// app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../index";
import User from "@/app/api/models/User";
import { generateAccessToken, generateRefreshToken } from "@/lib/auth/jwt";
import type { LoginRequest } from "@/lib/types";

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

		// Generate tokens
		const accessToken = generateAccessToken(user.toAuthJSON());
		const refreshToken = generateRefreshToken(user.toAuthJSON());

		// Save refresh token
		user.refreshToken = refreshToken;
		await user.save();

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
