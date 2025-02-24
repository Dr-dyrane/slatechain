// app/api/auth/password/change/route.ts

import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../index"
import User from "@/app/api/models/User"
import { verifyAccessToken } from "@/lib/auth/jwt"
import type { PasswordChangeFormData } from "@/lib/types"

export async function POST(req: Request) {
  try {
    await connectToDatabase()

    // Get and verify token
    const authorization = req.headers.get("Authorization")
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authorization.split(" ")[1]
    const decoded = verifyAccessToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get password data
    const { currentPassword, newPassword }: PasswordChangeFormData = await req.json()

    // Find user
    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify current password
    const isValid = await user.comparePassword(currentPassword)
    if (!isValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })
    }

    // Update password
    user.password = newPassword
    await user.save()

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Password Change Error:", error)
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 })
  }
}

