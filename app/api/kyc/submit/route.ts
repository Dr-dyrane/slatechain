// app/api/kyc/submit/route.ts

import { NextResponse } from "next/server"
import { connectToDatabase } from "../../index"
import User from "../../models/User"
import KYCSubmission from "../../models/KYCSubmission"
import KYCDocument from "../../models/KYCDocument" // Import KYCDocument
import { KYCStatus } from "@/lib/types"
import { withAuth } from "@/lib/auth/withAuth"
import crypto from "crypto"

export async function POST(req: Request) {
  // Rate limit: 3 submissions per day per user
  const { userId, headers, limited } = await withAuth(req, "kyc_submit", 3, 24 * 60 * 60 * 1000)

  if (limited) {
    return NextResponse.json(
      {
        code: "RATE_LIMIT",
        message: "Too many submission attempts. Please try again later.",
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

    // Parse request body
    const body = await req.json()

    // Validate required fields
    if (!body.fullName || !body.dateOfBirth || !body.address || !body.role) {
      return NextResponse.json(
        {
          code: "INVALID_INPUT",
          message: "All required fields must be provided",
        },
        { status: 400, headers },
      )
    }

    // Find user
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json(
        {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
        { status: 404, headers },
      )
    }

    // Check if user has uploaded required documents
    const documentsCount = await KYCDocument.countDocuments({ userId })
    if (documentsCount === 0) {
      return NextResponse.json(
        {
          code: "DOCUMENTS_REQUIRED",
          message: "Please upload required documents before submitting",
        },
        { status: 400, headers },
      )
    }

    // Generate reference ID
    const referenceId = crypto.randomUUID()

    // Create KYC submission
    await KYCSubmission.create({
      userId,
      referenceId,
      fullName: body.fullName,
      dateOfBirth: body.dateOfBirth,
      address: body.address,
      role: body.role,
      companyName: body.companyName,
      taxId: body.taxId,
      department: body.department,
      employeeId: body.employeeId,
      teamSize: body.teamSize,
      customerType: body.customerType,
      status: "PENDING",
    })

    // Update user KYC status
    user.kycStatus = KYCStatus.PENDING_REVIEW
    await user.save()

    return NextResponse.json(
      {
        status: KYCStatus.PENDING_REVIEW,
        referenceId,
      },
      { headers },
    )
  } catch (error: any) {
    console.error("KYC Submission Error:", error)
    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500, headers },
    )
  }
}

