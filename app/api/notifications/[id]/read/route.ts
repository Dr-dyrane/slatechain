// app/api/notificatons/[id]/read/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Notification from "@/app/api/models/Notification";
import mongoose from "mongoose";

const RATE_LIMIT = 30; // 30 requests per minute

export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = await params
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate notification ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid notification ID" },
					{ status: 400 }
				);
			}

			// Find and update the notification
			const notification = await Notification.findOneAndUpdate(
				{ _id: id, userId },
				{ read: true },
				{ new: true }
			);

			if (!notification) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Notification not found" },
					{ status: 404 }
				);
			}

			return NextResponse.json(notification);
		},
		"notification_read",
		RATE_LIMIT
	);
}
