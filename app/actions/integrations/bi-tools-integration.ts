// app/actions/integrations/bi-tools-integration.ts

import Inventory from "@/app/api/models/Inventory";
import User from "@/app/api/models/User";
import Warehouse from "@/app/api/models/Warehouse";
import StockMovement from "@/app/api/models/StockMovement";
import ManufacturingOrder from "@/app/api/models/ManufacturingOrder";
import { createNotification } from "@/app/actions/notifications";
import integrationService from "@/lib/services/integration-service";

// Power BI API endpoints
const POWER_BI_API_ENDPOINTS = {
	DATASETS: "/v1.0/myorg/datasets",
	DATAFLOWS: "/v1.0/myorg/dataflows",
	REPORTS: "/v1.0/myorg/reports",
	DASHBOARDS: "/v1.0/myorg/dashboards",
	REFRESH_SCHEDULE: "/v1.0/myorg/datasets/{datasetId}/refreshSchedule",
};

/**
 * Handles BI Tools integration (Power BI)
 */
export async function handleBIToolsIntegration(
	userId: string,
	service: string,
	apiKey: string
) {
	try {
		// Only handle Power BI integration for now
		if (service !== "power_bi") {
			return {
				success: false,
				message: `Unsupported BI service: ${service}. Currently only Power BI is supported.`,
			};
		}

		// Verify the user exists
		const user = await User.findById(userId);
		if (!user) {
			return { success: false, message: "User not found" };
		}

		// Log integration start
		await integrationService.logIntegrationActivity(
			userId,
			"bi_tools",
			service,
			"INTEGRATION_START",
			"success"
		);

		// Create Power BI API client
		const powerBIBaseUrl = "/api";
		const powerBIClient = integrationService.createAuthClient(
			apiKey,
			powerBIBaseUrl
		);

		// 1. Set up data export to Power BI
		const dataExportResult = await setupPowerBIDataExport(
			userId,
			powerBIClient
		);

		// 2. Create Power BI reports and dashboards
		const reportResult = await createPowerBIReports(
			userId,
			powerBIClient,
			dataExportResult.datasets
		);

		// 3. Set up scheduled refresh
		const refreshResult = await setupPowerBIRefreshSchedule(
			userId,
			powerBIClient,
			dataExportResult.datasets
		);

		// 4. Set up scheduled sync jobs
		await setupPowerBISyncJobs(userId, service);

		// 5. Register webhooks for data updates
		await setupPowerBIWebhooks(userId, service);

		// Create notification about the integration
		await createNotification(
			userId,
			"INTEGRATION_SYNC",
			"Power BI Integration Active",
			"Your Power BI integration is now active. Data will be automatically exported for analytics.",
			{
				service: "power_bi",
				dataExportSetup: dataExportResult.success,
				reportsCreated: reportResult.success,
				refreshScheduled: refreshResult.success,
			}
		);

		// Log integration completion
		await integrationService.logIntegrationActivity(
			userId,
			"bi_tools",
			service,
			"INTEGRATION_COMPLETE",
			"success",
			{
				dataExportSetup: dataExportResult.success,
				reportsCreated: reportResult.success,
				refreshScheduled: refreshResult.success,
			}
		);

		return {
			success: true,
			message: "Power BI integration activated successfully",
			details: {
				dataExport: dataExportResult,
				reports: reportResult,
				refresh: refreshResult,
			},
		};
	} catch (error: any) {
		console.error("Error in BI Tools integration:", error);

		// Log integration error
		await integrationService.logIntegrationActivity(
			userId,
			"bi_tools",
			service,
			"INTEGRATION_ERROR",
			"error",
			{
				error: error.message,
			}
		);

		return {
			success: false,
			message: error.message || "Failed to activate Power BI integration",
		};
	}
}

/**
 * Sets up data export to Power BI
 */
async function setupPowerBIDataExport(userId: string, powerBIClient: any) {
	try {
		// Log data export start
		await integrationService.logIntegrationActivity(
			userId,
			"bi_tools",
			"power_bi",
			"DATA_EXPORT_START",
			"success"
		);

		// 1. Define the datasets to export to Power BI
		const datasetDefinitions = [
			{
				name: "Inventory",
				model: Inventory,
				refreshSchedule: "daily",
				fields: ["name", "sku", "quantity", "price", "category", "warehouseId"],
				schema: {
					tables: [
						{
							name: "Inventory",
							columns: [
								{ name: "id", dataType: "string" },
								{ name: "name", dataType: "string" },
								{ name: "sku", dataType: "string" },
								{ name: "quantity", dataType: "int64" },
								{ name: "price", dataType: "double" },
								{ name: "category", dataType: "string" },
								{ name: "warehouseId", dataType: "string" },
							],
						},
					],
				},
			},
			{
				name: "Warehouses",
				model: Warehouse,
				refreshSchedule: "weekly",
				fields: [
					"name",
					"location",
					"capacity",
					"utilizationPercentage",
					"status",
				],
				schema: {
					tables: [
						{
							name: "Warehouses",
							columns: [
								{ name: "id", dataType: "string" },
								{ name: "name", dataType: "string" },
								{ name: "location", dataType: "string" },
								{ name: "capacity", dataType: "int64" },
								{ name: "utilizationPercentage", dataType: "double" },
								{ name: "status", dataType: "string" },
							],
						},
					],
				},
			},
			{
				name: "StockMovements",
				model: StockMovement,
				refreshSchedule: "daily",
				fields: [
					"type",
					"sourceLocationId",
					"destinationLocationId",
					"status",
					"scheduledDate",
					"completedDate",
				],
				schema: {
					tables: [
						{
							name: "StockMovements",
							columns: [
								{ name: "id", dataType: "string" },
								{ name: "type", dataType: "string" },
								{ name: "sourceLocationId", dataType: "string" },
								{ name: "destinationLocationId", dataType: "string" },
								{ name: "status", dataType: "string" },
								{ name: "scheduledDate", dataType: "dateTime" },
								{ name: "completedDate", dataType: "dateTime" },
							],
						},
					],
				},
			},
			{
				name: "ManufacturingOrders",
				model: ManufacturingOrder,
				refreshSchedule: "daily",
				fields: [
					"name",
					"orderNumber",
					"quantity",
					"status",
					"startDate",
					"endDate",
					"priority",
				],
				schema: {
					tables: [
						{
							name: "ManufacturingOrders",
							columns: [
								{ name: "id", dataType: "string" },
								{ name: "name", dataType: "string" },
								{ name: "orderNumber", dataType: "string" },
								{ name: "quantity", dataType: "int64" },
								{ name: "status", dataType: "string" },
								{ name: "startDate", dataType: "dateTime" },
								{ name: "endDate", dataType: "dateTime" },
								{ name: "priority", dataType: "string" },
							],
						},
					],
				},
			},
		];

		// 2. Create datasets in Power BI
		const createdDatasets = [];

		for (const datasetDef of datasetDefinitions) {
			// Create dataset in Power BI
			const createDatasetResponse = await powerBIClient.post(
				POWER_BI_API_ENDPOINTS.DATASETS,
				{
					name: datasetDef.name,
					defaultMode: "Push",
					tables: datasetDef.schema.tables,
				}
			);

			const datasetId = createDatasetResponse.data.id;

			// Get data from our database
			const data = await datasetDef.model.find();

			// Push data to Power BI
			const pushDataResponse = await powerBIClient.post(
				`${POWER_BI_API_ENDPOINTS.DATASETS}/${datasetId}/tables/${datasetDef.name}/rows`,
				{
					rows: data.map((item) => {
						const row = { id: item._id.toString() };
						datasetDef.fields.forEach((field) => {
							row[field] = item[field];
						});
						return row;
					}),
				}
			);

			createdDatasets.push({
				name: datasetDef.name,
				datasetId: datasetId,
				rowCount: data.length,
				refreshSchedule: datasetDef.refreshSchedule,
			});
		}

		// 3. Store dataset IDs in user metadata
		await User.findByIdAndUpdate(userId, {
			$set: {
				"metadata.powerBIIntegration": {
					enabled: true,
					lastSetup: new Date(),
					datasets: createdDatasets,
				},
			},
		});

		// Log data export success
		await integrationService.logIntegrationActivity(
			userId,
			"bi_tools",
			"power_bi",
			"DATA_EXPORT_COMPLETE",
			"success",
			{
				datasetCount: createdDatasets.length,
			}
		);

		return {
			success: true,
			message: `Successfully set up data export to Power BI for ${createdDatasets.length} datasets`,
			datasets: createdDatasets,
		};
	} catch (error: any) {
		console.error("Error setting up Power BI data export:", error);

		// Log data export error
		await integrationService.logIntegrationActivity(
			userId,
			"bi_tools",
			"power_bi",
			"DATA_EXPORT_ERROR",
			"error",
			{
				error: error.message,
			}
		);

		return {
			success: false,
			message: error.message || "Failed to set up Power BI data export",
		};
	}
}

/**
 * Creates Power BI reports and dashboards
 */
async function createPowerBIReports(
	userId: string,
	powerBIClient: any,
	datasets: any[]
) {
	try {
		// Log report creation start
		await integrationService.logIntegrationActivity(
			userId,
			"bi_tools",
			"power_bi",
			"REPORT_CREATION_START",
			"success"
		);

		// 1. Create reports for each dataset
		const createdReports = [];

		for (const dataset of datasets) {
			// Create report
			const createReportResponse = await powerBIClient.post(
				POWER_BI_API_ENDPOINTS.REPORTS,
				{
					name: `${dataset.name} Report`,
					datasetId: dataset.datasetId,
				}
			);

			const reportId = createReportResponse.data.id;

			createdReports.push({
				name: `${dataset.name} Report`,
				reportId: reportId,
				datasetId: dataset.datasetId,
			});
		}

		// 2. Create a dashboard
		const createDashboardResponse = await powerBIClient.post(
			POWER_BI_API_ENDPOINTS.DASHBOARDS,
			{
				name: "Supply Chain Analytics Dashboard",
			}
		);

		const dashboardId = createDashboardResponse.data.id;

		// 3. Add tiles to dashboard from reports
		for (const report of createdReports) {
			await powerBIClient.post(
				`${POWER_BI_API_ENDPOINTS.DASHBOARDS}/${dashboardId}/tiles`,
				{
					reportId: report.reportId,
					datasetId: report.datasetId,
					title: report.name,
				}
			);
		}

		// 4. Store report and dashboard IDs in user metadata
		await User.findByIdAndUpdate(userId, {
			$set: {
				"metadata.powerBIIntegration.reports": createdReports,
				"metadata.powerBIIntegration.dashboard": {
					id: dashboardId,
					name: "Supply Chain Analytics Dashboard",
				},
			},
		});

		// Log report creation success
		await integrationService.logIntegrationActivity(
			userId,
			"bi_tools",
			"power_bi",
			"REPORT_CREATION_COMPLETE",
			"success",
			{ reportCount: createdReports.length }
		);

		return {
			success: true,
			message: `Successfully created ${createdReports.length} reports and 1 dashboard in Power BI`,
			reports: createdReports,
			dashboard: {
				id: dashboardId,
				name: "Supply Chain Analytics Dashboard",
			},
		};
	} catch (error: any) {
		console.error("Error creating Power BI reports:", error);

		// Log report creation error
		await integrationService.logIntegrationActivity(
			userId,
			"bi_tools",
			"power_bi",
			"REPORT_CREATION_ERROR",
			"error",
			{
				error: error.message,
			}
		);

		return {
			success: false,
			message: error.message || "Failed to create Power BI reports",
		};
	}
}

/**
 * Sets up scheduled refresh for Power BI datasets
 */
async function setupPowerBIRefreshSchedule(
	userId: string,
	powerBIClient: any,
	datasets: any[]
) {
	try {
		// Log refresh setup start
		await integrationService.logIntegrationActivity(
			userId,
			"bi_tools",
			"power_bi",
			"REFRESH_SETUP_START",
			"success"
		);

		// Set up refresh schedule for each dataset
		const refreshResults = [];

		for (const dataset of datasets) {
			let refreshFrequency;
			let refreshDays = [
				"Monday",
				"Tuesday",
				"Wednesday",
				"Thursday",
				"Friday",
			];

			switch (dataset.refreshSchedule) {
				case "hourly":
					refreshFrequency = "hourly";
					break;
				case "daily":
					refreshFrequency = "daily";
					break;
				case "weekly":
					refreshFrequency = "weekly";
					refreshDays = ["Monday"];
					break;
				default:
					refreshFrequency = "daily";
			}

			// Set up refresh schedule
			const refreshScheduleResponse = await powerBIClient.patch(
				POWER_BI_API_ENDPOINTS.REFRESH_SCHEDULE.replace(
					"{datasetId}",
					dataset.datasetId
				),
				{
					value: {
						enabled: true,
						notifyOption: "MailOnFailure",
						days: refreshDays,
						times:
							refreshFrequency === "hourly"
								? ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]
								: ["04:00"],
					},
				}
			);

			refreshResults.push({
				datasetId: dataset.datasetId,
				name: dataset.name,
				refreshSchedule: refreshFrequency,
				success: true,
			});
		}

		// Update user metadata with refresh schedules
		await User.findByIdAndUpdate(userId, {
			$set: {
				"metadata.powerBIIntegration.refreshSchedules": refreshResults,
			},
		});

		// Log refresh setup success
		await integrationService.logIntegrationActivity(
			userId,
			"bi_tools",
			"power_bi",
			"REFRESH_SETUP_COMPLETE",
			"success",
			{ datasetCount: refreshResults.length }
		);

		return {
			success: true,
			message: `Successfully set up refresh schedules for ${refreshResults.length} datasets in Power BI`,
			refreshSchedules: refreshResults,
		};
	} catch (error: any) {
		console.error("Error setting up Power BI refresh schedules:", error);

		// Log refresh setup error
		await integrationService.logIntegrationActivity(
			userId,
			"bi_tools",
			"power_bi",
			"REFRESH_SETUP_ERROR",
			"error",
			{
				error: error.message,
			}
		);

		return {
			success: false,
			message: error.message || "Failed to set up Power BI refresh schedules",
		};
	}
}

/**
 * Sets up scheduled sync jobs for Power BI
 */
async function setupPowerBISyncJobs(userId: string, service: string) {
	try {
		// Schedule data sync job (daily)
		await integrationService.scheduleSync(
			userId,
			"bi_tools",
			service,
			"DATA_SYNC",
			"daily"
		);

		return { success: true, message: "Successfully set up Power BI sync jobs" };
	} catch (error: any) {
		console.error("Error setting up Power BI sync jobs:", error);
		return {
			success: false,
			message: error.message || "Failed to set up Power BI sync jobs",
		};
	}
}

/**
 * Sets up webhooks for Power BI data updates
 */
async function setupPowerBIWebhooks(userId: string, service: string) {
	try {
		const webhookSecret =
			process.env.WEBHOOK_SECRET || "default-webhook-secret";
		const baseUrl = process.env.API_BASE_URL || "http://localhost:3000";

		// Register webhook for inventory updates
		await integrationService.registerWebhook(
			userId,
			"bi_tools",
			service,
			"INVENTORY_UPDATE",
			`${baseUrl}/api/webhooks/powerbi/inventory`,
			webhookSecret
		);

		// Register webhook for warehouse updates
		await integrationService.registerWebhook(
			userId,
			"bi_tools",
			service,
			"WAREHOUSE_UPDATE",
			`${baseUrl}/api/webhooks/powerbi/warehouse`,
			webhookSecret
		);

		// Register webhook for stock movement updates
		await integrationService.registerWebhook(
			userId,
			"bi_tools",
			service,
			"STOCK_MOVEMENT_UPDATE",
			`${baseUrl}/api/webhooks/powerbi/stock-movement`,
			webhookSecret
		);

		// Register webhook for manufacturing order updates
		await integrationService.registerWebhook(
			userId,
			"bi_tools",
			service,
			"MANUFACTURING_UPDATE",
			`${baseUrl}/api/webhooks/powerbi/manufacturing`,
			webhookSecret
		);

		return { success: true, message: "Successfully set up Power BI webhooks" };
	} catch (error: any) {
		console.error("Error setting up Power BI webhooks:", error);
		return {
			success: false,
			message: error.message || "Failed to set up Power BI webhooks",
		};
	}
}
