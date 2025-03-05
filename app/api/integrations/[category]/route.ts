// app/api/integrations/[category]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import User from "@/app/api/models/User";
import { createNotification } from "@/app/actions/notifications";
import type { IntegrationCategory } from "@/lib/slices/integrationSlice";
import { handleIntegrationActivation } from "@/app/actions/integrations";

const UPDATE_RATE_LIMIT = 20;

// GET /api/integrations/[category] - Get integration details for a category
export async function GET(
	req: NextRequest,
	{ params }: { params: { category: string } }
) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate category
			const category = params.category as IntegrationCategory;
			if (!["ecommerce", "erp_crm", "iot", "bi_tools"].includes(category)) {
				return NextResponse.json(
					{
						success: false,
						code: "INVALID_CATEGORY",
						message: "Invalid integration category",
					},
					{ status: 400 }
				);
			}

			// Fetch user
			const user = await User.findById(userId);
			if (!user) {
				return NextResponse.json(
					{
						success: false,
						code: "USER_NOT_FOUND",
						message: "User not found",
					},
					{ status: 404 }
				);
			}

			// Get integration details
			const integration = user.integrations[category] || {
				enabled: false,
				service: null,
			};

			return NextResponse.json({
				success: true,
				integration,
			});
		},
		"integration_get",
		UPDATE_RATE_LIMIT
	);
}

// PUT /api/integrations/[category] - Update integration for a category
export async function PUT(
	req: NextRequest,
	{ params }: { params: { category: string } }
) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Validate category
			const category = params.category as IntegrationCategory;
			if (!["ecommerce", "erp_crm", "iot", "bi_tools"].includes(category)) {
				return NextResponse.json(
					{
						success: false,
						code: "INVALID_CATEGORY",
						message: "Invalid integration category",
					},
					{ status: 400 }
				);
			}

			// Get request body
			const updates = await req.json();

			// Validate required fields
			if (!updates.service) {
				return NextResponse.json(
					{
						success: false,
						code: "INVALID_INPUT",
						message: "Service name is required",
					},
					{ status: 400 }
				);
			}

			// Fetch user
			const user = await User.findById(userId);
			if (!user) {
				return NextResponse.json(
					{
						success: false,
						code: "USER_NOT_FOUND",
						message: "User not found",
					},
					{ status: 404 }
				);
			}

			// Update integration
			if (!user.integrations) {
				user.integrations = {};
			}

			// Create or update the integration
			user.integrations[category] = {
				enabled: updates.enabled !== undefined ? updates.enabled : true,
				service: updates.service,
				apiKey: updates.apiKey || null,
				...(category === "ecommerce"
					? { storeUrl: updates.storeUrl || null }
					: {}),
			};

			await user.save();

			// Create notification for integration update
			await createNotification(
				userId,
				"INTEGRATION_STATUS",
				`${category.toUpperCase()} Integration Updated`,
				`Your ${category} integration has been ${user.integrations[category].enabled ? "enabled" : "disabled"}.`,
				{
					category,
					service: updates.service,
					enabled: user.integrations[category].enabled,
				}
			);

			// Handle integration activation if enabled
			if (user.integrations[category].enabled) {
				const activationResult = await handleIntegrationActivation(
					userId,
					category,
					updates.service,
					true,
					updates.apiKey || "",
					updates.storeUrl
				);

				// If activation was successful, update the connection status
				if (activationResult.success) {
					// Update connection status and last synced time
					// user.integrations[category].connectionStatus = "connected";
					// user.integrations[category].lastSyncedAt = new Date().toISOString();
					await user.save();
				}
			}

			return NextResponse.json({
				success: true,
				integration: user.integrations[category],
				message: `${category} integration updated successfully`,
			});
		},
		"integration_update",
		UPDATE_RATE_LIMIT
	);
}
