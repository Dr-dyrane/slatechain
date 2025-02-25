// app/api/kyc/admin/route.ts

import { NextResponse } from "next/server"
import { connectToDatabase } from "../../index"
import User from "../../models/User"
import KYCSubmission from "../../models/KYCSubmission"
import KYCDocument from "../../models/KYCDocument"
import { KYCStatus } from "@/lib/types"
import { withAuth } from "@/lib/auth/withAuth"

// Admin endpoint to approve or reject KYC submissions
export async function POST(req: Request) {
  try {
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
    if (!body.submissionId || !body.action || !["approve", "reject"].includes(body.action)) {
      return NextResponse.json(
        {
          code: "INVALID_INPUT",
          message: "Valid submission ID and action (approve/reject) are required",
        },
        { status: 400, headers },
      )
    }

    // Find the KYC submission
    const submission = await KYCSubmission.findById(body.submissionId)
    if (!submission) {
      return NextResponse.json(
        {
          code: "NOT_FOUND",
          message: "KYC submission not found",
        },
        { status: 404, headers },
      )
    }

    // Update submission status
    submission.status = body.action === "approve" ? "APPROVED" : "REJECTED"
    submission.reviewedBy = userId
    submission.reviewedAt = new Date()

    if (body.action === "reject" && body.rejectionReason) {
      submission.rejectionReason = body.rejectionReason
    }

    await submission.save()

    // Update user KYC status
    const user = await User.findById(submission.userId)
    if (user) {
      user.kycStatus = body.action === "approve" ? KYCStatus.APPROVED : KYCStatus.REJECTED
      await user.save()
    }

    // If rejecting, update document statuses as well
    if (body.action === "reject") {
      await KYCDocument.updateMany(
        { userId: submission.userId },
        { status: "REJECTED", rejectionReason: body.rejectionReason || "KYC submission rejected" },
      )
    }

    return NextResponse.json(
      {
        success: true,
        action: body.action,
        submissionId: submission._id,
      },
      { headers },
    )
  } catch (error: any) {
    console.error("KYC Admin Action Error:", error)
    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 },
    )
  }
}

