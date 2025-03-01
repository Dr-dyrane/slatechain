// app/api/kyc/documents/[id]/route.ts

import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { withRateLimit } from "@/lib/utils";
import mongoose from "mongoose";
import KYCDocument from "@/app/api/models/KYCDocument";
import { connectToDatabase } from "@/app/api";

export async function GET(
	req: Request,
	{ params }: { params: { id: string } }
) {
	// Rate limit: 60 requests per minute
	const { headers, limited } = await withRateLimit(req, "document_get", 60);

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

		// Find document
		const document = await KYCDocument.findById(params.id);

		if (!document) {
			return NextResponse.json(
				{
					code: "NOT_FOUND",
					message: "Document not found",
				},
				{ status: 404, headers }
			);
		}

		// Check if user owns the document or is admin
		if (document.userId !== decoded.userId && decoded.role !== "admin") {
			return NextResponse.json(
				{
					code: "FORBIDDEN",
					message: "Access denied",
				},
				{ status: 403, headers }
			);
		}

		return NextResponse.json(
			{
				id: document._id,
				type: document.type,
				status: document.status,
				url: document.url,
				originalFilename: document.originalFilename,
				uploadedAt: document.createdAt,
			},
			{ headers }
		);
	} catch (error) {
		console.error("Get Document Error:", error);
		return NextResponse.json(
			{
				code: "SERVER_ERROR",
				message: "Failed to get document",
			},
			{ status: 500, headers }
		);
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: { id: string } }
) {
	// Rate limit: 10 deletes per minute
	const { headers, limited } = await withRateLimit(req, "document_delete", 10);

	if (limited) {
		return NextResponse.json(
			{
				code: "RATE_LIMIT",
				message: "Too many delete attempts. Please try again later.",
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

		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			// Find document
			const document = await KYCDocument.findById(params.id).session(session);

			if (!document) {
				return NextResponse.json(
					{
						code: "NOT_FOUND",
						message: "Document not found",
					},
					{ status: 404, headers }
				);
			}

			// Check if user owns the document or is admin
			if (
				document.userId.toString() !== decoded.userId &&
				decoded.role !== "admin"
			) {
				return NextResponse.json(
					{
						code: "FORBIDDEN",
						message: "Access denied",
					},
					{ status: 403, headers }
				);
			}

			// Delete document
			await document.deleteOne({ session });

			await session.commitTransaction();

			return NextResponse.json(
				{
					success: true,
					message: "Document deleted successfully",
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
		console.error("Delete Document Error:", error);
		return NextResponse.json(
			{
				code: "SERVER_ERROR",
				message: "Failed to delete document",
			},
			{ status: 500, headers }
		);
	}
}
