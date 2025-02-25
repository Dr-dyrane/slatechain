// app/api/auth/google/callback/route.ts

import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { connectToDatabase } from "../../../index";
import User from "@/app/api/models/User";
import RefreshToken from "@/app/api/models/RefreshToken";
import { generateAccessToken, generateRefreshToken } from "@/lib/auth/jwt";
import crypto from "crypto";

const client = new OAuth2Client(
	process.env.NEXT_GOOGLE_CLIENT_ID,
	process.env.NEXT_GOOGLE_CLIENT_SECRET,
	process.env.NEXT_GOOGLE_CALLBACK_URL
);

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const code = searchParams.get("code");

		if (!code) {
			return NextResponse.redirect(
				`${process.env.NEXT_PUBLIC_APP_URL}/login?error=no_code`
			);
		}

		// Exchange code for tokens
		const { tokens } = await client.getToken(code);
		const ticket = await client.verifyIdToken({
			idToken: tokens.id_token!,
			audience: process.env.NEXT_GOOGLE_CLIENT_ID,
		});

		const payload = ticket.getPayload()!;

		await connectToDatabase();

		// Find or create user
		let user = await User.findOne({ email: payload.email });

		if (!user) {
			// Create new user
			user = await User.create({
				email: payload.email,
				firstName: payload.given_name || payload.name?.split(" ")[0] || "",
				lastName:
					payload.family_name ||
					payload.name?.split(" ").slice(1).join(" ") ||
					"",
				isEmailVerified: payload.email_verified || false,
				avatarUrl: payload.picture,
				// Generate a random password for OAuth users
				password: crypto.randomBytes(32).toString("hex"),
				integrations: {
					google: {
						id: payload.sub,
						email: payload.email,
					},
				},
			});
		} else {
			// Update existing user's Google integration
			user.integrations = {
				...user.integrations,
				google: {
					id: payload.sub,
					email: payload.email,
				},
			};
			await user.save();
		}

		// Generate our own tokens
		const tokenId = crypto.randomUUID();
		const accessToken = generateAccessToken(user.toAuthJSON());
		const refreshToken = generateRefreshToken(user.toAuthJSON(), tokenId);

		// Store refresh token
		await RefreshToken.create({
			userId: user._id,
			tokenId,
			token: refreshToken,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
		});

		// Create the callback URL with tokens
		const callbackUrl = new URL(
			`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
		);
		callbackUrl.searchParams.set("access_token", accessToken);
		callbackUrl.searchParams.set("refresh_token", refreshToken);

		return NextResponse.redirect(callbackUrl.toString());
	} catch (error) {
		console.error("Google OAuth Error:", error);
		return NextResponse.redirect(
			`${process.env.NEXT_PUBLIC_APP_URL}/login?error=oauth_failed`
		);
	}
}
