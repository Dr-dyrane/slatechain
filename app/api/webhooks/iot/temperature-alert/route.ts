// app/api/webhooks/iot/temperature-alert/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { createNotification } from "@/app/actions/notifications";
import User from "@/app/api/models/User";
import Warehouse from "@/app/api/models/Warehouse";
import { verifyIoTWebhook } from "@/lib/utils";

export async function POST(req: NextRequest) {
	try {
		// Verify the webhook is from IoT platform
		const isValid = await verifyIoTWebhook(req);
		if (!isValid) {
			return NextResponse.json(
				{ success: false, message: "Invalid webhook signature" },
				{ status: 401 }
			);
		}

		// Get the alert data from the request
		const alertData = await req.json();

		// Find the user with this IoT integration
		const user = await User.findOne({
			"integrations.iot.service": "iot_monitoring",
			"integrations.iot.enabled": true,
		});

		if (!user) {
			return NextResponse.json(
				{
					success: false,
					message: "No user found with active IoT integration",
				},
				{ status: 404 }
			);
		}

		// Process the temperature alert
		const {
			sensorId,
			temperature,
			threshold,
			warehouseId,
			zoneName,
			alertType,
		} = alertData;

		// Find the warehouse
		const warehouse = await Warehouse.findOne({
			"metadata.iotDeviceId": warehouseId,
		});
		if (!warehouse) {
			return NextResponse.json(
				{ success: false, message: "Warehouse not found" },
				{ status: 404 }
			);
		}

		// Find the zone
		const zone = warehouse.zones.find(
			(z: any) => z.iotSensorIds?.temperature === sensorId
		);
		if (!zone) {
			return NextResponse.json(
				{ success: false, message: "Zone not found" },
				{ status: 404 }
			);
		}

		// Update zone temperature
		const zoneIndex = warehouse.zones.indexOf(zone);
		warehouse.zones[zoneIndex].temperature = temperature;
		warehouse.zones[zoneIndex].lastReading = {
			...zone.lastReading,
			temperature,
			timestamp: new Date(),
		};
		await warehouse.save();

		// Create notification about the temperature alert
		const alertMessage =
			alertType === "HIGH"
				? `Temperature too high (${temperature}°C) in ${zoneName} at ${warehouse.name}.`
				: `Temperature too low (${temperature}°C) in ${zoneName} at ${warehouse.name}.`;

		await createNotification(
			user._id,
			"WAREHOUSE_UPDATE",
			"Temperature Alert",
			alertMessage,
			{
				warehouseId: warehouse._id,
				warehouseName: warehouse.name,
				zoneName,
				temperature,
				threshold,
				alertType,
				timestamp: new Date().toISOString(),
			}
		);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error processing IoT temperature alert webhook:", error);
		return NextResponse.json(
			{
				success: false,
				message:
					error instanceof Error
						? error.message
						: "Error processing IoT temperature alert webhook",
			},
			{ status: 500 }
		);
	}
}
