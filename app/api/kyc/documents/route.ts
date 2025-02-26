import { NextResponse } from "next/server";
import { connectToDatabase } from "../../index";
import User from "../../models/User";
import KYCDocument from "../../models/KYCDocument";
import { withAuth } from "@/lib/auth/withAuth";
import { KYCStatus } from "@/lib/types";
import { UTApi } from "uploadthing/server";

// Initialize UploadThing API with token
const utapi = new UTApi();

export async function POST(req: Request) {
	// Rate limit: 10 uploads per hour per user
	const { userId, headers, limited } = await withAuth(
		req,
		"kyc_document_upload",
		10,
		60 * 60 * 1000
	);

	if (limited) {
		return NextResponse.json(
			{
				code: "RATE_LIMIT",
				message: "Too many document uploads. Please try again later.",
			},
			{ status: 429, headers }
		);
	}

	if (!userId) {
		return NextResponse.json(
			{
				code: "UNAUTHORIZED",
				message: "Authentication required",
			},
			{ status: 401, headers }
		);
	}

	try {
		await connectToDatabase();

		// Check if user exists
		const user = await User.findById(userId);
		if (!user) {
			return NextResponse.json(
				{
					code: "USER_NOT_FOUND",
					message: "User not found",
				},
				{ status: 404, headers }
			);
		}

		// Parse form data
		const formData = await req.formData();
		const documentType = formData.get("type") as string;
		const file = formData.get("document") as File;

		if (!documentType || !file) {
			return NextResponse.json(
				{
					code: "INVALID_INPUT",
					message: "Document type and file are required",
				},
				{ status: 400, headers }
			);
		}

		// Validate document type
		const validDocumentTypes = [
			"ID_DOCUMENT",
			"TAX_DOCUMENT",
			"ADDRESS_PROOF",
			"BUSINESS_LICENSE",
		];
		if (!validDocumentTypes.includes(documentType)) {
			return NextResponse.json(
				{
					code: "INVALID_DOCUMENT_TYPE",
					message: "Invalid document type",
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

		// Validate file size (max 5MB)
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

		// Convert File to Buffer for UploadThing
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Generate a unique filename
		const fileExtension = file.name.split(".").pop();
		const fileName = `kyc-${userId}-${documentType}-${Date.now()}.${fileExtension}`;

		// Upload file to UploadThing
		const uploadResult = await utapi.uploadFiles([
			new File([buffer], fileName, { type: file.type }),
		]);

		// Check if upload was successful
		if (!uploadResult || !uploadResult[0]) {
			return NextResponse.json(
				{
					code: "UPLOAD_FAILED",
					message: "Failed to upload file",
				},
				{ status: 500, headers }
			);
		}

		const fileData = uploadResult[0] as { data: { key: string; url: string } };

		// Create document record
		const document = await KYCDocument.create({
			userId,
			type: documentType,
			status: "PENDING",
			url: fileData.data.url,
			originalFilename: file.name,
			mimeType: file.type,
			fileSize: file.size,
			fileKey: fileData.data.key,
		});

		// Update user KYC status if needed
		if (user.kycStatus === KYCStatus.NOT_STARTED) {
			user.kycStatus = KYCStatus.IN_PROGRESS;
			await user.save();
		}

		return NextResponse.json(
			{
				id: document._id,
				type: document.type,
				status: document.status,
				uploadedAt: document.createdAt,
				url: document.url,
			},
			{ headers }
		);
	} catch (error: any) {
		console.error("KYC Document Upload Error:", error);
		return NextResponse.json(
			{
				code: "SERVER_ERROR",
				message: "An unexpected error occurred. Please try again later.",
			},
			{ status: 500, headers }
		);
	}
}

// Add a DELETE endpoint to remove documents
export async function DELETE(req: Request) {
	const { userId, headers } = await withAuth(req);

	if (!userId) {
		return NextResponse.json(
			{
				code: "UNAUTHORIZED",
				message: "Authentication required",
			},
			{ status: 401, headers }
		);
	}

	try {
		await connectToDatabase();

		// Get document ID from URL
		const url = new URL(req.url);
		const documentId = url.searchParams.get("id");

		if (!documentId) {
			return NextResponse.json(
				{
					code: "INVALID_INPUT",
					message: "Document ID is required",
				},
				{ status: 400, headers }
			);
		}

		// Find the document
		const document = await KYCDocument.findById(documentId);
		if (!document) {
			return NextResponse.json(
				{
					code: "NOT_FOUND",
					message: "Document not found",
				},
				{ status: 404, headers }
			);
		}

		// Verify ownership
		if (document.userId !== userId) {
			return NextResponse.json(
				{
					code: "FORBIDDEN",
					message: "You don't have permission to delete this document",
				},
				{ status: 403, headers }
			);
		}

		// Delete from UploadThing if fileKey exists
		if (document.fileKey) {
			await utapi.deleteFiles([document.fileKey]);
		}

		// Delete from database
		await KYCDocument.findByIdAndDelete(documentId);

		return NextResponse.json(
			{
				success: true,
				message: "Document deleted successfully",
			},
			{ headers }
		);
	} catch (error: any) {
		console.error("KYC Document Delete Error:", error);
		return NextResponse.json(
			{
				code: "SERVER_ERROR",
				message: "An unexpected error occurred. Please try again later.",
			},
			{ status: 500, headers }
		);
	}
}
