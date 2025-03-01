// app/api/users/route.ts

import { NextResponse } from "next/server"
import { verifyAccessToken } from "@/lib/auth/jwt"
import { connectToDatabase } from "../index"
import { withRateLimit } from "@/lib/utils"
import User from "../models/User"
import { UserRole } from "@/lib/types"
import bcrypt from "bcryptjs"

// GET /api/users - List all users
export async function GET(req: Request) {
  const { headers, limited } = await withRateLimit(req, "list_users", 30)

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

    // Get query parameters for pagination
    const url = new URL(req.url)
    const page = Number(url.searchParams.get("page")) || 1
    const limit = Number(url.searchParams.get("limit")) || 10
    const search = url.searchParams.get("search") || ""

    // Build query
    const query = search
      ? {
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {}

    // Get users with pagination
    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password -refreshToken")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(query),
    ])

    return NextResponse.json(
      {
        users: users.map((user) => user.toAuthJSON()),
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
    console.error("List Users Error:", error)
    return NextResponse.json({ code: "SERVER_ERROR", message: "Failed to fetch users" }, { status: 500, headers })
  }
}

// POST /api/users - Create a new user
export async function POST(req: Request) {
  const { headers, limited } = await withRateLimit(req, "create_user", 10)

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

    const body = await req.json()
    const { email, password, ...userData } = body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { code: "USER_EXISTS", message: "User with this email already exists" },
        { status: 400, headers },
      )
    }

    // Create new user
    const user = new User({
      email,
      password: await bcrypt.hash(password, 10),
      ...userData,
    })

    await user.save()

    return NextResponse.json({ user: user.toAuthJSON() }, { headers })
  } catch (error) {
    console.error("Create User Error:", error)
    return NextResponse.json({ code: "SERVER_ERROR", message: "Failed to create user" }, { status: 500, headers })
  }
}

