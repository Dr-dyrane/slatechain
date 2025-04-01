import Freight from "../api/models/Freight"
import Transport from "../api/models/Transport"

/**
 * Updates a shipment's currentLocation based on the transport associated with its freight
 * @param shipmentData The shipment data containing freightId
 * @returns The updated shipment data with currentLocation if available
 */
export async function updateLocation(shipmentData: any): Promise<any> {
  try {
    // If no freightId is provided, return the original data
    if (!shipmentData.freightId) {
      return shipmentData
    }

    // Find the freight by ID
    const freight = await Freight.findById(shipmentData.freightId)
    if (!freight) {
      console.log(`Freight not found for ID: ${shipmentData.freightId}`)
      return shipmentData
    }

    // Get the vehicle identifier (transport ID) from the freight
    const transportId = freight.vehicle?.identifier
    if (!transportId) {
      console.log(`No transport ID found in freight: ${shipmentData.freightId}`)
      return shipmentData
    }

    // Find the transport by ID
    const transport = await Transport.findById(transportId)
    if (!transport) {
      console.log(`Transport not found for ID: ${transportId}`)
      return shipmentData
    }

    // Get the current location from the transport
    const currentLocation = transport.currentLocation
    if (!currentLocation || !currentLocation.latitude || !currentLocation.longitude) {
      console.log(`No valid location found for transport: ${transportId}`)
      return shipmentData
    }

    // Update the shipment data with the transport's location
    return {
      ...shipmentData,
      currentLocation: {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      },
    }
  } catch (error) {
    console.error("Error updating shipment location:", error)
    // Return original data if there's an error
    return shipmentData
  }
}

