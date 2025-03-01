import { NextResponse } from "next/server"
import { verifyAccessToken } from "@/lib/auth/jwt"
import { connectToDatabase } from "../../../index"
import { withRateLimit } from "@/lib/utils"
import KYCSubmission from "../../../models/KYCSubmission"
import User from "../../../models/User"
import { UserRole, KYCStatus } from "@/lib/types"
import mongoose from "mongoose"

export async function POST(req: Request) {
  // Rate limit: 30 verifications per minute
  const { headers, limited } = await withRateLimit(req, "admin_kyc_verify", 30)

  if (limited) {
    return NextResponse.json(
      {
        code: "RATE_LIMIT",
        message: "Too many verification attempts. Please try again later.",
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

    const body = await req.json()
    const { submissionId, status, rejectionReason } = body

    // Validate input
    if (!submissionId || !status) {
      return NextResponse.json(
        {
          code: "INVALID_INPUT",
          message: "Submission ID and status are required",
        },
        { status: 400, headers },
      )
    }

    // Validate status
    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json(
        {
          code: "INVALID_STATUS",
          message: "Status must be either APPROVED or REJECTED",
        },
        { status: 400, headers },
      )
    }

    // Require rejection reason when rejecting
    if (status === "REJECTED" && !rejectionReason) {
      return NextResponse.json(
        {
          code: "INVALID_INPUT",
          message: "Rejection reason is required when rejecting a submission",
        },
        { status: 400, headers },
      )
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      // Find and update submission
      const submission = await KYCSubmission.findById(submissionId).session(session)
      if (!submission) {
        return NextResponse.json(
          {
            code: "NOT_FOUND",
            message: "KYC submission not found",
          },
          { status: 404, headers },
        )
      }

      // Update submission
      submission.status = status
      submission.reviewedBy = decoded.userId
      submission.reviewedAt = new Date()
      if (status === "REJECTED") {
        submission.rejectionReason = rejectionReason
      }
      await submission.save({ session })

      // Update user's KYC status
      const user = await User.findById(submission.userId).session(session)
      if (user) {
        user.kycStatus = status === "APPROVED" ? KYCStatus.APPROVED : KYCStatus.REJECTED
        await user.save({ session })
      }

      await session.commitTransaction()

      return NextResponse.json(
        {
          success: true,
          message: `KYC submission ${status.toLowerCase()} successfully`,
        },
        { headers },
      )
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  } catch (error) {
    console.error("Verify KYC Submission Error:", error)
    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message: "Failed to verify KYC submission",
      },
      { status: 500, headers },
    )
  }
}

