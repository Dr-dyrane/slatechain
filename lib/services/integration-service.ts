import axios from "axios";
import type { IntegrationCategory } from "@/lib/slices/integrationSlice";

/**
 * Integration service for handling common integration functionality
 */
export class IntegrationService {
	private static instance: IntegrationService;
	private apiBaseUrl: string;

	private constructor() {
		this.apiBaseUrl = '/api'; // Calls with be directed to 
	}

	/**
	 * Get singleton instance
	 */
	public static getInstance(): IntegrationService {
		if (!IntegrationService.instance) {
			IntegrationService.instance = new IntegrationService();
		}
		return IntegrationService.instance;
	}

	/**
	 * Create HTTP client with authentication
	 */
	public createAuthClient(apiKey: string, baseURL?: string) {
		return axios.create({
			baseURL: baseURL || "/api",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
		});
	}

	/**
	 * Log integration activity
	 */
	public async logIntegrationActivity(
		userId: string,
		category: IntegrationCategory,
		service: string,
		action: string,
		status: "success" | "error",
		details?: any
	) {
		try {
			await axios.post(`${this.apiBaseUrl}/logs/integration`, {
				userId,
				category,
				service,
				action,
				status,
				details,
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			console.error("Failed to log integration activity:", error);
			// Non-blocking - we don't want to fail the integration if logging fails
		}
	}

	/**
	 * Schedule a sync job
	 */
	public async scheduleSync(
		userId: string,
		category: IntegrationCategory,
		service: string,
		syncType: string,
		frequency: "realtime" | "hourly" | "daily" | "weekly",
		startTime?: Date
	) {
		try {
			const response = await axios.post(
				`${this.apiBaseUrl}/scheduler/jobs`,
				{
					userId,
					jobType: "INTEGRATION_SYNC",
					category,
					service,
					syncType,
					frequency,
					startTime: startTime || new Date().toISOString(),
					status: "SCHEDULED",
				}
			);

			return response.data;
		} catch (error) {
			console.error("Failed to schedule sync job:", error);
			throw error;
		}
	}

	/**
	 * Register webhook for integration events
	 */
	public async registerWebhook(
		userId: string,
		category: IntegrationCategory,
		service: string,
		eventType: string,
		endpoint: string,
		secret: string
	) {
		try {
			const response = await axios.post(
				`${this.apiBaseUrl}/webhooks/register`,
				{
					userId,
					category,
					service,
					eventType,
					endpoint,
					secret,
					status: "ACTIVE",
				}
			);

			return response.data;
		} catch (error) {
			console.error("Failed to register webhook:", error);
			throw error;
		}
	}
}

export default IntegrationService.getInstance();
