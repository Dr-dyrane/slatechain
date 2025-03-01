// app/api/admin/kyc/documents/[userId]/route.ts

import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";

import { UserRole } from "@/lib/types";
import { connectToDatabase } from "@/app/api";
import User from "@/app/api/models/User";
import KYCSubmission from "@/app/api/models/KYCSubmission";

export async function GET(
	req: Request,
	{ params }: { params: { userId: string } }
) {
	try {
		await connectToDatabase();

		// Verify authentication token
		const authorization = req.headers.get("Authorization");
		if (!authorization?.startsWith("Bearer ")) {
			return NextResponse.json(
				{ code: "NO_TOKEN", message: "Authentication required" },
				{ status: 401 }
			);
		}

		const token = authorization.split(" ")[1];
		const decoded = verifyAccessToken(token);

		if (!decoded) {
			return NextResponse.json(
				{ code: "INVALID_TOKEN", message: "Invalid or expired token" },
				{ status: 401 }
			);
		}

		// Verify admin role
		const admin = await User.findById(decoded.userId);
		if (!admin || admin.role !== UserRole.ADMIN) {
			return NextResponse.json(
				{ code: "FORBIDDEN", message: "Admin access required" },
				{ status: 403 }
			);
		}

		// Get userId from the route params
		const { userId } = params;

		if (!userId) {
			return NextResponse.json(
				{ code: "INVALID_INPUT", message: "User ID is required" },
				{ status: 400 }
			);
		}

		// Find the KYC submission for the user
		const submission = await KYCSubmission.findOne({ userId }).populate(
			"userId",
			"firstName lastName email"
		);

		if (!submission) {
			return NextResponse.json(
				{ code: "NOT_FOUND", message: "KYC submission not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({ submission });
	} catch (error) {
		console.error("Fetch KYC Submission Error:", error);
		return NextResponse.json(
			{ code: "SERVER_ERROR", message: "Failed to fetch KYC submission" },
			{ status: 500 }
		);
	}
}

