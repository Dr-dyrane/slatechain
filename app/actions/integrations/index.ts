// app/actions/integrations/index.ts

"use server";

import { IntegrationServiceFactory } from "@/lib/integration/integration-service";
import type { IntegrationCategory } from "@/lib/slices/integrationSlice";
import User from "@/app/api/models/User";
import { createNotification } from "../notifications";

// Handle integration activation
export async function handleIntegrationActivation(
	userId: string,
	category: IntegrationCategory,
	service: string,
	enabled: boolean,
	apiKey: string,
	storeUrl?: string
) {
	try {
		// If integration is being disabled, no need to proceed with activation
		if (!enabled) {
			return {
				success: true,
				message: `${category} integration disabled successfully`,
			};
		}

		// Create integration service and test connection
		const integrationService = IntegrationServiceFactory.createService(
			category,
			service,
			apiKey,
			userId,
			storeUrl
		);

		const isConnected = await integrationService.connect();

		if (!isConnected) {
			return {
				success: false,
				message: `Failed to connect to ${service}. Please check your credentials and try again.`,
			};
		}

		// If connected, fetch initial data
		const fetchResult = await integrationService.fetchData();

		// Create notification about the connection
		await createNotification(
			userId,
			"INTEGRATION_STATUS",
			`${service.toUpperCase()} Integration Connected`,
			fetchResult.success
				? `Successfully connected to ${service} and fetched initial data.`
				: `Connected to ${service} but encountered issues fetching data: ${fetchResult.message}`,
			{ category, service, fetchResult }
		);

		return {
			success: true,
			message: `${service} integration activated successfully`,
			data: fetchResult.data,
		};
	} catch (error: any) {
		console.error(`Error handling ${category} integration:`, error);
		return {
			success: false,
			message: error.message || `Failed to handle ${category} integration`,
		};
	}
}

// Fetch data from a specific integration
export async function fetchIntegrationData(
	userId: string,
	category: IntegrationCategory,
	service: string
) {
	try {
		// Get user to get API key and store URL
		const user = await User.findById(userId);
		if (!user) {
			return {
				success: false,
				message: "User not found",
			};
		}

		const integration = user.integrations[category];
		if (
			!integration ||
			!integration.enabled ||
			integration.service !== service
		) {
			return {
				success: false,
				message: `${service} integration is not enabled`,
			};
		}

		// Create integration service
		const integrationService = IntegrationServiceFactory.createService(
			category,
			service,
			integration.apiKey || "",
			userId,
			integration.storeUrl
		);

		// Fetch data
		const fetchResult = await integrationService.fetchData();

		// Create notification about the data fetch
		await createNotification(
			userId,
			"INTEGRATION_STATUS",
			`${service.toUpperCase()} Data Fetch Completed`,
			fetchResult.success
				? `Successfully fetched data from ${service}.`
				: `Encountered issues fetching data from ${service}: ${fetchResult.message}`,
			{ category, service, fetchResult }
		);

		return {
			success: fetchResult.success,
			message: fetchResult.message,
			data: fetchResult.data,
		};
	} catch (error: any) {
		console.error(`Error fetching data from ${service}:`, error);
		return {
			success: false,
			message: error.message || `Failed to fetch data from ${service}`,
		};
	}
}

// Connect a specific integration
export async function connectIntegration(
	userId: string,
	category: IntegrationCategory,
	service: string,
	apiKey: string,
	storeUrl?: string
) {
	try {
		// Create integration service
		const integrationService = IntegrationServiceFactory.createService(
			category,
			service,
			apiKey,
			userId,
			storeUrl
		);

		// Test connection
		const isConnected = await integrationService.connect();

		if (!isConnected) {
			return {
				success: false,
				message: `Failed to connect to ${service}. Please check your credentials and try again.`,
			};
		}

		// Update user's integration settings
		const user = await User.findById(userId);
		if (!user) {
			return {
				success: false,
				message: "User not found",
			};
		}

		if (!user.integrations) {
			user.integrations = {};
		}

		user.integrations[category] = {
			enabled: true,
			service,
			apiKey,
			...(storeUrl ? { storeUrl } : {}),
		};

		await user.save();

		// Create notification
		await createNotification(
			userId,
			"INTEGRATION_STATUS",
			`${service.toUpperCase()} Integration Connected`,
			`Successfully connected to ${service}.`,
			{ category, service }
		);

		return {
			success: true,
			message: `${service} integration connected successfully`,
		};
	} catch (error: any) {
		console.error(`Error connecting ${service} integration:`, error);
		return {
			success: false,
			message: error.message || `Failed to connect ${service} integration`,
		};
	}
}

// Disconnect a specific integration
export async function disconnectIntegration(
	userId: string,
	category: IntegrationCategory,
	service: string
) {
	try {
		// Update user's integration settings
		const user = await User.findById(userId);
		if (!user) {
			return {
				success: false,
				message: "User not found",
			};
		}

		if (!user.integrations || !user.integrations[category]) {
			return {
				success: false,
				message: `${service} integration is not enabled`,
			};
		}

		// Disable the integration
		user.integrations[category].enabled = false;
		await user.save();

		// Create notification
		await createNotification(
			userId,
			"INTEGRATION_STATUS",
			`${service.toUpperCase()} Integration Disconnected`,
			`Successfully disconnected from ${service}.`,
			{ category, service }
		);

		return {
			success: true,
			message: `${service} integration disconnected successfully`,
		};
	} catch (error: any) {
		console.error(`Error disconnecting ${service} integration:`, error);
		return {
			success: false,
			message: error.message || `Failed to disconnect ${service} integration`,
		};
	}
}
