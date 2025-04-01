// app/api/payments/route.ts

import { type NextRequest, NextResponse } from "next/server"
import { handleRequest } from "@/app/api" // Your auth/rate limiting middleware
import Stripe from "stripe"

// Initialize Stripe with your secret key
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ""
export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia", // Use the latest version
})

// Rate limit for payment intent creation
const PAYMENT_INTENT_RATE_LIMIT = 10

export async function POST(req: NextRequest) {
  return handleRequest(
    req,
    async (req, userId) => {
      try {
        // Parse request body
        const { amount, orderId, metadata = {} } = await req.json()

        // Validate amount
        if (!amount || amount <= 0) {
          return NextResponse.json({ code: "INVALID_AMOUNT", message: "Invalid payment amount" }, { status: 400 })
        }

        // Create a payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount, // Amount in cents
          currency: "usd",
          metadata: {
            orderId,
            userId,
            ...metadata,
          },
          // Optional: automatic_payment_methods: { enabled: true }
        })

        // Return the client secret to the client
        return NextResponse.json({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        })
      } catch (error) {
        console.error("Error creating payment intent:", error)
        return NextResponse.json(
          {
            code: "PAYMENT_INTENT_ERROR",
            message: "Failed to create payment intent",
            details: error instanceof Error ? error.message : String(error),
          },
          { status: 500 },
        )
      }
    },
    "payment_intent",
    PAYMENT_INTENT_RATE_LIMIT,
  )
}

