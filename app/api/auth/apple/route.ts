// app/api/auth/APPLE/route.ts

import { NextResponse } from "next/server";
import { withRateLimit } from "@/lib/utils";
import crypto from "crypto";

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

	// Store state and nonce in session or Redis for validation
	// This should be implemented based on your session management strategy

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
