// app/api/suppliers/[id]/documents/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Supplier from "../../../models/Supplier";
import SupplierDocument from "../../../models/SupplierDocument";
import KYCDocument from "../../../models/KYCDocument";
import User from "../../../models/User";
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
		const supplier = await Supplier.findOne({
			_id: supplierId,
			assignedManagers: userId,
		});
		return !!supplier;
	}

	if (user.role === UserRole.SUPPLIER) {
		const supplier = await Supplier.findOne({
			_id: supplierId,
			userId,
		});
		return !!supplier;
	}

	return false;
}

// GET /api/suppliers/[id]/documents - List documents for a supplier
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate supplier ID
			if (!mongoose.Types.ObjectId.isValid(params.id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid supplier ID" },
					{ status: 400 }
				);
			}

			// Check access
			const hasAccess = await hasAccessToSupplier(userId, params.id);
			if (!hasAccess) {
				return NextResponse.json(
					{
						code: "UNAUTHORIZED",
						message: "Not authorized to view documents for this supplier",
					},
					{ status: 403 }
				);
			}

			// Find supplier
			const supplier = await Supplier.findById(params.id);
			if (!supplier) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Supplier not found" },
					{ status: 404 }
				);
			}

			// Get supplier documents
			const documents = await SupplierDocument.find({ supplierId: params.id });

			// If supplier is also a user, check for KYC documents
			if (supplier.userId) {
				// Get KYC documents that aren't already linked to supplier documents
				const linkedKycDocIds = documents
					.filter((doc) => doc.kycDocumentId)
					.map((doc) => doc.kycDocumentId);

				const kycDocuments = await KYCDocument.find({
					userId: supplier.userId,
					_id: { $nin: linkedKycDocIds },
				});

				// Convert KYC documents to supplier document format
				const kycAsSupplierDocs = kycDocuments.map((kycDoc) => ({
					id: kycDoc._id,
					supplierId: params.id,
					name: kycDoc.originalFilename || `${kycDoc.type} Document`,
					type: "KYC",
					url: kycDoc.url,
					kycDocumentId: kycDoc._id,
					uploadedAt: kycDoc.createdAt,
					fileSize: kycDoc.fileSize,
					mimeType: kycDoc.mimeType,
					originalFilename: kycDoc.originalFilename,
				}));

				// Combine both document types
				return NextResponse.json([...documents, ...kycAsSupplierDocs]);
			}

			return NextResponse.json(documents);
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
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate supplier ID
			if (!mongoose.Types.ObjectId.isValid(params.id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid supplier ID" },
					{ status: 400 }
				);
			}

			// Check access
			const hasAccess = await hasAccessToSupplier(userId, params.id);
			if (!hasAccess) {
				return NextResponse.json(
					{
						code: "UNAUTHORIZED",
						message: "Not authorized to add documents to this supplier",
					},
					{ status: 403 }
				);
			}

			// Find supplier
			const supplier = await Supplier.findById(params.id);
			if (!supplier) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Supplier not found" },
					{ status: 404 }
				);
			}

			const documentData = await req.json();

			// Validate required fields
			if (!documentData.name || !documentData.type || !documentData.url) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message: "Name, type, and URL are required",
					},
					{ status: 400 }
				);
			}

			// Add supplierId to document data
			documentData.supplierId = params.id;

			// Check if this is linking to an existing KYC document
			if (
				documentData.kycDocumentId &&
				mongoose.Types.ObjectId.isValid(documentData.kycDocumentId)
			) {
				// Verify the KYC document exists and belongs to this supplier
				const kycDoc = await KYCDocument.findOne({
					_id: documentData.kycDocumentId,
					userId: supplier.userId,
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
			}

			// Create document
			const document = await SupplierDocument.create(documentData);

			return NextResponse.json(document);
		},
		"supplier_document_create",
		CREATE_RATE_LIMIT
	);
}
