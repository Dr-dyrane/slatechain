// app/api/auth/wallet/login/route.ts

import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../index"
import User from "@/app/api/models/User"
import RefreshToken from "@/app/api/models/RefreshToken"
import { generateAccessToken, generateRefreshToken } from "@/lib/auth/jwt"
import { ethers } from "ethers"
import crypto from "crypto"
import { withRateLimit } from "@/lib/utils"

export async function POST(req: Request) {
  // Rate limit: 5 attempts per minute
  const { headers, limited } = await withRateLimit(req, "wallet_login", 5)

  if (limited) {
    return NextResponse.json(
      {
        code: "RATE_LIMIT",
        message: "Too many login attempts. Please try again later.",
      },
      { status: 429, headers },
    )
  }

  try {
    await connectToDatabase()

    const { address, message, signature } = await req.json()

    // Input validation
    if (!address || !message || !signature) {
      return NextResponse.json(
        {
          code: "INVALID_INPUT",
          message: "Address, message, and signature are required",
        },
        { status: 400, headers },
      )
    }

    // Verify the signature
    const recoveredAddress = ethers.verifyMessage(message, signature)

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        {
          code: "INVALID_SIGNATURE",
          message: "Invalid signature",
        },
        { status: 401, headers },
      )
    }

    // Find user by wallet address
    const user = await User.findOne({ "blockchain.walletAddress": address })

    if (!user) {
      return NextResponse.json(
        {
          code: "USER_NOT_FOUND",
          message: "No user found with this wallet address",
        },
        { status: 404, headers },
      )
    }

    // Generate unique token ID for refresh token
    const tokenId = crypto.randomUUID()

    // Generate tokens
    const accessToken = generateAccessToken(user.toAuthJSON())
    const refreshToken = generateRefreshToken(user.toAuthJSON(), tokenId)

    // Store refresh token in database
    await RefreshToken.create({
      userId: user.id,
      tokenId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    })

    return NextResponse.json(
      {
        user: user.toAuthJSON(),
        accessToken,
        refreshToken,
      },
      { headers },
    )
  } catch (error) {
    console.error("Wallet Login Error:", error)
    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500, headers },
    )
  }
}

