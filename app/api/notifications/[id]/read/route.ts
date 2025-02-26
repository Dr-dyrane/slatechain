// app/api/notification/[id]/route.ts

import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../index"
import Notification from "../../../models/Notification"
import { withAuth } from "@/lib/auth/withAuth"
import mongoose from "mongoose"

// GET single notification
export async function GET(req: Request, { params }: { params: { id: string } }) {
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

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        {
          code: "INVALID_ID",
          message: "Invalid notification ID format",
        },
        { status: 400, headers },
      )
    }

    const notification = await Notification.findById(params.id)

    if (!notification) {
      return NextResponse.json(
        {
          code: "NOT_FOUND",
          message: "Notification not found",
        },
        { status: 404, headers },
      )
    }

    // Verify ownership
    if (notification.userId !== userId) {
      return NextResponse.json(
        {
          code: "FORBIDDEN",
          message: "You don't have permission to access this notification",
        },
        { status: 403, headers },
      )
    }

    return NextResponse.json(notification, { headers })
  } catch (error: any) {
    console.error("Get Notification Error:", error)
    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500, headers },
    )
  }
}

// PUT update notification (mark as read)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
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

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        {
          code: "INVALID_ID",
          message: "Invalid notification ID format",
        },
        { status: 400, headers },
      )
    }

    // Find notification
    const notification = await Notification.findById(params.id)

    if (!notification) {
      return NextResponse.json(
        {
          code: "NOT_FOUND",
          message: "Notification not found",
        },
        { status: 404, headers },
      )
    }

    // Verify ownership
    if (notification.userId !== userId) {
      return NextResponse.json(
        {
          code: "FORBIDDEN",
          message: "You don't have permission to update this notification",
        },
        { status: 403, headers },
      )
    }

    // Parse request body
    const body = await req.json()

    // Update notification (only read status can be updated)
    if (body.read !== undefined) {
      notification.read = body.read
      await notification.save()
    }

    return NextResponse.json(notification, { headers })
  } catch (error: any) {
    console.error("Update Notification Error:", error)
    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500, headers },
    )
  }
}

// DELETE notification
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        {
          code: "INVALID_ID",
          message: "Invalid notification ID format",
        },
        { status: 400, headers },
      )
    }

    // Find notification
    const notification = await Notification.findById(params.id)

    if (!notification) {
      return NextResponse.json(
        {
          code: "NOT_FOUND",
          message: "Notification not found",
        },
        { status: 404, headers },
      )
    }

    // Verify ownership
    if (notification.userId !== userId) {
      return NextResponse.json(
        {
          code: "FORBIDDEN",
          message: "You don't have permission to delete this notification",
        },
        { status: 403, headers },
      )
    }

    // Delete notification
    await Notification.findByIdAndDelete(params.id)

    return NextResponse.json(
      {
        success: true,
        message: "Notification deleted successfully",
      },
      { headers },
    )
  } catch (error: any) {
    console.error("Delete Notification Error:", error)
    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500, headers },
    )
  }
}

