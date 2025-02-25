// api/orders/status/route.ts

import { NextResponse } from "next/server"
import { connectToDatabase } from "../../index"

import { withAuth } from "@/lib/auth/withAuth"
import Order from "../../models/Orders"

// PUT update order status
export async function PUT(req: Request) {
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
    if (!body.orderId || !body.status) {
      return NextResponse.json(
        {
          code: "INVALID_INPUT",
          message: "Order ID and status are required",
        },
        { status: 400, headers },
      )
    }

    // Validate status
    const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          code: "INVALID_STATUS",
          message: "Invalid order status",
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

    // Validate status transition
    if (order.status === "CANCELLED" && body.status !== "CANCELLED") {
      return NextResponse.json(
        {
          code: "INVALID_STATUS_TRANSITION",
          message: "Cannot change status of a cancelled order",
        },
        { status: 400, headers },
      )
    }

    if (order.status === "DELIVERED" && body.status !== "DELIVERED") {
      return NextResponse.json(
        {
          code: "INVALID_STATUS_TRANSITION",
          message: "Cannot change status of a delivered order",
        },
        { status: 400, headers },
      )
    }

    // Update order status
    order.status = body.status
    order.updatedBy = userId
    order.updatedAt = new Date()

    // If status is changed to PROCESSING and not paid, mark as paid
    if (body.status === "PROCESSING" && body.markAsPaid && !order.paid) {
      order.paid = true
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
    console.error("Update Order Status Error:", error)
    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500, headers },
    )
  }
}

