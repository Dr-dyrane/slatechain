// lib/integration/services/iot-services.ts

import type { IntegrationService, FetchResult } from "../integration-service";
import { createNotification } from "@/app/actions/notifications";
import mongoose from "mongoose";

// IoT API client for interacting with IoT platforms
export class IoTApiClient {
	private apiKey: string;
	private baseUrl: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
		// Use a public URL instead of an environment variable
		this.baseUrl = "https://api.iot-platform.com/v1";
	}

	// Generic request method for IoT API
	async request<T>(endpoint: string, method = "GET", data?: any): Promise<T> {
		try {
			const url = `${this.baseUrl}${endpoint}`;
			const headers = {
				Authorization: `Bearer ${this.apiKey}`,
				"Content-Type": "application/json",
				Accept: "application/json",
			};

			const response = await fetch(url, {
				method,
				headers,
				body: data ? JSON.stringify(data) : undefined,
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`IoT API error (${response.status}): ${errorText}`);
			}

			return (await response.json()) as T;
		} catch (error) {
			console.error("IoT API request failed:", error);
			throw error;
		}
	}

	// Get devices from IoT platform
	async getDevices(): Promise<any[]> {
		return this.request<any[]>("/devices");
	}

	// Get sensor data from IoT platform  {
	async getSensorData(
		deviceId: string,
		from?: string,
		to?: string
	): Promise<any[]> {
		const queryParams = new URLSearchParams();
		if (from) queryParams.append("from", from);
		if (to) queryParams.append("to", to);

		const queryString = queryParams.toString()
			? `?${queryParams.toString()}`
			: "";
		return this.request<any[]>(`/devices/${deviceId}/data${queryString}`);
	}

	// Get alerts from IoT platform
	async getAlerts(status?: string): Promise<any[]> {
		const queryParams = new URLSearchParams();
		if (status) queryParams.append("status", status);

		const queryString = queryParams.toString()
			? `?${queryParams.toString()}`
			: "";
		return this.request<any[]>(`/alerts${queryString}`);
	}

	// Test connection to IoT platform
	async testConnection(): Promise<boolean> {
		try {
			await this.request<{ status: string }>("/system/status");
			return true;
		} catch (error) {
			console.error("IoT connection test failed:", error);
			return false;
		}
	}
}

// IoT data mappers to transform IoT data to app data models
export class IoTDataMappers {
	// Map IoT device to app device model
	static mapDevice(iotDevice: any): any {
		return {
			deviceId: iotDevice.id,
			name: iotDevice.name,
			type: iotDevice.type,
			status: iotDevice.status,
			location: iotDevice.location,
			lastSeen: iotDevice.lastSeen,
			batteryLevel: iotDevice.batteryLevel,
			firmwareVersion: iotDevice.firmwareVersion,
		};
	}

	// Map IoT sensor data to app sensor data model
	static mapSensorData(iotSensorData: any): any {
		return {
			deviceId: iotSensorData.deviceId,
			timestamp: iotSensorData.timestamp,
			type: iotSensorData.type,
			value: iotSensorData.value,
			unit: iotSensorData.unit,
		};
	}

	// Map IoT alert to app alert model
	static mapAlert(iotAlert: any): any {
		return {
			deviceId: iotAlert.deviceId,
			timestamp: iotAlert.timestamp,
			type: iotAlert.type,
			severity: iotAlert.severity,
			message: iotAlert.message,
			status: iotAlert.status,
			acknowledgedAt: iotAlert.acknowledgedAt,
			acknowledgedBy: iotAlert.acknowledgedBy,
		};
	}
}

// Create IoT device schema
const IoTDeviceSchema = new mongoose.Schema(
	{
		deviceId: { type: String, required: true, unique: true },
		name: { type: String, required: true },
		type: { type: String, required: true },
		status: { type: String, required: true },
		location: { type: String },
		lastSeen: { type: Date },
		batteryLevel: { type: Number },
		firmwareVersion: { type: String },
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true }
);

// Create IoT sensor data schema
const IoTSensorDataSchema = new mongoose.Schema(
	{
		deviceId: { type: String, required: true, index: true },
		timestamp: { type: Date, required: true },
		type: { type: String, required: true },
		value: { type: mongoose.Schema.Types.Mixed, required: true },
		unit: { type: String },
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true }
);

// Create IoT alert schema
const IoTAlertSchema = new mongoose.Schema(
	{
		deviceId: { type: String, required: true, index: true },
		timestamp: { type: Date, required: true },
		type: { type: String, required: true },
		severity: { type: String, required: true },
		message: { type: String, required: true },
		status: { type: String, required: true },
		acknowledgedAt: { type: Date },
		acknowledgedBy: { type: String },
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true }
);

// Create models if they don't exist
const IoTDevice =
	mongoose.models.IoTDevice || mongoose.model("IoTDevice", IoTDeviceSchema);
const IoTSensorData =
	mongoose.models.IoTSensorData ||
	mongoose.model("IoTSensorData", IoTSensorDataSchema);
const IoTAlert =
	mongoose.models.IoTAlert || mongoose.model("IoTAlert", IoTAlertSchema);

// IoT Integration Service implementation
export class IoTIntegrationService implements IntegrationService {
	private apiKey: string;
	private userId: string;
	private apiClient: IoTApiClient;

	constructor(apiKey: string, userId: string) {
		this.apiKey = apiKey;
		this.userId = userId;
		this.apiClient = new IoTApiClient(apiKey);
	}

	// Connect to IoT platform
	async connect(): Promise<boolean> {
		try {
			return await this.apiClient.testConnection();
		} catch (error) {
			console.error("Failed to connect to IoT platform:", error);
			return false;
		}
	}

	// Disconnect from IoT platform
	async disconnect(): Promise<boolean> {
		// No specific disconnect action needed for IoT platform
		return true;
	}

	// Check if connected to IoT platform
	async isConnected(): Promise<boolean> {
		try {
			return await this.apiClient.testConnection();
		} catch (error) {
			return false;
		}
	}

	// Fetch data from IoT platform and merge with app data
	async fetchData(): Promise<FetchResult> {
		try {
			const isConnected = await this.isConnected();
			if (!isConnected) {
				return {
					success: false,
					message:
						"Not connected to IoT platform. Please check your API key and try again.",
				};
			}

			const errors: string[] = [];
			const results: Record<string, any> = {};

			// Fetch and process devices
			try {
				const iotDevices = await this.apiClient.getDevices();
				results.devices = await this.processDevices(iotDevices);
			} catch (error) {
				errors.push(
					`Device fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`
				);
			}

			// Fetch and process sensor data for each device
			try {
				results.sensorData = await this.processSensorData();
			} catch (error) {
				errors.push(
					`Sensor data fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`
				);
			}

			// Fetch and process alerts
			try {
				const iotAlerts = await this.apiClient.getAlerts("ACTIVE");
				results.alerts = await this.processAlerts(iotAlerts);
			} catch (error) {
				errors.push(
					`Alert fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`
				);
			}

			// Create notification about the data fetch
			await createNotification(
				this.userId,
				"INTEGRATION_STATUS",
				"IoT Data Fetch Completed",
				errors.length === 0
					? "Successfully fetched data from IoT platform"
					: `Fetched data from IoT platform with ${errors.length} errors`,
				{ results }
			);

			return {
				success: errors.length === 0,
				message:
					errors.length === 0
						? "IoT data fetch completed successfully"
						: `IoT data fetch completed with ${errors.length} errors`,
				data: results,
				errors: errors.length > 0 ? errors : undefined,
			};
		} catch (error) {
			console.error("IoT data fetch failed:", error);
			return {
				success: false,
				message: `IoT data fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`,
				errors: [error instanceof Error ? error.message : "Unknown error"],
			};
		}
	}

	// Process devices from IoT platform
	private async processDevices(iotDevices: any[]): Promise<any[]> {
		const results = [];

		for (const iotDevice of iotDevices) {
			try {
				const mappedDevice = IoTDataMappers.mapDevice(iotDevice);
				mappedDevice.userId = this.userId;

				// Check if device already exists
				const existingDevice = await IoTDevice.findOne({
					deviceId: mappedDevice.deviceId,
				});

				if (existingDevice) {
					// Update existing device
					Object.assign(existingDevice, mappedDevice);
					await existingDevice.save();
					results.push({
						id: existingDevice._id,
						deviceId: existingDevice.deviceId,
						action: "updated",
					});
				} else {
					// Create new device
					const newDevice = new IoTDevice(mappedDevice);
					await newDevice.save();
					results.push({
						id: newDevice._id,
						deviceId: newDevice.deviceId,
						action: "created",
					});
				}
			} catch (error) {
				console.error(`Failed to process device:`, error);
				results.push({
					error: `Failed to process device: ${error instanceof Error ? error.message : "Unknown error"}`,
				});
			}
		}

		return results;
	}

	// Process sensor data from IoT platform
	private async processSensorData(): Promise<any[]> {
		const results = [];

		// Get all devices
		const devices = await IoTDevice.find({ userId: this.userId });

		// Get last processed timestamp
		const lastProcessed = await IoTSensorData.findOne({
			userId: this.userId,
		}).sort({ timestamp: -1 });
		const fromTimestamp = lastProcessed
			? lastProcessed.timestamp.toISOString()
			: new Date(0).toISOString();

		// For each device, get sensor data since last processed
		for (const device of devices) {
			try {
				const sensorData = await this.apiClient.getSensorData(
					device.deviceId,
					fromTimestamp
				);

				for (const data of sensorData) {
					try {
						const mappedData = IoTDataMappers.mapSensorData(data);
						mappedData.userId = this.userId;

						// Sensor data is typically append-only, so we just create new records
						const newData = new IoTSensorData(mappedData);
						await newData.save();
						results.push({
							id: newData._id,
							deviceId: newData.deviceId,
							timestamp: newData.timestamp,
							action: "created",
						});
					} catch (error) {
						console.error(`Failed to process sensor data:`, error);
						results.push({
							error: `Failed to process sensor data: ${error instanceof Error ? error.message : "Unknown error"}`,
						});
					}
				}
			} catch (error) {
				console.error(
					`Failed to get sensor data for device ${device.deviceId}:`,
					error
				);
				results.push({
					error: `Failed to get sensor data for device ${device.deviceId}: ${error instanceof Error ? error.message : "Unknown error"}`,
				});
			}
		}

		return results;
	}

	// Process alerts from IoT platform
	private async processAlerts(iotAlerts: any[]): Promise<any[]> {
		const results = [];

		for (const iotAlert of iotAlerts) {
			try {
				const mappedAlert = IoTDataMappers.mapAlert(iotAlert);
				mappedAlert.userId = this.userId;

				// Check if alert already exists
				const existingAlert = await IoTAlert.findOne({
					deviceId: mappedAlert.deviceId,
					timestamp: mappedAlert.timestamp,
					type: mappedAlert.type,
				});

				if (existingAlert) {
					// Update existing alert
					Object.assign(existingAlert, mappedAlert);
					await existingAlert.save();
					results.push({
						id: existingAlert._id,
						deviceId: existingAlert.deviceId,
						type: existingAlert.type,
						action: "updated",
					});
				} else {
					// Create new alert
					const newAlert = new IoTAlert(mappedAlert);
					await newAlert.save();
					results.push({
						id: newAlert._id,
						deviceId: newAlert.deviceId,
						type: newAlert.type,
						action: "created",
					});

					// Create notification for new alert
					await createNotification(
						this.userId,
						"INVENTORY_ALERT",
						`IoT Alert: ${mappedAlert.type}`,
						mappedAlert.message,
						{
							alertId: newAlert._id,
							deviceId: mappedAlert.deviceId,
							severity: mappedAlert.severity,
						}
					);
				}
			} catch (error) {
				console.error(`Failed to process alert:`, error);
				results.push({
					error: `Failed to process alert: ${error instanceof Error ? error.message : "Unknown error"}`,
				});
			}
		}

		return results;
	}
}
