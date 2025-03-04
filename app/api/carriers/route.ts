// app/api/carriers/route.ts

import { type NextRequest, NextResponse } from "next/server"
import { handleRequest } from "@/app/api"
import Carrier from "../models/Carrier"

const LIST_RATE_LIMIT = 30
const CREATE_RATE_LIMIT = 10

// GET /api/carriers - List carriers for a specific user
export async function GET(req: NextRequest) {
  return handleRequest(
    req,
    async (req, userId) => {
      // Find all carriers for this user
      const carriers = await Carrier.find({ userId }).sort({ name: 1 })

      // Return raw carriers array
      return NextResponse.json(carriers)
    },
    "carriers_list",
    LIST_RATE_LIMIT,
  )
}

// POST /api/carriers - Create a new carrier
export async function POST(req: NextRequest) {
  return handleRequest(
    req,
    async (req, userId) => {
      const carrierData = await req.json()

      // Validate required fields
      if (!carrierData.name || !carrierData.contactPerson || !carrierData.email || !carrierData.phone) {
        return NextResponse.json(
          {
            code: "INVALID_INPUT",
            message: "Name, contact person, email, and phone are required",
          },
          { status: 400 },
        )
      }

      // Create carrier
      const carrier = await Carrier.create({
        ...carrierData,
        userId,
      })

      return NextResponse.json(carrier)
    },
    "carrier_create",
    CREATE_RATE_LIMIT,
  )
}

