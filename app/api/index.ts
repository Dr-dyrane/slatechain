import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { withRateLimit } from "@/lib/utils";

// Define the type for our cached mongoose instance
interface MongooseCache {
	conn: typeof mongoose | null;
	promise: Promise<typeof mongoose> | null;
}

// Declare the global type
declare global {
	var mongooseCache: MongooseCache;
}

// Initialize the global cache if it doesn't exist
if (!global.mongooseCache) {
	global.mongooseCache = {
		conn: null,
		promise: null,
	};
}

const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI as string;

if (!MONGODB_URI) {
	throw new Error(
		"Please define the MONGODB_URI environment variable inside .env.local"
	);
}

export async function connectToDatabase(): Promise<typeof mongoose> {
	// If we have a connection, return it
	if (global.mongooseCache.conn) {
		console.log("🟢 Using existing connection");
		return global.mongooseCache.conn;
	}

	// If we don't have a promise to connect, create one
	if (!global.mongooseCache.promise) {
		const opts = {
			bufferCommands: false,
			maxPoolSize: 10,
		};

		global.mongooseCache.promise = mongoose.connect(MONGODB_URI, opts);
	}

	try {
		// Await the connection
		const mongoose = await global.mongooseCache.promise;
		global.mongooseCache.conn = mongoose;
		console.log("🟢 New connection established");
		return mongoose;
	} catch (e) {
		// If connection fails, clear the promise so we can try again
		global.mongooseCache.promise = null;
		throw e;
	}
}

export async function disconnectFromDatabase(): Promise<void> {
	if (global.mongooseCache.conn) {
		await mongoose.disconnect();
		global.mongooseCache.conn = null;
		global.mongooseCache.promise = null;
		console.log("🟡 Disconnected from database");
	}
}

// ✅ getUserId
export async function getUserId(req: NextRequest): Promise<string | null> {
	const authorization = req.headers.get("Authorization");
	if (!authorization?.startsWith("Bearer ")) return null;

	const token = authorization.split(" ")[1];
	try {
		const decoded = verifyAccessToken(token);
		return decoded?.userId || null;
	} catch (error) {
		console.error("Token Verification Error:", error);
		return null;
	}
}

// ✅ handleRequest
export async function handleRequest(
	req: NextRequest,
	handler: (req: NextRequest, userId: string) => Promise<NextResponse>,
	rateLimitKey: string,
	rateLimit: number
): Promise<NextResponse> {
	try {
		const { headers, limited } = await withRateLimit(
			req,
			rateLimitKey,
			rateLimit
		);
		if (limited) {
			return NextResponse.json(
				{
					code: "RATE_LIMIT",
					message: "Too many requests. Please try again later.",
				},
				{ status: 429, headers }
			);
		}

		await connectToDatabase();
		const userId = await getUserId(req);
		if (!userId) {
			return NextResponse.json(
				{ code: "INVALID_TOKEN", message: "Authentication required" },
				{ status: 401, headers }
			);
		}

		return await handler(req, userId);
	} catch (error: any) {
		console.error("Server Error:", error);
		return NextResponse.json(
			{
				code: "SERVER_ERROR",
				message:
					error.message ||
					"An unexpected error occurred. Please try again later.",
			},
			{ status: 500 }
		);
	}
}

// Export mongoose for model definitions
export { mongoose };
