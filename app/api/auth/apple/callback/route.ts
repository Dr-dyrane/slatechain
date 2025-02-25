// app/api/auth/apple/callback/route.ts

import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "../../../index"
import User from "@/app/api/models/User"
import RefreshToken from "@/app/api/models/RefreshToken"
import { generateAccessToken, generateRefreshToken } from "@/lib/auth/jwt"
import crypto from "crypto"
import { UserRole } from "@/lib/types"

async function fetchApplePublicKey(): Promise<string> {
  // Implement the logic to fetch the Apple public key
  // This might involve fetching from a URL or using a library
  // For now, let's return a placeholder
  return `-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA6jP1bFv0e6jOQ9r\nYSjWvKk+lbwQxYJ/j5/N0YJ1zK6j9j8xW7y9iZ/y7X9v8u7t6r5s4p3q2r1\n234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNopqrstuvwxyz\n-----END PUBLIC KEY-----`
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const code = formData.get("code")
    const idToken = formData.get("id_token")
    const state = formData.get("state")

    if (!code || !idToken) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=invalid_response`)
    }

    // Verify state to prevent CSRF
    // This should be implemented based on your session management strategy

    // Verify the id_token
    const applePublicKey = await fetchApplePublicKey() // Implement this
    const decoded = jwt.verify(idToken.toString(), applePublicKey)

    if (typeof decoded === "string") {
      throw new Error("Invalid token format")
    }

    await connectToDatabase()

    // Find or create user
    let user = await User.findOne({ email: decoded.email })

    if (!user) {
      // Create new user
      user = await User.create({
        email: decoded.email,
        firstName: decoded.given_name || "",
        lastName: decoded.family_name || "",
        isEmailVerified: true, // Apple verifies emails
        password: crypto.randomBytes(32).toString("hex"),
        role: UserRole.CUSTOMER,
        integrations: {
          apple: {
            id: decoded.sub,
            email: decoded.email,
          },
        },
      })
    } else {
      // Update existing user's Apple integration
      user.integrations = {
        ...user.integrations,
        apple: {
          id: decoded.sub,
          email: decoded.email,
        },
      }
      await user.save()
    }

    // Generate our own tokens
    const tokenId = crypto.randomUUID()
    const accessToken = generateAccessToken(user.toAuthJSON())
    const refreshToken = generateRefreshToken(user.toAuthJSON(), tokenId)

    // Store refresh token
    await RefreshToken.create({
      userId: user._id,
      tokenId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    // Redirect to callback with tokens
    const callbackUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`)
    callbackUrl.searchParams.set("access_token", accessToken)
    callbackUrl.searchParams.set("refresh_token", refreshToken)

    return NextResponse.redirect(callbackUrl.toString())
  } catch (error) {
    console.error("Apple OAuth Error:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=oauth_failed`)
  }
}

