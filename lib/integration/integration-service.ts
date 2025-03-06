// lib/integration/integration-service.ts

import type { IntegrationCategory } from "@/lib/slices/integrationSlice";
import { createNotification } from "@/app/actions/notifications";
import { SapIntegrationService } from "./services/sap-service";
import { PowerBiIntegrationService } from "./services/power-bi-service";
import { IoTIntegrationService } from "./services/iot-service";
import { ShopifyIntegrationService } from "./services/shopify-service";
import { apiClient } from "../api/apiClient/[...live]";
import { User } from "../types/user";

// Base interface for all integration services
export interface IntegrationService {
	connect(): Promise<boolean>;
	disconnect(): Promise<boolean>;
	isConnected(): Promise<boolean>;
	fetchData(): Promise<FetchResult>;
}

// Result of a fetch operation
export interface FetchResult {
	success: boolean;
	message: string;
	data?: any;
	errors?: string[];
}

export interface SyncResult {
	success: boolean;
	message: string;
	syncedEntities?: number;
	errors?: string[];
}

// Factory for creating integration service instances
export class IntegrationServiceFactory {
	static createService(
		category: IntegrationCategory,
		service: string,
		apiKey: string,
		userId: string,
		storeUrl?: string
	): IntegrationService {
		switch (category) {
			case "erp_crm":
				if (service === "sap") {
					return new SapIntegrationService(apiKey, userId);
				}
				break;
			case "bi_tools":
				if (service === "power_bi") {
					return new PowerBiIntegrationService(apiKey, userId);
				}
				break;
			case "iot":
				if (service === "iot_monitoring") {
					return new IoTIntegrationService(apiKey, userId);
				}
				break;
			case "ecommerce":
				if (service === "shopify") {
					return new ShopifyIntegrationService(apiKey, userId, storeUrl);
				}
				break;
		}
		throw new Error(`Unsupported integration: ${category}/${service}`);
	}
}

// Main integration manager that handles all integrations
export class IntegrationManager {
	private userId: string;

	constructor(userId: string) {
		this.userId = userId;
	}

	// Get all active integrations for the user
	async getActiveIntegrations(): Promise<
		Record<IntegrationCategory, string[]>
	> {
		try {
			const user = (await apiClient.get(`/users/${this.userId}`)) as User;
			const result: Record<IntegrationCategory, string[]> = {
				erp_crm: [],
				bi_tools: [],
				iot: [],
				ecommerce: [],
			};

			// Populate active integrations
			if (user.integrations) {
				Object.entries(user.integrations).forEach(([category, integration]) => {
					if (integration.enabled && integration.service) {
						result[category as IntegrationCategory].push(integration.service);
					}
				});
			}

			return result;
		} catch (error) {
			console.error("Failed to get active integrations:", error);
			throw error;
		}
	}

	// Sync all active integrations
	async syncAllIntegrations(): Promise<Record<string, SyncResult>> {
		const results: Record<string, SyncResult> = {};
		const activeIntegrations = await this.getActiveIntegrations();

		// Get user details to access API keys
		const user = (await apiClient.get(`/users/${this.userId}`)) as User;

		// Process each integration category
		for (const [category, services] of Object.entries(activeIntegrations)) {
			for (const service of services) {
				try {
					const integration = user.integrations[category] as any;
					if (!integration || !integration.enabled) continue;

					const integrationService = IntegrationServiceFactory.createService(
						category as IntegrationCategory,
						service,
						integration.apiKey || "",
						this.userId,
						integration.storeUrl
					);

					// Perform sync
					const syncResult = (await integrationService.sync()) as any;
					results[`${category}/${service}`] = syncResult;

					// Create notification about sync result
					await createNotification(
						this.userId,
						"INTEGRATION_SYNC",
						`${service.toUpperCase()} Integration Sync`,
						syncResult.success
							? `Successfully synced ${service} data.`
							: `Failed to sync ${service} data.`,
						{
							category,
							service,
							success: syncResult.success,
							syncedEntities: syncResult.syncedEntities,
						}
					);
				} catch (error) {
					console.error(`Error syncing ${category}/${service}:`, error);
					results[`${category}/${service}`] = {
						success: false,
						message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
						errors: [error instanceof Error ? error.message : "Unknown error"],
					};
				}
			}
		}

		return results;
	}

	// Connect a specific integration
	async connectIntegration(
		category: IntegrationCategory,
		service: string,
		apiKey: string,
		storeUrl?: string
	): Promise<boolean> {
		try {
			const integrationService = IntegrationServiceFactory.createService(
				category,
				service,
				apiKey,
				this.userId,
				storeUrl
			);

			const connected = await integrationService.connect();

			if (connected) {
				// Update integration status in the database
				await apiClient.put(`/integrations/${category}`, {
					service,
					enabled: true,
					apiKey,
					...(storeUrl ? { storeUrl } : {}),
				});

				// Create notification
				await createNotification(
					this.userId,
					"INTEGRATION_STATUS",
					`${service.toUpperCase()} Integration Connected`,
					`Successfully connected to ${service}.`,
					{ category, service }
				);
			}

			return connected;
		} catch (error) {
			console.error(`Error connecting ${category}/${service}:`, error);

			// Create notification about failure
			await createNotification(
				this.userId,
				"INTEGRATION_STATUS",
				`${service.toUpperCase()} Integration Failed`,
				`Failed to connect to ${service}: ${error instanceof Error ? error.message : "Unknown error"}`,
				{
					category,
					service,
					error: error instanceof Error ? error.message : "Unknown error",
				}
			);

			return false;
		}
	}

	// Disconnect a specific integration
	async disconnectIntegration(
		category: IntegrationCategory,
		service: string
	): Promise<boolean> {
		try {
			// Get user details to access API key
			const user = (await apiClient.get(`/users/${this.userId}`)) as User;
			const integration = user.integrations[category] as any;

			if (
				!integration ||
				!integration.enabled ||
				integration.service !== service
			) {
				return false;
			}

			const integrationService = IntegrationServiceFactory.createService(
				category,
				service,
				integration.apiKey || "",
				this.userId,
				integration.storeUrl
			);

			const disconnected = await integrationService.disconnect();

			if (disconnected) {
				// Update integration status in the database
				await apiClient.put(`/integrations/${category}`, {
					service,
					enabled: false,
					apiKey: integration.apiKey,
					...(integration.storeUrl ? { storeUrl: integration.storeUrl } : {}),
				});

				// Create notification
				await createNotification(
					this.userId,
					"INTEGRATION_STATUS",
					`${service.toUpperCase()} Integration Disconnected`,
					`Successfully disconnected from ${service}.`,
					{ category, service }
				);
			}

			return disconnected;
		} catch (error) {
			console.error(`Error disconnecting ${category}/${service}:`, error);
			return false;
		}
	}
}
