import { NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Notification from "../models/Notification";

const LIST_RATE_LIMIT = 300;
const VERIFY_RATE_LIMIT = 30;
const DELETE_RATE_LIMIT = 10;

// GET /api/notifications - List all notifications for a user
export async function GET(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			const notifications = await Notification.find({ userId }).sort({
				createdAt: -1,
			});

			return NextResponse.json(notifications);
		},
		"notifications_list",
		LIST_RATE_LIMIT
	);
}

// PUT /api/notifications - Mark all notifications as read for a user
export async function PUT(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			const result = await Notification.updateMany(
				{ userId, read: false },
				{ read: true }
			);

			return NextResponse.json({ success: true, count: result.modifiedCount });
		},
		"mark_all_read",
		VERIFY_RATE_LIMIT
	);
}

// DELETE /api/notifications - Delete all notifications for a user
export async function DELETE(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			const result = await Notification.deleteMany({ userId });

			return NextResponse.json({
				success: true,
				message: "All notifications deleted successfully",
				count: result.deletedCount,
			});
		},
		"delete_all_notifications",
		DELETE_RATE_LIMIT
	);
}
