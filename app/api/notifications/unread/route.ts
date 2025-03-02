// app/api/notifications/unread/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Notification from "@/app/api/models/Notification";

const RATE_LIMIT = 60; // 60 requests per minute (higher limit for frequent checks)

export async function GET(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			const count = await Notification.countDocuments({ userId, read: false });
			return NextResponse.json({ count });
		},
		"notification_unread_count",
		RATE_LIMIT
	);
}
