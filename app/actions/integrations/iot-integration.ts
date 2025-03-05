// app/actions/integrations/iot-integration.ts

import Warehouse from "@/app/api/models/Warehouse"
import User from "@/app/api/models/User"
import { createNotification } from "@/app/actions/notifications"
import integrationService from "@/lib/services/integration-service"

// IoT API endpoints
const IOT_API_ENDPOINTS = {
  REGISTER_DEVICE: "/api/devices/register",
  REGISTER_SENSOR: "/api/sensors/register",
  CONFIGURE_ALERTS: "/api/alerts/configure",
  REGISTER_GATEWAY: "/api/gateways/register",
}

/**
 * Handles IoT integration
 */
export async function handleIoTIntegration(userId: string, service: string, apiKey: string) {
  try {
    // Only handle IoT monitoring integration for now
    if (service !== "iot_monitoring") {
      return {
        success: false,
        message: `Unsupported IoT service: ${service}. Currently only IoT Monitoring is supported.`,
      }
    }

    // Verify the user exists
    const user = await User.findById(userId)
    if (!user) {
      return { success: false, message: "User not found" }
    }

    // Log integration start
    await integrationService.logIntegrationActivity(userId, "iot", service, "INTEGRATION_START", "success")

    // Create IoT API client
    const iotBaseUrl = '/api/webhooks/iot/temperature-alert'
    if (!iotBaseUrl) {
      throw new Error("IoT API base URL not configured")
    }

    const iotClient = integrationService.createAuthClient(apiKey, iotBaseUrl)

    // 1. Connect warehouses to IoT monitoring
    const warehouseResult = await connectWarehousesToIoT(userId, iotClient)

    // 2. Set up IoT alerts
    const alertsResult = await setupIoTAlerts(userId, iotClient)

    // 3. Set up scheduled sync jobs
    await setupIoTSyncJobs(userId, service)

    // 4. Register webhooks for real-time updates
    await setupIoTWebhooks(userId, service)

    // Create notification about the integration
    await createNotification(
      userId,
      "INTEGRATION_SYNC",
      "IoT Monitoring Integration Active",
      "Your IoT Monitoring integration is now active. Warehouse conditions will be monitored in real-time.",
      {
        service: "iot_monitoring",
        warehousesSynced: warehouseResult.success,
        alertsConfigured: alertsResult.success,
      },
    )

    // Log integration completion
    await integrationService.logIntegrationActivity(userId, "iot", service, "INTEGRATION_COMPLETE", "success", {
      warehousesSynced: warehouseResult.success,
      alertsConfigured: alertsResult.success,
    })

    return {
      success: true,
      message: "IoT Monitoring integration activated successfully",
      details: {
        warehouses: warehouseResult,
        alerts: alertsResult,
      },
    }
  } catch (error: any) {
    console.error("Error in IoT integration:", error)

    // Log integration error
    await integrationService.logIntegrationActivity(userId, "iot", service, "INTEGRATION_ERROR", "error", {
      error: error.message,
    })

    return { success: false, message: error.message || "Failed to activate IoT Monitoring integration" }
  }
}

/**
 * Connects warehouses to IoT monitoring
 */
async function connectWarehousesToIoT(userId: string, iotClient: any) {
  try {
    // Log sync start
    await integrationService.logIntegrationActivity(
      userId,
      "iot",
      "iot_monitoring",
      "WAREHOUSE_CONNECT_START",
      "success",
    )

    // 1. Get warehouses from our database
    const warehouses = await Warehouse.find()

    // 2. Register each warehouse as an IoT location
    const warehouseResults = []

    for (const warehouse of warehouses) {
      // Register warehouse as IoT location/device
      const warehouseResponse = await iotClient.post(IOT_API_ENDPOINTS.REGISTER_DEVICE, {
        deviceType: "WAREHOUSE",
        name: warehouse.name,
        location: warehouse.location,
        metadata: {
          capacity: warehouse.capacity,
          utilizationPercentage: warehouse.utilizationPercentage,
          status: warehouse.status,
        },
      })

      if (!warehouseResponse.data.success) {
        throw new Error(`Failed to register warehouse ${warehouse.name}: ${warehouseResponse.data.message}`)
      }

      const warehouseDeviceId = warehouseResponse.data.deviceId

      // Register gateway for the warehouse
      const gatewayResponse = await iotClient.post(IOT_API_ENDPOINTS.REGISTER_GATEWAY, {
        name: `${warehouse.name} Gateway`,
        deviceId: warehouseDeviceId,
        protocol: "MQTT",
        connectionDetails: {
          host: process.env.MQTT_BROKER_HOST || "mqtt.example.com",
          port: process.env.MQTT_BROKER_PORT || 1883,
          username: process.env.MQTT_USERNAME,
          password: process.env.MQTT_PASSWORD,
        },
      })

      if (!gatewayResponse.data.success) {
        throw new Error(`Failed to register gateway for warehouse ${warehouse.name}: ${gatewayResponse.data.message}`)
      }

      const gatewayId = gatewayResponse.data.gatewayId

      // Register sensors for each zone
      const zoneUpdates = []

      for (const zone of warehouse.zones) {
        // Register temperature sensor
        const tempSensorResponse = await iotClient.post(IOT_API_ENDPOINTS.REGISTER_SENSOR, {
          deviceId: warehouseDeviceId,
          gatewayId: gatewayId,
          name: `${zone.name} Temperature Sensor`,
          type: "TEMPERATURE",
          unit: "CELSIUS",
          minValue: -30,
          maxValue: 50,
          currentValue: zone.temperature || 22,
          alertThresholds: {
            low: zone.type === "COLD_STORAGE" ? 0 : 10,
            high: zone.type === "COLD_STORAGE" ? 8 : 30,
          },
        })

        // Register humidity sensor
        const humiditySensorResponse = await iotClient.post(IOT_API_ENDPOINTS.REGISTER_SENSOR, {
          deviceId: warehouseDeviceId,
          gatewayId: gatewayId,
          name: `${zone.name} Humidity Sensor`,
          type: "HUMIDITY",
          unit: "PERCENT",
          minValue: 0,
          maxValue: 100,
          currentValue: zone.humidity || 50,
          alertThresholds: {
            low: 20,
            high: 80,
          },
        })

        // Register occupancy sensor
        const occupancySensorResponse = await iotClient.post(IOT_API_ENDPOINTS.REGISTER_SENSOR, {
          deviceId: warehouseDeviceId,
          gatewayId: gatewayId,
          name: `${zone.name} Occupancy Sensor`,
          type: "OCCUPANCY",
          unit: "PERCENT",
          minValue: 0,
          maxValue: 100,
          currentValue: (zone.currentOccupancy / zone.capacity) * 100,
          alertThresholds: {
            low: 0,
            high: 90,
          },
        })

        // Update zone with sensor IDs
        zoneUpdates.push({
          ...zone.toObject(),
          iotSensorIds: {
            temperature: tempSensorResponse.data.sensorId,
            humidity: humiditySensorResponse.data.sensorId,
            occupancy: occupancySensorResponse.data.sensorId,
          },
          iotMonitoringEnabled: true,
          lastReading: {
            temperature: zone.temperature || 22,
            humidity: zone.humidity || 50,
            timestamp: new Date(),
          },
        })
      }

      // Update the warehouse with IoT monitoring data
      await Warehouse.findByIdAndUpdate(warehouse._id, {
        $set: {
          zones: zoneUpdates,
          "metadata.iotMonitoringEnabled": true,
          "metadata.iotDeviceId": warehouseDeviceId,
          "metadata.iotGatewayId": gatewayId,
          "metadata.lastIoTSync": new Date(),
        },
      })

      warehouseResults.push({
        warehouseId: warehouse._id,
        name: warehouse.name,
        iotDeviceId: warehouseDeviceId,
        iotGatewayId: gatewayId,
        zonesConnected: zoneUpdates.length,
      })
    }

    // Log sync success
    await integrationService.logIntegrationActivity(
      userId,
      "iot",
      "iot_monitoring",
      "WAREHOUSE_CONNECT_COMPLETE",
      "success",
      { warehouseCount: warehouses.length },
    )

    return {
      success: true,
      message: `Successfully connected ${warehouses.length} warehouses to IoT monitoring`,
      warehouses: warehouseResults,
    }
  } catch (error: any) {
    console.error("Error connecting warehouses to IoT:", error)

    // Log sync error
    await integrationService.logIntegrationActivity(
      userId,
      "iot",
      "iot_monitoring",
      "WAREHOUSE_CONNECT_ERROR",
      "error",
      { error: error.message },
    )

    return { success: false, message: error.message || "Failed to connect warehouses to IoT monitoring" }
  }
}

/**
 * Sets up IoT alerts
 */
async function setupIoTAlerts(userId: string, iotClient: any) {
  try {
    // Log alert setup start
    await integrationService.logIntegrationActivity(userId, "iot", "iot_monitoring", "ALERT_SETUP_START", "success")

    // Get warehouses with IoT device IDs
    const warehouses = await Warehouse.find({
      "metadata.iotMonitoringEnabled": true,
    })

    if (warehouses.length === 0) {
      throw new Error("No warehouses with IoT monitoring enabled found")
    }

    // Configure alerts for each warehouse
    const alertConfigurations = []

    for (const warehouse of warehouses) {
      // Configure temperature alerts
      const temperatureAlertResponse = await iotClient.post(IOT_API_ENDPOINTS.CONFIGURE_ALERTS, {
        deviceId: warehouse.metadata.iotDeviceId,
        alertType: "TEMPERATURE",
        notificationChannels: ["EMAIL", "SMS", "PUSH"],
        recipients: [userId],
        escalationPolicy: {
          initialDelay: 5, // minutes
          escalationDelay: 15, // minutes
          escalationRecipients: ["admin@example.com"],
        },
      })

      // Configure humidity alerts
      const humidityAlertResponse = await iotClient.post(IOT_API_ENDPOINTS.CONFIGURE_ALERTS, {
        deviceId: warehouse.metadata.iotDeviceId,
        alertType: "HUMIDITY",
        notificationChannels: ["EMAIL", "PUSH"],
        recipients: [userId],
        escalationPolicy: {
          initialDelay: 10, // minutes
          escalationDelay: 30, // minutes
          escalationRecipients: ["admin@example.com"],
        },
      })

      // Configure occupancy alerts
      const occupancyAlertResponse = await iotClient.post(IOT_API_ENDPOINTS.CONFIGURE_ALERTS, {
        deviceId: warehouse.metadata.iotDeviceId,
        alertType: "OCCUPANCY",
        notificationChannels: ["EMAIL", "PUSH"],
        recipients: [userId],
        escalationPolicy: {
          initialDelay: 15, // minutes
          escalationDelay: 60, // minutes
          escalationRecipients: ["admin@example.com"],
        },
      })

      alertConfigurations.push({
        warehouseId: warehouse._id,
        name: warehouse.name,
        temperatureAlertId: temperatureAlertResponse.data.alertId,
        humidityAlertId: humidityAlertResponse.data.alertId,
        occupancyAlertId: occupancyAlertResponse.data.alertId,
      })

      // Update warehouse with alert IDs
      await Warehouse.findByIdAndUpdate(warehouse._id, {
        $set: {
          "metadata.iotAlerts": {
            temperature: temperatureAlertResponse.data.alertId,
            humidity: humidityAlertResponse.data.alertId,
            occupancy: occupancyAlertResponse.data.alertId,
          },
        },
      })
    }

    // Log alert setup success
    await integrationService.logIntegrationActivity(
      userId,
      "iot",
      "iot_monitoring",
      "ALERT_SETUP_COMPLETE",
      "success",
      { warehouseCount: warehouses.length },
    )

    return {
      success: true,
      message: `Successfully configured alerts for ${warehouses.length} warehouses`,
      alerts: alertConfigurations,
    }
  } catch (error: any) {
    console.error("Error setting up IoT alerts:", error)

    // Log alert setup error
    await integrationService.logIntegrationActivity(userId, "iot", "iot_monitoring", "ALERT_SETUP_ERROR", "error", {
      error: error.message,
    })

    return { success: false, message: error.message || "Failed to set up IoT alerts" }
  }
}

/**
 * Sets up scheduled sync jobs for IoT
 */
async function setupIoTSyncJobs(userId: string, service: string) {
  try {
    // Schedule warehouse data sync job (hourly)
    await integrationService.scheduleSync(userId, "iot", service, "WAREHOUSE_DATA", "hourly")

    // Schedule sensor health check job (daily)
    await integrationService.scheduleSync(userId, "iot", service, "SENSOR_HEALTH", "daily")

    return { success: true, message: "Successfully set up IoT sync jobs" }
  } catch (error: any) {
    console.error("Error setting up IoT sync jobs:", error)
    return { success: false, message: error.message || "Failed to set up IoT sync jobs" }
  }
}

/**
 * Sets up webhooks for real-time IoT updates
 */
async function setupIoTWebhooks(userId: string, service: string) {
  try {
    const webhookSecret = process.env.WEBHOOK_SECRET || "default-webhook-secret"
    const baseUrl = process.env.API_BASE_URL || "http://localhost:3000"

    // Register webhook for temperature alerts
    await integrationService.registerWebhook(
      userId,
      "iot",
      service,
      "TEMPERATURE_ALERT",
      `${baseUrl}/api/webhooks/iot/temperature-alert`,
      webhookSecret,
    )

    // Register webhook for humidity alerts
    await integrationService.registerWebhook(
      userId,
      "iot",
      service,
      "HUMIDITY_ALERT",
      `${baseUrl}/api/webhooks/iot/humidity-alert`,
      webhookSecret,
    )

    // Register webhook for occupancy alerts
    await integrationService.registerWebhook(
      userId,
      "iot",
      service,
      "OCCUPANCY_ALERT",
      `${baseUrl}/api/webhooks/iot/occupancy-alert`,
      webhookSecret,
    )

    // Register webhook for sensor data updates
    await integrationService.registerWebhook(
      userId,
      "iot",
      service,
      "SENSOR_DATA",
      `${baseUrl}/api/webhooks/iot/sensor-data`,
      webhookSecret,
    )

    return { success: true, message: "Successfully set up IoT webhooks" }
  } catch (error: any) {
    console.error("Error setting up IoT webhooks:", error)
    return { success: false, message: error.message || "Failed to set up IoT webhooks" }
  }
}

