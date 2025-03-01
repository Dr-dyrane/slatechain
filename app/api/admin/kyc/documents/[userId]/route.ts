// app/api/admin/kyc/documents/[userId]/route.ts

import { NextResponse } from "next/server"
import { verifyAccessToken } from "@/lib/auth/jwt"
import { connectToDatabase } from "../../../../index"
import { withRateLimit } from "@/lib/utils"
import KYCDocument from "../../../../models/KYCDocument"
import User from "../../../../models/User"
import { UserRole } from "@/lib/types"

export async function GET(req: Request, { params }: { params: { userId: string } }) {
  const { headers, limited } = await withRateLimit(req, "fetch_user_kyc", 30)

  if (limited) {
    return NextResponse.json(
      {
        code: "RATE_LIMIT",
        message: "Too many requests. Please try again later.",
      },
      { status: 429, headers },
    )
  }

  try {
    await connectToDatabase()

    // Verify authentication token
    const authorization = req.headers.get("Authorization")
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ code: "NO_TOKEN", message: "Authentication required" }, { status: 401, headers })
    }

    const token = authorization.split(" ")[1]
    const decoded = verifyAccessToken(token)

    if (!decoded) {
      return NextResponse.json({ code: "INVALID_TOKEN", message: "Invalid or expired token" }, { status: 401, headers })
    }

    // Verify admin role
    const admin = await User.findById(decoded.userId)
    if (!admin || admin.role !== UserRole.ADMIN) {
      return NextResponse.json({ code: "FORBIDDEN", message: "Admin access required" }, { status: 403, headers })
    }

    // Fetch user's KYC documents
    const documents = await KYCDocument.find({ userId: params.userId }).sort({ createdAt: -1 })

    return NextResponse.json({ documents }, { headers })
  } catch (error) {
    console.error("Fetch User KYC Documents Error:", error)
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "Failed to fetch KYC documents" },
      { status: 500, headers },
    )
  }
}

