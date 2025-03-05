// app/api/shopify/shop/route.ts

import { type NextRequest, NextResponse } from "next/server"
import { handleRequest } from "@/app/api"
import User from "@/app/api/models/User"
import { mockShop } from "@/lib/mock/mock-shopify-orders"

const FETCH_RATE_LIMIT = 30

// GET /api/shopify/shop - Get Shopify shop details
export async function GET(req: NextRequest) {
  return handleRequest(
    req,
    async (req, userId) => {
      // Fetch user
      const user = await User.findById(userId)
      if (!user) {
        return NextResponse.json(
          {
            success: false,
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
          { status: 404 },
        )
      }

      // Check if Shopify integration is enabled
      const shopifyIntegration = user.integrations?.ecommerce
      if (!shopifyIntegration || !shopifyIntegration.enabled || shopifyIntegration.service !== "shopify") {
        return NextResponse.json(
          {
            success: false,
            code: "INTEGRATION_DISABLED",
            message: "Shopify integration is not enabled",
          },
          { status: 400 },
        )
      }

      // Check if API key and store URL are set
      if (!shopifyIntegration.apiKey || !shopifyIntegration.storeUrl) {
        return NextResponse.json(
          {
            success: false,
            code: "MISSING_CREDENTIALS",
            message: "Shopify API key or store URL is missing",
          },
          { status: 400 },
        )
      }

      try {
        // In a real implementation, we would fetch shop details from Shopify API
        // For now, return mock data

        // Example of how to fetch from Shopify API:
        /*
        const response = await axios.get(`${shopifyIntegration.storeUrl}/admin/api/2023-07/shop.json`, {
          headers: {
            'X-Shopify-Access-Token': shopifyIntegration.apiKey
          }
        });
        const shop = response.data.shop;
        */

        // Using mock data for now
        const shop = mockShop

        return NextResponse.json({
          success: true,
          shop,
        })
      } catch (error: any) {
        console.error("Shopify API Error:", error)
        return NextResponse.json(
          {
            success: false,
            code: "SHOPIFY_API_ERROR",
            message: error.message || "Failed to fetch Shopify shop details",
          },
          { status: 500 },
        )
      }
    },
    "shopify_shop",
    FETCH_RATE_LIMIT,
  )
}

