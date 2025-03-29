// app/api/blockchain/verify-wallet/route.ts

import { NextRequest, NextResponse } from "next/server";
import { handleRequest } from "../../index";
import { ethers } from "ethers";

export async function POST(req: NextRequest) {
  return handleRequest(
    req,
    async (req, userId) => {
      try {
        const { walletAddress, signature, message } = await req.json();

        // Input validation
        if (!walletAddress || !signature || !message) {
          return NextResponse.json(
            {
              code: "INVALID_INPUT",
              message: "Wallet address, signature, and message are required",
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

        return NextResponse.json({
          success: true,
          message: "Wallet verified successfully",
          verified: true,
        });
      } catch (error) {
        console.error("Verify Wallet Error:", error);
        return NextResponse.json(
          {
            code: "SERVER_ERROR",
            message: "An unexpected error occurred. Please try again later.",
          },
          { status: 500 }
        );
      }
    },
    "verify_wallet",
    20
  );
}
