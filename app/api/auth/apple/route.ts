// app/api/auth/apple/route.ts

import { NextResponse } from "next/server";
import { withRateLimit } from "@/lib/utils";
import crypto from "crypto";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();  // Initialize Redis client

export async function GET(req: Request) {
	// Rate limit: 10 attempts per minute
	const { headers, limited } = await withRateLimit(req, "apple_auth", 10);

	if (limited) {
		return NextResponse.json(
			{ error: "Too many attempts. Please try again later." },
			{ status: 429, headers }
		);
	}

	// Generate state for CSRF protection
	const state = crypto.randomBytes(16).toString("hex");

	// Generate nonce for PKCE
	const nonce = crypto.randomBytes(16).toString("base64");

	await redis.set(`apple-oauth-state:${state}`, nonce, { ex: 300 }); // Expire in 5 minutes

	// Construct Apple OAuth URL
	const authUrl = new URL("https://appleid.apple.com/auth/authorize");
	authUrl.searchParams.append("client_id", process.env.NEXT_APPLE_CLIENT_ID!);
	authUrl.searchParams.append(
		"redirect_uri",
		process.env.NEXT_APPLE_CALLBACK_URL!
	);
	authUrl.searchParams.append("response_type", "code id_token");
	authUrl.searchParams.append("scope", "name email");
	authUrl.searchParams.append("response_mode", "form_post");
	authUrl.searchParams.append("state", state);
	authUrl.searchParams.append("nonce", nonce);

	return NextResponse.redirect(authUrl.toString(), { headers });
}
