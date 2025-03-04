// app/api/suppliers/[id]/chat/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Supplier from "../../../models/Supplier";
import ChatMessage from "../../../models/ChatMessage";
import User from "../../../models/User";
import { UserRole } from "@/lib/types";
import mongoose from "mongoose";

const LIST_RATE_LIMIT = 30;
const CREATE_RATE_LIMIT = 20;

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

// GET /api/suppliers/[id]/chat - Get chat messages for a supplier
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
						message: "Not authorized to view chat for this supplier",
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

			// Get chat messages
			const messages = await ChatMessage.find({ supplierId: params.id }).sort({
				createdAt: 1,
			});

			return NextResponse.json(messages);
		},
		"supplier_chat_list",
		LIST_RATE_LIMIT
	);
}

// POST /api/suppliers/[id]/chat - Send a chat message
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
						message: "Not authorized to chat with this supplier",
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

			// Get user info for sender name
			const user = await User.findById(userId);
			if (!user) {
				return NextResponse.json(
					{ code: "USER_NOT_FOUND", message: "User not found" },
					{ status: 404 }
				);
			}

			const messageData = await req.json();

			// Validate required fields
			if (!messageData.message) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message: "Message content is required",
					},
					{ status: 400 }
				);
			}

			// Create message
			const message = await ChatMessage.create({
				supplierId: params.id,
				senderId: userId,
				senderName: `${user.firstName} ${user.lastName}`,
				message: messageData.message,
			});

			return NextResponse.json(message);
		},
		"supplier_chat_create",
		CREATE_RATE_LIMIT
	);
}
