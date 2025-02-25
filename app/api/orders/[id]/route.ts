// api/orders/[id]/route.ts

import { NextResponse } from "next/server"
import { connectToDatabase } from "../../index"

import { withAuth } from "@/lib/auth/withAuth"
import mongoose from "mongoose"
import Order from "../../models/Orders"

// GET single order by ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
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

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        {
          code: "INVALID_ID",
          message: "Invalid order ID format",
        },
        { status: 400, headers },
      )
    }

    const order = await Order.findById(params.id)

    if (!order) {
      return NextResponse.json(
        {
          code: "NOT_FOUND",
          message: "Order not found",
        },
        { status: 404, headers },
      )
    }

    return NextResponse.json(order, { headers })
  } catch (error: any) {
    console.error("Get Order Error:", error)
    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500, headers },
    )
  }
}

// PUT update order
export async function PUT(req: Request, { params }: { params: { id: string } }) {
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

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        {
          code: "INVALID_ID",
          message: "Invalid order ID format",
        },
        { status: 400, headers },
      )
    }

    // Find existing order
    const existingOrder = await Order.findById(params.id)
    if (!existingOrder) {
      return NextResponse.json(
        {
          code: "NOT_FOUND",
          message: "Order not found",
        },
        { status: 404, headers },
      )
    }

    // Parse request body
    const body = await req.json()

    // Validate status if provided
    if (body.status) {
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
    }

    // Recalculate total amount if items are updated
    if (body.items && body.items.length > 0) {
      // Validate items
      for (const item of body.items) {
        if (!item.productId || !item.quantity || item.quantity <= 0 || !item.price) {
          return NextResponse.json(
            {
              code: "INVALID_INPUT",
              message: "Each item must have a valid productId, quantity, and price",
            },
            { status: 400, headers },
          )
        }
      }

      body.totalAmount = body.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    }

    // Add updatedBy field
    body.updatedBy = userId
    body.updatedAt = new Date()

    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(params.id, { $set: body }, { new: true, runValidators: true })

    return NextResponse.json(updatedOrder, { headers })
  } catch (error: any) {
    console.error("Update Order Error:", error)

    // Handle validation errors
    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          errors: Object.values(error.errors).map((err: any) => err.message),
        },
        { status: 400, headers },
      )
    }

    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500, headers },
    )
  }
}

// DELETE order
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        {
          code: "INVALID_ID",
          message: "Invalid order ID format",
        },
        { status: 400, headers },
      )
    }

    // Find order
    const order = await Order.findById(params.id)
    if (!order) {
      return NextResponse.json(
        {
          code: "NOT_FOUND",
          message: "Order not found",
        },
        { status: 404, headers },
      )
    }

    // Check if order can be deleted (e.g., not already shipped)
    if (["SHIPPED", "DELIVERED"].includes(order.status)) {
      return NextResponse.json(
        {
          code: "INVALID_OPERATION",
          message: "Cannot delete an order that has been shipped or delivered",
        },
        { status: 400, headers },
      )
    }

    // Delete order
    await Order.findByIdAndDelete(params.id)

    return NextResponse.json(
      {
        success: true,
        message: "Order deleted successfully",
      },
      { headers },
    )
  } catch (error: any) {
    console.error("Delete Order Error:", error)
    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500, headers },
    )
  }
}

