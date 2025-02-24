import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../index"
import User from "@/app/api/models/User"
import { verifyAccessToken } from "@/lib/auth/jwt"

export async function PUT(req: Request) {
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

    // Get profile data
    const profileData = await req.json()

    // Find and update user
    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Only allow updating specific fields
    const allowedUpdates = ["firstName", "lastName", "phoneNumber", "avatarUrl", "integrations"]

    // Filter out non-allowed fields
    const updates = Object.keys(profileData)
      .filter((key) => allowedUpdates.includes(key))
      .reduce(
        (obj, key) => {
          obj[key] = profileData[key]
          return obj
        },
        {} as Record<string, any>,
      )

    // Update user
    Object.assign(user, updates)
    await user.save()

    return NextResponse.json(user.toAuthJSON())
  } catch (error) {
    console.error("Profile Update Error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}

export async function GET(req: Request) {
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

    // Find user
    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user.toAuthJSON())
  } catch (error) {
    console.error("Get Profile Error:", error)
    return NextResponse.json({ error: "Failed to get profile" }, { status: 500 })
  }
}

