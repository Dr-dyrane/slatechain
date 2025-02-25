// api/orders/payment/route.ts

import { NextResponse } from "next/server"
import { connectToDatabase } from "../../index"

import { withAuth } from "@/lib/auth/withAuth"
import Order from "../../models/Orders"

// POST mark order as paid
export async function POST(req: Request) {
  const { userId, headers } = await withAuth(req)

  if (!userId) {
    return NextResponse.json(
      {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
      { status: 401, headers },
    )
  }

  try {
    await connectToDatabase()

    // Parse request body
    const body = await req.json()

    // Validate required fields
    if (!body.orderId) {
      return NextResponse.json(
        {
          code: "INVALID_INPUT",
          message: "Order ID is required",
        },
        { status: 400, headers },
      )
    }

    // Find order
    const order = await Order.findById(body.orderId)
    if (!order) {
      return NextResponse.json(
        {
          code: "NOT_FOUND",
          message: "Order not found",
        },
        { status: 404, headers },
      )
    }

    // Check if already paid
    if (order.paid) {
      return NextResponse.json(
        {
          code: "ALREADY_PAID",
          message: "Order is already marked as paid",
        },
        { status: 400, headers },
      )
    }

    // Mark as paid
    order.paid = true

    // Update status to PROCESSING if it's PENDING
    if (order.status === "PENDING") {
      order.status = "PROCESSING"
    }

    order.updatedBy = userId
    order.updatedAt = new Date()

    // Add payment details if provided
    if (body.paymentMethod) {
      order.paymentDetails = {
        method: body.paymentMethod,
        transactionId: body.transactionId,
        amount: body.amount || order.totalAmount,
        date: new Date(),
        ...body.additionalDetails,
      }
    }

    await order.save()

    return NextResponse.json(
      {
        success: true,
        order,
      },
      { headers },
    )
  } catch (error: any) {
    console.error("Mark Order as Paid Error:", error)
    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500, headers },
    )
  }
}

