// app/api/kyc/submit/route.ts

import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "../../index";
import { withRateLimit } from "@/lib/utils";
import User from "../../models/User";
import KYCSubmission from "../../models/KYCSubmission";
import { KYCStatus } from "@/lib/types";
import mongoose from "mongoose";
import crypto from "crypto";

export async function POST(req: Request) {
	// Rate limit: 3 submissions per hour
	const { headers, limited } = await withRateLimit(
		req,
		"kyc_submit",
		3,
		60 * 60 * 1000
	);
	if (limited) {
		return NextResponse.json(
			{
				code: "RATE_LIMIT",
				message: "Too many attempts. Please try again later.",
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
				{ code: "NO_TOKEN", message: "Authentication required" },
				{ status: 401, headers }
			);
		}

		const token = authorization.split(" ")[1];
		const decoded = verifyAccessToken(token);
		if (!decoded) {
			return NextResponse.json(
				{ code: "INVALID_TOKEN", message: "Invalid or expired token" },
				{ status: 401, headers }
			);
		}

		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			let body;
			try {
				body = await req.json();
			} catch {
				return NextResponse.json(
					{ code: "INVALID_JSON", message: "Invalid JSON format" },
					{ status: 400, headers }
				);
			}

			// Required fields validation
			const requiredFields = ["fullName", "dateOfBirth", "address"];
			const missingFields = requiredFields.filter((field) => !body[field]);

			if (missingFields.length > 0) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message: `Missing required fields: ${missingFields.join(", ")}`,
					},
					{ status: 400, headers }
				);
			}

			// Fetch user
			const user = await User.findById(decoded.userId).session(session);
			if (!user) {
				return NextResponse.json(
					{ code: "USER_NOT_FOUND", message: "User not found" },
					{ status: 404, headers }
				);
			}

			// Check if KYC process is in progress
			if (user.kycStatus !== KYCStatus.IN_PROGRESS) {
				return NextResponse.json(
					{
						code: "INVALID_STATUS",
						message: "KYC process must be in progress to submit",
					},
					{ status: 400, headers }
				);
			}

			// Prevent duplicate KYC submissions
			const existingSubmission = await KYCSubmission.findOne({
				userId: decoded.userId,
			}).session(session);
			if (existingSubmission) {
				return NextResponse.json(
					{
						code: "DUPLICATE_KYC",
						message: "A KYC submission already exists.",
					},
					{ status: 400, headers }
				);
			}

			// Generate unique reference ID
			const referenceId = crypto.randomUUID();

			// Create KYC submission
			const submission = new KYCSubmission({
				userId: decoded.userId,
				referenceId,
				fullName: body.fullName,
				dateOfBirth: body.dateOfBirth,
				address: body.address,
				role: user.role,
				companyName: body.companyName,
				taxId: body.taxId,
				department: body.department,
				employeeId: body.employeeId,
				teamSize: body.teamSize,
				customerType: body.customerType,
				status: "PENDING",
			});

			await submission.save({ session });

			// Update user KYC status
			user.kycStatus = KYCStatus.PENDING_REVIEW;
			await user.save({ session });

			await session.commitTransaction();

			return NextResponse.json(
				{
					code: "SUCCESS",
					message: "KYC submission successful",
					status: user.kycStatus,
					referenceId,
				},
				{ status: 200, headers }
			);
		} catch (error) {
			await session.abortTransaction();
			throw error;
		} finally {
			session.endSession();
		}
	} catch (error) {
		console.error("Submit KYC Error:", error);
		return NextResponse.json(
			{ code: "SERVER_ERROR", message: "Failed to submit KYC data" },
			{ status: 500, headers }
		);
	}
}
