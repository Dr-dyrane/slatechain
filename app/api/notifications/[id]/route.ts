// app/api/notifications/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Notification from "@/app/api/models/Notification";
import mongoose from "mongoose";

const RATE_LIMIT = 20; // 20 requests per minute

export async function DELETE(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate notification ID
			if (!mongoose.Types.ObjectId.isValid(params.id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid notification ID" },
					{ status: 400 }
				);
			}

			// Find and delete the notification
			const notification = await Notification.findOneAndDelete({
				_id: params.id,
				userId,
			});

			if (!notification) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Notification not found" },
					{ status: 404 }
				);
			}

			return NextResponse.json({ success: true });
		},
		"notification_delete",
		RATE_LIMIT
	);
}
