// api/orders/route.ts

import { NextResponse } from "next/server"
import { connectToDatabase } from "../index"

import { withAuth } from "@/lib/auth/withAuth"
import Order from "../models/Orders"

// GET all orders
export async function GET(req: Request) {
  // Rate limit: 100 requests per hour
  const { userId, headers, limited } = await withAuth(req, "fetch_orders", 100, 60 * 60 * 1000)

  if (limited) {
    return NextResponse.json(
      {
        code: "RATE_LIMIT",
        message: "Too many requests. Please try again later.",
      },
      { status: 429, headers },
    )
  }

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

    // Get query parameters for filtering
    const url = new URL(req.url)
    const status = url.searchParams.get("status")
    const customerId = url.searchParams.get("customerId")
    const paid = url.searchParams.get("paid")

    // Build query
    const query: any = {}

    // Only add filters if they are provided
    if (status) query.status = status
    if (customerId) query.customerId = customerId
    if (paid !== null) query.paid = paid === "true"

    // Fetch orders with pagination
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    const orders = await Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)

    const total = await Order.countDocuments(query)

    return NextResponse.json(
      {
        orders,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { headers },
    )
  } catch (error: any) {
    console.error("Fetch Orders Error:", error)
    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500, headers },
    )
  }
}

// POST create new order
export async function POST(req: Request) {
  // Rate limit: 20 orders per hour
  const { userId, headers, limited } = await withAuth(req, "create_order", 20, 60 * 60 * 1000)

  if (limited) {
    return NextResponse.json(
      {
        code: "RATE_LIMIT",
        message: "Too many order creation attempts. Please try again later.",
      },
      { status: 429, headers },
    )
  }

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
    if (!body.customerId || !body.items || !body.items.length) {
      return NextResponse.json(
        {
          code: "INVALID_INPUT",
          message: "Customer ID and at least one item are required",
        },
        { status: 400, headers },
      )
    }

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

    // Calculate total amount
    const totalAmount = body.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Create order
    const order = await Order.create({
      orderNumber,
      customerId: body.customerId,
      items: body.items,
      totalAmount,
      status: body.status || "PENDING",
      paid: body.paid || false,
      shippingAddress: body.shippingAddress,
      billingAddress: body.billingAddress,
      notes: body.notes,
      createdBy: userId,
    })

    return NextResponse.json(order, { headers })
  } catch (error: any) {
    console.error("Create Order Error:", error)

    // Handle duplicate order number
    if (error.code === 11000 && error.keyPattern?.orderNumber) {
      return NextResponse.json(
        {
          code: "DUPLICATE_ORDER",
          message: "Order number already exists. Please try again.",
        },
        { status: 409, headers },
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

