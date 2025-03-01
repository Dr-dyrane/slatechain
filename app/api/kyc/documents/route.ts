// app/api/kyc/documents/route.ts

import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "../../index";
import { withRateLimit } from "@/lib/utils";
import KYCDocument from "../../models/KYCDocument";
import mongoose from "mongoose";

export async function POST(req: Request) {
	// Rate limit: 10 uploads per minute
	const { headers, limited } = await withRateLimit(req, "document_upload", 10);

	if (limited) {
		return NextResponse.json(
			{
				code: "RATE_LIMIT",
				message: "Too many upload attempts. Please try again later.",
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

		// Parse multipart form data
		const formData = await req.formData();
		const file = formData.get("document") as File;
		const type = formData.get("type") as string;

		if (!file || !type) {
			return NextResponse.json(
				{
					code: "INVALID_INPUT",
					message: "File and document type are required",
				},
				{ status: 400, headers }
			);
		}

		// Validate file type
		const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
		if (!allowedTypes.includes(file.type)) {
			return NextResponse.json(
				{
					code: "INVALID_FILE_TYPE",
					message: "File must be JPEG, PNG, or PDF",
				},
				{ status: 400, headers }
			);
		}

		// Validate file size (5MB max)
		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			return NextResponse.json(
				{
					code: "FILE_TOO_LARGE",
					message: "File size must be less than 5MB",
				},
				{ status: 400, headers }
			);
		}

		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			// Convert file to base64
			const arrayBuffer = await file.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			const base64String = buffer.toString("base64");

			// Create document record
			const document = await KYCDocument.create(
				[
					{
						userId: decoded.userId,
						type,
						status: "PENDING",
						url: `data:${file.type};base64,${base64String}`, // Store as data URL
						originalFilename: file.name,
						mimeType: file.type,
						fileSize: file.size,
					},
				],
				{ session }
			);

			await session.commitTransaction();

			// Return the created document
			return NextResponse.json(
				{
					id: document[0]._id,
					type: document[0].type,
					status: document[0].status,
					url: document[0].url,
					uploadedAt: document[0].createdAt,
				},
				{ headers }
			);
		} catch (error) {
			await session.abortTransaction();
			throw error;
		} finally {
			session.endSession();
		}
	} catch (error) {
		console.error("Document Upload Error:", error);
		return NextResponse.json(
			{
				code: "SERVER_ERROR",
				message: "Failed to upload document",
			},
			{ status: 500, headers }
		);
	}
}
