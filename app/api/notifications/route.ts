// app/api/notification/route.ts

import { NextResponse } from "next/server"
import { connectToDatabase } from "../index"
import Notification from "../models/Notification"
import { withAuth } from "@/lib/auth/withAuth"

// GET all notifications for the authenticated user
export async function GET(req: Request) {
  // Rate limit: 100 requests per hour
  const { userId, headers, limited } = await withAuth(req, "fetch_notifications", 100, 60 * 60 * 1000)

  if (limited) {
    return NextResponse.json(
      {
        code: "RATE_LIMIT",
        message: "Too many requests. Please try again later.",
      },
      { status: 429, headers },
    )
  }

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

    // Get query parameters for filtering
    const url = new URL(req.url)
    const type = url.searchParams.get("type")
    const read = url.searchParams.get("read")
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const before = url.searchParams.get("before") // For pagination (createdAt before this timestamp)

    // Build query
    const query: any = { userId }

    // Only add filters if they are provided
    if (type) query.type = type
    if (read !== null) query.read = read === "true"
    if (before) query.createdAt = { $lt: new Date(before) }

    // Fetch notifications with sorting and limit
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(limit)

    // Get unread count
    const unreadCount = await Notification.countDocuments({ userId, read: false })

    return NextResponse.json(
      {
        notifications,
        unreadCount,
        hasMore: notifications.length === limit,
      },
      { headers },
    )
  } catch (error: any) {
    console.error("Fetch Notifications Error:", error)
    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500, headers },
    )
  }
}

// POST create a new notification
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
    if (!body.recipientId || !body.type || !body.title || !body.message) {
      return NextResponse.json(
        {
          code: "INVALID_INPUT",
          message: "Recipient ID, type, title, and message are required",
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

    // Create notification
    const notification = await Notification.create({
      userId: body.recipientId,
      type: body.type,
      title: body.title,
      message: body.message,
      data: body.data || {},
      read: false,
      createdBy: userId,
    })

    return NextResponse.json(notification, { headers })
  } catch (error: any) {
    console.error("Create Notification Error:", error)
    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500, headers },
    )
  }
}

// PUT mark all notifications as read
export async function PUT(req: Request) {
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

    // Update all unread notifications for this user
    const result = await Notification.updateMany({ userId, read: false }, { $set: { read: true } })

    return NextResponse.json(
      {
        success: true,
        count: result.modifiedCount,
      },
      { headers },
    )
  } catch (error: any) {
    console.error("Mark All Read Error:", error)
    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500, headers },
    )
  }
}

