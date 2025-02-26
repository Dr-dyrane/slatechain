// app/api/notification/bulk/route.ts

import { NextResponse } from "next/server"
import { connectToDatabase } from "../../index"
import Notification from "../../models/Notification"
import { withAuth } from "@/lib/auth/withAuth"

// POST create multiple notifications (for system use)
export async function POST(req: Request) {
  // This endpoint is for internal use (admin/system)
  const { userId, headers } = await withAuth(req)

  if (!userId) {
    return NextResponse.json(
      {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
      { status: 401, headers },
    )
  }

  try {
    await connectToDatabase()

    // Parse request body
    const body = await req.json()

    // Validate required fields
    if (!body.notifications || !Array.isArray(body.notifications) || body.notifications.length === 0) {
      return NextResponse.json(
        {
          code: "INVALID_INPUT",
          message: "A non-empty array of notifications is required",
        },
        { status: 400, headers },
      )
    }

    // Validate each notification
    const validTypes = ["GENERAL", "ORDER_UPDATE", "INVENTORY_ALERT", "INTEGRATION_STATUS"]

    for (const notification of body.notifications) {
      if (!notification.userId || !notification.type || !notification.title || !notification.message) {
        return NextResponse.json(
          {
            code: "INVALID_INPUT",
            message: "Each notification must have userId, type, title, and message",
          },
          { status: 400, headers },
        )
      }

      if (!validTypes.includes(notification.type)) {
        return NextResponse.json(
          {
            code: "INVALID_TYPE",
            message: `Invalid notification type: ${notification.type}`,
          },
          { status: 400, headers },
        )
      }
    }

    // Prepare notifications for bulk insert
    const notificationsToInsert = body.notifications.map((notification: any) => ({
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data || {},
      read: false,
      createdBy: userId,
      createdAt: new Date(),
    }))

    // Create notifications in bulk
    const result = await Notification.insertMany(notificationsToInsert)

    return NextResponse.json(
      {
        success: true,
        count: result.length,
        notifications: result,
      },
      { headers },
    )
  } catch (error: any) {
    console.error("Bulk Create Notifications Error:", error)
    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500, headers },
    )
  }
}

