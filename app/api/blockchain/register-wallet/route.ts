// app/api/blockchain/register-wallet/route.ts

import { NextRequest, NextResponse } from "next/server";
import { handleRequest } from "../../index";
import User from "@/app/api/models/User";
import { ethers } from "ethers";

export async function POST(req: NextRequest) {
  return handleRequest(
    req,
    async (req, userId) => {
      try {
        const { walletAddress, signature, message } = await req.json();

        // Input validation
        if (!walletAddress || !signature || !message || !userId) {
          return NextResponse.json(
            {
              code: "INVALID_INPUT",
              message: "Wallet address, signature, message, and userId are required",
            },
            { status: 400 }
          );
        }

        // Verify the signature
        const recoveredAddress = ethers.verifyMessage(message, signature);

        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
          return NextResponse.json(
            {
              code: "INVALID_SIGNATURE",
              message: "Invalid signature",
            },
            { status: 401 }
          );
        }

        // Check if wallet is already registered to another user
        const existingUser = await User.findOne({ "blockchain.walletAddress": walletAddress });
        if (existingUser && existingUser._id.toString() !== userId) {
          return NextResponse.json(
            {
              code: "WALLET_EXISTS",
              message: "This wallet address is already registered to another user",
            },
            { status: 400 }
          );
        }

        // Find user and update wallet information
        const user = await User.findById(userId);
        if (!user) {
          return NextResponse.json(
            {
              code: "USER_NOT_FOUND",
              message: "User not found",
            },
            { status: 404 }
          );
        }

        // Update user with wallet information
        user.blockchain = {
          walletAddress,
          registeredAt: new Date(),
        };

        await user.save();

        return NextResponse.json({
          success: true,
          message: "Wallet registered successfully",
          user: user.toAuthJSON(),
        });
      } catch (error) {
        console.error("Register Wallet Error:", error);
        return NextResponse.json(
          {
            code: "SERVER_ERROR",
            message: "An unexpected error occurred. Please try again later.",
          },
          { status: 500 }
        );
      }
    },
    "register_wallet",
    10
  );
}
