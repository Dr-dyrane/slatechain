// app/api/webhooks/powerbi/refresh-complete/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { createNotification } from "@/app/actions/notifications";
import User from "@/app/api/models/User";
import { verifyPowerBIWebhook } from "@/lib/utils";

export async function POST(req: NextRequest) {
	try {
		// Verify the webhook is from Power BI
		const isValid = await verifyPowerBIWebhook(req);
		if (!isValid) {
			return NextResponse.json(
				{ success: false, message: "Invalid webhook signature" },
				{ status: 401 }
			);
		}

		// Get the refresh data from the request
		const refreshData = await req.json();

		// Find the user with this Power BI integration
		const user = await User.findOne({
			"integrations.bi_tools.service": "power_bi",
			"integrations.bi_tools.enabled": true,
		});

		if (!user) {
			return NextResponse.json(
				{
					success: false,
					message: "No user found with active Power BI integration",
				},
				{ status: 404 }
			);
		}

		// Process the refresh complete notification
		const { datasetId, datasetName, refreshType, status, startTime, endTime } =
			refreshData;

		// Update user metadata with refresh status
		if (user.metadata?.powerBIIntegration?.datasets) {
			const datasets = user.metadata.powerBIIntegration.datasets;
			const datasetIndex = datasets.findIndex(
				(ds: any) => ds.datasetId === datasetId
			);

			if (datasetIndex >= 0) {
				datasets[datasetIndex].lastRefresh = endTime;
				datasets[datasetIndex].lastRefreshStatus = status;

				await User.findByIdAndUpdate(user._id, {
					$set: {
						"metadata.powerBIIntegration.datasets": datasets,
					},
				});
			}
		}

		// Create notification about the refresh
		if (status === "Completed") {
			await createNotification(
				user._id,
				"INTEGRATION_SYNC",
				"Power BI Refresh Complete",
				`The ${datasetName} dataset in Power BI has been refreshed successfully.`,
				{
					datasetId,
					datasetName,
					refreshType,
					startTime,
					endTime,
					duration: new Date(endTime).getTime() - new Date(startTime).getTime(),
				}
			);
		} else {
			await createNotification(
				user._id,
				"INTEGRATION_SYNC",
				"Power BI Refresh Failed",
				`The ${datasetName} dataset in Power BI failed to refresh.`,
				{
					datasetId,
					datasetName,
					refreshType,
					startTime,
					endTime,
					status,
					error: refreshData.error,
				}
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error processing Power BI refresh webhook:", error);
		return NextResponse.json(
			{
				success: false,
				message:
					error instanceof Error
						? error.message
						: "Error processing Power BI refresh webhook",
			},
			{ status: 500 }
		);
	}
}
