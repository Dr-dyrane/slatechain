import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import User from "../../../models/User";
import SupplierDocument from "../../../models/SupplierDocument";
import KYCDocument from "../../../models/KYCDocument";
import { UserRole } from "@/lib/types";
import mongoose from "mongoose";

const LIST_RATE_LIMIT = 30;
const CREATE_RATE_LIMIT = 10;

// Helper function to check if user has access to supplier
async function hasAccessToSupplier(userId: string, supplierId: string) {
	const user = await User.findById(userId);
	if (!user) return false;

	if (user.role === UserRole.ADMIN) return true;

	if (user.role === UserRole.MANAGER) {
		const supplier = await User.findOne({
			_id: supplierId,
			role: UserRole.SUPPLIER,
			assignedManagers: { $in: [userId] },
		});
		return !!supplier;
	}

	if (user.role === UserRole.SUPPLIER) {
		return userId === supplierId;
	}

	return false;
}

// Helper function to convert file to base64
async function validateAndExtractFile(formData: FormData) {
	try {
		const file = formData.get("document") as File;
		const type = formData.get("type") as string;

		if (!file || !type) {
			throw {
				code: "INVALID_INPUT",
				message: "File and document type are required",
				status: 400,
			};
		}

		const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
		const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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

// GET /api/suppliers/[id]/documents - List documents for a supplier
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = await params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate supplier ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid supplier ID" },
					{ status: 400 }
				);
			}

			// Check access
			const hasAccess = await hasAccessToSupplier(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{
						code: "UNAUTHORIZED",
						message: "Not authorized to view documents for this supplier",
					},
					{ status: 403 }
				);
			}

			// Find supplier (user with supplier role)
			const supplier = await User.findOne({
				_id: id,
				role: UserRole.SUPPLIER,
			});

			if (!supplier) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Supplier not found" },
					{ status: 404 }
				);
			}

			// Get supplier documents
			const documents = await SupplierDocument.find({ supplierId: id });

			// Get KYC documents that aren't already linked to supplier documents
			const linkedKycDocIds = documents
				.filter((doc) => doc.kycDocumentId)
				.map((doc) => doc.kycDocumentId);

			const kycDocuments = await KYCDocument.find({
				userId: id, // Now the supplier ID is the user ID
				_id: { $nin: linkedKycDocIds },
			});

			// Convert KYC documents to supplier document format
			const kycAsSupplierDocs = kycDocuments.map((kycDoc) => ({
				id: kycDoc._id,
				supplierId: id,
				name: kycDoc.originalFilename || `${kycDoc.type} Document`,
				type: kycDoc.type || "KYC",
				url: kycDoc.url,
				kycDocumentId: kycDoc._id,
				uploadedAt: kycDoc.createdAt,
				fileSize: kycDoc.fileSize,
				mimeType: kycDoc.mimeType,
				originalFilename: kycDoc.originalFilename,
			}));

			// Combine both document types
			return NextResponse.json([...documents, ...kycAsSupplierDocs]);
		},
		"supplier_documents_list",
		LIST_RATE_LIMIT
	);
}

// POST /api/suppliers/[id]/documents - Add a document to a supplier
export async function POST(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = await params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate supplier ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid supplier ID" },
					{ status: 400 }
				);
			}

			// Check access
			const hasAccess = await hasAccessToSupplier(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{
						code: "UNAUTHORIZED",
						message: "Not authorized to add documents to this supplier",
					},
					{ status: 403 }
				);
			}

			// Find supplier (user with supplier role)
			const supplier = await User.findOne({
				_id: id,
				role: UserRole.SUPPLIER,
			});

			if (!supplier) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Supplier not found" },
					{ status: 404 }
				);
			}

			// Check if this is a form data request (file upload) or JSON request
			const contentType = req.headers.get("content-type") || "";

			let documentData: any;

			if (contentType.includes("multipart/form-data")) {
				// Handle file upload with base64 conversion
				try {
					const formData = await req.formData();
					const fileData = await validateAndExtractFile(formData);

					documentData = {
						supplierId: id,
						name: fileData.originalFilename,
						type: fileData.type,
						url: fileData.base64Url, // Always use base64 URL
						fileSize: fileData.fileSize,
						mimeType: fileData.mimeType,
						originalFilename: fileData.originalFilename,
					};
				} catch (error: any) {
					return NextResponse.json(
						{
							code: error.code || "UPLOAD_ERROR",
							message: error.message || "Failed to process document upload",
						},
						{ status: error.status || 500 }
					);
				}
			} else {
				// Handle JSON request
				documentData = await req.json();

				// Validate required fields
				if (!documentData.name || !documentData.type) {
					return NextResponse.json(
						{
							code: "INVALID_INPUT",
							message: "Name and type are required",
						},
						{ status: 400 }
					);
				}

				// Ignore any URL passed from frontend if it's not a base64 URL
				if (documentData.url && !documentData.url.startsWith("data:")) {
					delete documentData.url;
				}
			}

			// Add supplierId to document data
			documentData.supplierId = id;

			// Check if this is linking to an existing KYC document
			if (
				documentData.kycDocumentId &&
				mongoose.Types.ObjectId.isValid(documentData.kycDocumentId)
			) {
				// Verify the KYC document exists and belongs to this supplier
				const kycDoc = await KYCDocument.findOne({
					_id: documentData.kycDocumentId,
					userId: id, // Now the supplier ID is the user ID
				});

				if (!kycDoc) {
					return NextResponse.json(
						{
							code: "INVALID_KYC_DOCUMENT",
							message:
								"KYC document not found or does not belong to this supplier",
						},
						{ status: 400 }
					);
				}

				// Use the KYC document URL if no URL is provided
				if (!documentData.url) {
					documentData.url = kycDoc.url;
				}
			}

			// Create document
			const document = await SupplierDocument.create(documentData);

			return NextResponse.json(document);
		},
		"supplier_document_create",
		CREATE_RATE_LIMIT
	);
}
