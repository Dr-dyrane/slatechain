// app/api/suppliers/[id]/documents/[documentId]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import User from "../../../../models/User";
import SupplierDocument from "../../../../models/SupplierDocument";
import { UserRole } from "@/lib/types";
import mongoose from "mongoose";
import KYCDocument from "@/app/api/models/KYCDocument";

const UPDATE_RATE_LIMIT = 20;
const DELETE_RATE_LIMIT = 10;

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

// GET /api/suppliers/[id]/documents/[documentId] - Get a single document
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string; documentId: string } }
) {
	const { id, documentId } = await params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate IDs
			if (
				!mongoose.Types.ObjectId.isValid(id) ||
				!mongoose.Types.ObjectId.isValid(documentId)
			) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid ID format" },
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

			// Find document
			let document = await SupplierDocument.findOne({
				_id: documentId,
				supplierId: id,
			});

			if (!document) {
				// If not found, try to find in KYC documents
				const kycDoc = await KYCDocument.findOne({
					_id: documentId,
					userId: id, // supplier ID is user ID
				});

				if (!kycDoc) {
					return NextResponse.json(
						{ code: "NOT_FOUND", message: "Document not found" },
						{ status: 404 }
					);
				}

				// Convert KYC doc to supplier document format
				document = {
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
				};
			}

			return NextResponse.json(document);
		},
		"supplier_document_get",
		UPDATE_RATE_LIMIT
	);
}

// PUT /api/suppliers/[id]/documents/[documentId] - Update a document
export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string; documentId: string } }
) {
	const { id, documentId } = await params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate IDs
			if (
				!mongoose.Types.ObjectId.isValid(id) ||
				!mongoose.Types.ObjectId.isValid(documentId)
			) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid ID format" },
					{ status: 400 }
				);
			}

			// Check access
			const hasAccess = await hasAccessToSupplier(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{
						code: "UNAUTHORIZED",
						message: "Not authorized to update documents for this supplier",
					},
					{ status: 403 }
				);
			}

			const updates = await req.json();

			// Find document
			const document = await SupplierDocument.findOne({
				_id: documentId,
				supplierId: id,
			});

			if (!document) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Document not found" },
					{ status: 404 }
				);
			}

			// Don't allow changing supplierId
			delete updates.supplierId;

			// Update document
			const updatedDocument = await SupplierDocument.findByIdAndUpdate(
				documentId,
				updates,
				{ new: true }
			);

			return NextResponse.json(updatedDocument);
		},
		"supplier_document_update",
		UPDATE_RATE_LIMIT
	);
}

// DELETE /api/suppliers/[id]/documents/[documentId] - Delete a document
export async function DELETE(
	req: NextRequest,
	{ params }: { params: { id: string; documentId: string } }
) {
	const { id, documentId } = await params;
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate IDs
			if (
				!mongoose.Types.ObjectId.isValid(id) ||
				!mongoose.Types.ObjectId.isValid(documentId)
			) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid ID format" },
					{ status: 400 }
				);
			}

			// Check access
			const hasAccess = await hasAccessToSupplier(userId, id);
			if (!hasAccess) {
				return NextResponse.json(
					{
						code: "UNAUTHORIZED",
						message: "Not authorized to delete documents for this supplier",
					},
					{ status: 403 }
				);
			}

			// Find document
			const document = await SupplierDocument.findOne({
				_id: documentId,
				supplierId: id,
			});

			if (!document) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Document not found" },
					{ status: 404 }
				);
			}

			// Check if this is a KYC document link - if so, don't delete the actual KYC document
			if (document.kycDocumentId) {
				// Just delete the supplier document reference
				await document.deleteOne();
			} else {
				// Delete the document
				await document.deleteOne();
			}

			return NextResponse.json({ success: true });
		},
		"supplier_document_delete",
		DELETE_RATE_LIMIT
	);
}
