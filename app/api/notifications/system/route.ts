// app/api/notification/system/route.ts

import { NextResponse } from "next/server"
import { connectToDatabase } from "../../index"
import Notification from "../../models/Notification"
import User from "../../models/User"
import { withAuth } from "@/lib/auth/withAuth"

// POST create system notification (to all users or specific roles)
export async function POST(req: Request) {
  // This endpoint is for admin use only
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

    // Check if user is an admin
    const adminUser = await User.findById(userId)
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        {
          code: "FORBIDDEN",
          message: "Admin access required",
        },
        { status: 403, headers },
      )
    }

    // Parse request body
    const body = await req.json()

    // Validate required fields
    if (!body.type || !body.title || !body.message) {
      return NextResponse.json(
        {
          code: "INVALID_INPUT",
          message: "Type, title, and message are required",
        },
        { status: 400, headers },
      )
    }

    // Validate notification type
    const validTypes = ["GENERAL", "ORDER_UPDATE", "INVENTORY_ALERT", "INTEGRATION_STATUS"]
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        {
          code: "INVALID_TYPE",
          message: "Invalid notification type",
        },
        { status: 400, headers },
      )
    }

    // Build query for target users
    const userQuery: any = {}

    // Filter by role if specified
    if (body.targetRole) {
      userQuery.role = body.targetRole
    }

    // Get target users
    const users = await User.find(userQuery).select("_id")

    if (users.length === 0) {
      return NextResponse.json(
        {
          code: "NO_RECIPIENTS",
          message: "No users match the target criteria",
        },
        { status: 400, headers },
      )
    }

    // Prepare notifications for bulk insert
    const notificationsToInsert = users.map((user) => ({
      userId: user._id.toString(),
      type: body.type,
      title: body.title,
      message: body.message,
      data: body.data || {},
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
        recipientCount: users.length,
      },
      { headers },
    )
  } catch (error: any) {
    console.error("System Notification Error:", error)
    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500, headers },
    )
  }
}

