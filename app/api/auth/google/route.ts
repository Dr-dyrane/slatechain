// app/api/auth/google/route.ts

import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { withRateLimit } from "@/lib/utils";

const client = new OAuth2Client(
	process.env.NEXT_GOOGLE_CLIENT_ID,
	process.env.NEXT_GOOGLE_CLIENT_SECRET,
	process.env.NEXT_GOOGLE_CALLBACK_URL
);

export async function GET(req: Request) {
	// Rate limit: 10 attempts per minute
	const { headers, limited } = await withRateLimit(req, "google_auth", 10);

	if (limited) {
		return NextResponse.json(
			{ error: "Too many attempts. Please try again later." },
			{
				status: 429,
				headers,
			}
		);
	}

	// Generate Google OAuth URL
	const authUrl = client.generateAuthUrl({
		access_type: "offline",
		scope: [
			"https://www.googleapis.com/auth/userinfo.profile",
			"https://www.googleapis.com/auth/userinfo.email",
		],
		prompt: "consent",
	});

	// Redirect to Google's consent page
	return NextResponse.redirect(authUrl, {
		headers,
	});
}
