// app/api/auth/password/forgot/route.ts

import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../index"
import User from "@/app/api/models/User"
import crypto from "crypto"
import { Redis } from "@upstash/redis"
import { Resend } from "resend"
import { withRateLimit } from "@/lib/utils"
import PasswordResetEmail from "@/lib/emails/password-reset"

const redis = Redis.fromEnv()
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  // Rate limit: 3 attempts per hour
  const { headers, limited } = await withRateLimit(req, "password_reset", 3, 60 * 60 * 1000)

  if (limited) {
    return NextResponse.json(
      { error: "Too many password reset attempts. Please try again later." },
      {
        status: 429,
        headers,
      },
    )
  }

  try {
    await connectToDatabase()
    const { email } = await req.json()

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      // For security, don't reveal if email exists
      return NextResponse.json({ message: "If an account exists, a reset email will be sent" }, { headers })
    }

    // Generate unique reset code
    const resetCode = crypto.randomBytes(32).toString("hex")

    // Store code in Redis with 1 hour expiry
    await redis.set(`pwd_reset:${resetCode}`, user.id, { ex: 3600 })

    // Generate reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?code=${resetCode}`

    // Send email
    await resend.emails.send({
      from: "Your App <noreply@yourdomain.com>",
      to: email,
      subject: "Reset Your Password",
      react: PasswordResetEmail({
        resetLink,
        userName: user.firstName || "there",
      }),
    })

    return NextResponse.json({ message: "If an account exists, a reset email will be sent" }, { headers })
  } catch (error) {
    console.error("Password Reset Request Error:", error)
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      {
        status: 500,
        headers,
      },
    )
  }
}

