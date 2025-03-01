import { NextResponse } from "next/server"
import { verifyAccessToken } from "@/lib/auth/jwt"
import { connectToDatabase } from "../../../index"
import { withRateLimit } from "@/lib/utils"
import KYCSubmission from "../../../models/KYCSubmission"
import User from "../../../models/User"
import { UserRole } from "@/lib/types"

export async function GET(req: Request) {
  // Rate limit: 30 requests per minute for admin listing
  const { headers, limited } = await withRateLimit(req, "admin_kyc_list", 30)

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
      return NextResponse.json(
        {
          code: "NO_TOKEN",
          message: "Authentication required",
        },
        { status: 401, headers },
      )
    }

    const token = authorization.split(" ")[1]
    const decoded = verifyAccessToken(token)

    if (!decoded) {
      return NextResponse.json(
        {
          code: "INVALID_TOKEN",
          message: "Invalid or expired token",
        },
        { status: 401, headers },
      )
    }

    // Verify admin role
    const admin = await User.findById(decoded.userId)
    if (!admin || admin.role !== UserRole.ADMIN) {
      return NextResponse.json(
        {
          code: "FORBIDDEN",
          message: "Admin access required",
        },
        { status: 403, headers },
      )
    }

    // Get query parameters
    const url = new URL(req.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const status = url.searchParams.get("status") || "PENDING"

    // Calculate skip value
    const skip = (page - 1) * limit

    // Get submissions with pagination
    const [submissions, total] = await Promise.all([
      KYCSubmission.find({ status })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "firstName lastName email"),
      KYCSubmission.countDocuments({ status }),
    ])

    return NextResponse.json(
      {
        submissions: submissions.map((sub) => ({
          id: sub._id,
          userId: sub.userId,
          fullName: sub.fullName,
          status: sub.status,
          createdAt: sub.createdAt,
          role: sub.role,
        })),
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { headers },
    )
  } catch (error) {
    console.error("List KYC Submissions Error:", error)
    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message: "Failed to list KYC submissions",
      },
      { status: 500, headers },
    )
  }
}

