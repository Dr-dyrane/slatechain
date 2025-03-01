// app/api/kyc/status/route.ts

import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "../../index";
import { withRateLimit } from "@/lib/utils";
import User from "../../models/User";
import KYCDocument from "../../models/KYCDocument";

export async function GET(req: Request) {
	// Rate limit: 60 requests per minute
	const { headers, limited } = await withRateLimit(req, "kyc_status", 60);

	if (limited) {
		return NextResponse.json(
			{
				code: "RATE_LIMIT",
				message: "Too many requests. Please try again later.",
			},
			{ status: 429, headers }
		);
	}

	try {
		await connectToDatabase();

		// Verify authentication token
		const authorization = req.headers.get("Authorization");
		if (!authorization?.startsWith("Bearer ")) {
			return NextResponse.json(
				{
					code: "NO_TOKEN",
					message: "Authentication required",
				},
				{ status: 401, headers }
			);
		}

		const token = authorization.split(" ")[1];
		const decoded = verifyAccessToken(token);

		if (!decoded) {
			return NextResponse.json(
				{
					code: "INVALID_TOKEN",
					message: "Invalid or expired token",
				},
				{ status: 401, headers }
			);
		}

		// Get user and their documents
		const user = await User.findById(decoded.userId);
		if (!user) {
			return NextResponse.json(
				{
					code: "USER_NOT_FOUND",
					message: "User not found",
				},
				{ status: 404, headers }
			);
		}

		const documents = await KYCDocument.find({ userId: decoded.userId });

		return NextResponse.json(
			{
				status: user.kycStatus,
				documents: documents.map((doc) => ({
					id: doc._id,
					type: doc.type,
					status: doc.status,
					url: doc.url,
					uploadedAt: doc.createdAt,
				})),
			},
			{ headers }
		);
	} catch (error) {
		console.error("KYC Status Error:", error);
		return NextResponse.json(
			{
				code: "SERVER_ERROR",
				message: "Failed to fetch KYC status",
			},
			{ status: 500, headers }
		);
	}
}
