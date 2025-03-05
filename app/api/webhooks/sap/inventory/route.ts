// app/api/webhooks/sap/inventory/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { createNotification } from "@/app/actions/notifications";
import User from "@/app/api/models/User";
import Inventory from "@/app/api/models/Inventory";
import { verifySAPWebhook } from "@/lib/utils";

export async function POST(req: NextRequest) {
	try {
		// Verify the webhook is from SAP
		const isValid = await verifySAPWebhook(req);
		if (!isValid) {
			return NextResponse.json(
				{ success: false, message: "Invalid webhook signature" },
				{ status: 401 }
			);
		}

		// Get the inventory data from the request
		const inventoryData = await req.json();

		// Find the user with this SAP integration
		const user = await User.findOne({
			"integrations.erp_crm.service": "sap",
			"integrations.erp_crm.enabled": true,
		});

		if (!user) {
			return NextResponse.json(
				{
					success: false,
					message: "No user found with active SAP integration",
				},
				{ status: 404 }
			);
		}

		// Process the inventory update
		const { sapItemId, quantity, price, unitCost } = inventoryData;

		// Find the inventory item by SAP ID
		const inventoryItem = await Inventory.findOne({
			"metadata.sapItemId": sapItemId,
		});
		if (!inventoryItem) {
			return NextResponse.json(
				{ success: false, message: "Inventory item not found" },
				{ status: 404 }
			);
		}

		// Update inventory item
		await Inventory.findByIdAndUpdate(inventoryItem._id, {
			$set: {
				quantity,
				price,
				unitCost,
				"metadata.lastSAPSync": new Date(),
			},
		});

		// Create notification about the inventory update
		await createNotification(
			user._id,
			"INVENTORY_UPDATE",
			"Inventory Updated from SAP",
			`${inventoryItem.name} (SKU: ${inventoryItem.sku}) has been updated from SAP.`,
			{
				itemId: inventoryItem._id,
				sku: inventoryItem.sku,
				newQuantity: quantity,
				oldQuantity: inventoryItem.quantity,
				sapItemId,
			}
		);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error processing SAP inventory webhook:", error);
		return NextResponse.json(
			{
				success: false,
				message:
					error instanceof Error
						? error.message
						: "Error processing SAP inventory webhook",
			},
			{ status: 500 }
		);
	}
}
