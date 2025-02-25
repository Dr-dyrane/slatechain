// app/api/notification/unread/route.ts

import { NextResponse } from "next/server"
import { connectToDatabase } from "../../index"
import Notification from "../../models/Notification"
import { withAuth } from "@/lib/auth/withAuth"

// GET unread notification count
export async function GET(req: Request) {
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

    // Count unread notifications
    const count = await Notification.countDocuments({ userId, read: false })

    return NextResponse.json({ count }, { headers })
  } catch (error: any) {
    console.error("Unread Count Error:", error)
    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500, headers },
    )
  }
}

