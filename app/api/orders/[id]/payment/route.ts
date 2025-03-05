// app/api/orders/[id]/payment/route.ts

import { type NextRequest, NextResponse } from "next/server"
import { handleRequest } from "@/app/api"
import Order from "../../../models/Order"
import { createNotification } from "@/app/actions/notifications"
import mongoose from "mongoose"

const PAYMENT_RATE_LIMIT = 10

// POST /api/orders/[id]/payment - Process payment for an order
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params
  return handleRequest(
    req,
    async (req, userId) => {
      // Validate order ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ code: "INVALID_ID", message: "Invalid order ID" }, { status: 400 })
      }

      const order = await Order.findById(id)
      if (!order) {
        return NextResponse.json({ code: "NOT_FOUND", message: "Order not found" }, { status: 404 })
      }

      // Check if order is already paid
      if (order.paid) {
        return NextResponse.json(
          {
            code: "INVALID_STATUS",
            message: "Order is already paid",
          },
          { status: 400 },
        )
      }

      // Process payment (mock implementation)
      const paymentData = await req.json()

      // Update order status
      order.paid = true
      order.status = "PROCESSING" // Move to processing after payment
      await order.save()

      // Create notification for payment
      await createNotification(
        order.customerId,
        "ORDER_UPDATE",
        `Payment Received for Order ${order.orderNumber}`,
        `Payment has been processed for your order. Your order is now being processed.`,
        {
          orderId: order._id,
          orderNumber: order.orderNumber,
          amount: order.totalAmount,
          paymentMethod: paymentData.method,
        },
      )

      return NextResponse.json({
        success: true,
        order,
      })
    },
    "order_payment",
    PAYMENT_RATE_LIMIT,
  )
}

