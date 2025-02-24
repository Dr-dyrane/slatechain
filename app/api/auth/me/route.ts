// api/auth/me/route.ts

import { NextResponse } from "next/server"
import { connectToDatabase } from "../../index"
import User from "@/app/api/models/User"
import { verifyAccessToken } from "@/lib/auth/jwt"


export async function GET(req: Request) {
  try {
    await connectToDatabase()

     // Get the Authorization header directly from the request
     const authorization = req.headers.get("Authorization")

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Extract and verify the token
    const token = authorization.split(" ")[1]
    const decoded = verifyAccessToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    // Find the user
    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return user data
    return NextResponse.json({
      user: user.toAuthJSON(),
      accessToken: token, // Return the same access token if it's still valid
    })
  } catch (error) {
    console.error("Get User Data Error:", error)
    return NextResponse.json({ error: "Failed to get user data" }, { status: 500 })
  }
}

