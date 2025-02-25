// app/api/auth/apple/callback/route.ts

import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken"; // Import JwtPayload
import jwksClient from "jwks-rsa";
import { connectToDatabase } from "../../../index";
import User from "@/app/api/models/User";
import RefreshToken from "@/app/api/models/RefreshToken";
import { generateAccessToken, generateRefreshToken } from "@/lib/auth/jwt";
import crypto from "crypto";
import { UserRole } from "@/lib/types";
import { Redis } from "@upstash/redis";

interface DecodedToken extends JwtPayload {
	nonce: string;
	email?: string; // Apple sometimes hides email
	sub: string; // Apple's unique user identifier
	firstName?: string;
	lastName?: string;
	name?: string; // Full name (sometimes returned instead of firstName/lastName)
}

const redis = Redis.fromEnv();
const client = jwksClient({ jwksUri: "https://appleid.apple.com/auth/keys" });

//  getKey retrieves Apple's public key to verify the token
function getKey(header: any, callback: (err: any, key: any) => void) {
	client.getSigningKey(header.kid, function (err, key) {
		if (err) {
			callback(err, null); // Explicitly pass null for key on error
			return;
		}
		const signingKey = key?.getPublicKey();
		callback(null, signingKey);
	});
}

export async function POST(req: Request) {
	try {
		// Get data from the POST request (Apple's callback sends a POST)
		const formData = await req.formData();
		const code = formData.get("code");
		const idToken = formData.get("id_token");
		const state = formData.get("state");

		// Validate required parameters exist
		if (!code || !idToken || !state) {
			return NextResponse.redirect(
				`${process.env.NEXT_PUBLIC_APP_URL}/login?error=missing_params`
			);
		}

		// Retrieve nonce from Redis using state to prevent CSRF
		const storedNonce = await redis.get(`apple-oauth-state:${state}`);
		if (!storedNonce) {
			return NextResponse.redirect(
				`${process.env.NEXT_PUBLIC_APP_URL}/login?error=invalid_state`
			);
		}

		// Delete state from Redis to prevent replay attacks
		await redis.del(`apple-oauth-state:${state}`);
		// Decode token to get header information (needed for key retrieval)
		const { header } = jwt.decode(idToken.toString(), { complete: true }) as {
			header: any;
		};

		// Verify JWT token using Apple's public key (asynchronously)
		const decoded = await new Promise<DecodedToken>((resolve, reject) => {
			if (!header) {
				reject(new Error("Invalid token format. Missing header."));
				return;
			}

			getKey(header, (err, key) => {
				if (err || !key) {
					reject(new Error("Error retrieving Apple public key."));
					return;
				}

				jwt.verify(
					idToken.toString(),
					key,
					{ algorithms: ["RS256"] },
					(err, decodedToken) => {
						if (err || !decodedToken) {
							reject(new Error("Invalid token. Failed verification."));
						} else {
							resolve(decodedToken as DecodedToken);
						}
					}
				);
			});
		});

		// Ensure the decoded token is of the correct type. If it's a string, there was an issue with verification
		if (!decoded || decoded.nonce !== storedNonce) {
			return NextResponse.redirect(
				`${process.env.NEXT_PUBLIC_APP_URL}/login?error=invalid_nonce`
			);
		}

		await connectToDatabase();
		let user = await User.findOne({ email: decoded.email });

		if (!user) {
			// Create new user
			user = await User.create({
				email: decoded.email || `${decoded.sub}@privaterelay.appleid.com`, // Use Apple's private relay email if missing
				firstName: decoded.firstName || "Apple",
				lastName: decoded.lastName || "User",
				isEmailVerified: true, // Apple does not provide verification status, assume true
				avatarUrl: null, // Apple does not provide avatars
				// Generate a random password for OAuth users
				password: crypto.randomBytes(32).toString("hex"),
				integrations: {
					auth: {
						apple: {
							id: decoded.sub, // Unique Apple ID
							email: decoded.email || `${decoded.sub}@privaterelay.appleid.com`,
							name:
								decoded.name ||
								`${decoded.firstName || "Apple"} ${decoded.lastName || "User"}`,
						},
					},
				},
			});
		} else {
			// Update existing user's Apple integration
			user.integrations = {
				...user.integrations,
				auth: {
					...(user.integrations?.auth || {}),
					apple: {
						id: decoded.sub,
						email: user.email, // Keep stored email since Apple doesn't resend it
						name: user.name, // Keep stored name since Apple doesn't resend it
					},
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
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		});

		// Create the callback URL with tokens
		const callbackUrl = new URL(
			`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
		);
		callbackUrl.searchParams.set("access_token", accessToken);
		callbackUrl.searchParams.set("refresh_token", refreshToken);

		return NextResponse.redirect(callbackUrl.toString());
	} catch (error) {
		console.error("Apple OAuth Error:", error);
		return NextResponse.redirect(
			`${process.env.NEXT_PUBLIC_APP_URL}/login?error=oauth_failed`
		);
	}
}
