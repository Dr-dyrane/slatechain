// app/api/kyc/documents/route.ts

import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "../../index";
import { withRateLimit } from "@/lib/utils";
import KYCDocument from "../../models/KYCDocument";
import mongoose from "mongoose";

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

async function validateAndExtractFile(req: Request) {
	try {
		const formData = await req.formData();
		const file = formData.get("document") as File;
		const type = formData.get("type") as string;

		if (!file || !type) {
			throw {
				code: "INVALID_INPUT",
				message: "File and document type are required",
				status: 400,
			};
		}

		if (!ALLOWED_FILE_TYPES.includes(file.type)) {
			throw {
				code: "INVALID_FILE_TYPE",
				message: "File must be JPEG, PNG, or PDF",
				status: 400,
			};
		}

		if (file.size > MAX_FILE_SIZE) {
			throw {
				code: "FILE_TOO_LARGE",
				message: "File size must be less than 5MB",
				status: 400,
			};
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const base64String = buffer.toString("base64");

		return {
			base64Url: `data:${file.type};base64,${base64String}`,
			originalFilename: file.name,
			mimeType: file.type,
			fileSize: file.size,
			type,
		};
	} catch (error) {
		throw error;
	}
}

export async function POST(req: Request) {
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

		const { base64Url, originalFilename, mimeType, fileSize, type } =
			await validateAndExtractFile(req);

		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			const [document] = await KYCDocument.create(
				[
					{
						userId: decoded.userId,
						type,
						status: "PENDING",
						url: base64Url,
						originalFilename,
						mimeType,
						fileSize,
					},
				],
				{ session }
			);

			await session.commitTransaction();

			return NextResponse.json(
				{
					id: document._id,
					type: document.type,
					status: document.status,
					url: document.url,
					uploadedAt: document.createdAt,
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

		const status =
			typeof error === "object" && error !== null && "status" in error
				? Number(error.status)
				: 500;
		const message =
			error instanceof Error ? error.message : "Failed to upload document";

		return NextResponse.json(
			{ code: "SERVER_ERROR", message },
			{ status, headers }
		);
	}
}
