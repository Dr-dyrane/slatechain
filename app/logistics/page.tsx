"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { RootState, AppDispatch } from "@/lib/store"
import type { Shipment } from "@/lib/types"
import { fetchShipments, simulateShipmentUpdate } from "@/lib/slices/shipmentSlice"

import { TransportManagement } from "./TransportManagement"
import DashboardCard from "@/components/dashboard/DashboardCard"
import { MapComponent } from "@/components/logistics/MapComponent"
import { ShipmentList } from "@/components/logistics/ShipmentList"
import { ShipmentDetails } from "@/components/logistics/ShipmentDetails"

export default function LogisticsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const shipments = useSelector((state: RootState) => state.shipment.items)
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(shipments[0] || null)

  useEffect(() => {
    dispatch(fetchShipments()); // Ensure data is loaded on mount
  }, [dispatch]); // Keep dependency minimal

  useEffect(() => {
    if (shipments.length === 0) return; // Prevent running if shipments are empty

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * shipments.length);
      const shipmentToUpdate = { ...shipments[randomIndex] };

      if (shipmentToUpdate.status === "IN_TRANSIT" && shipmentToUpdate.currentLocation) {
        shipmentToUpdate.currentLocation = {
          latitude: shipmentToUpdate.currentLocation.latitude + (Math.random() - 0.5) * 0.1,
          longitude: shipmentToUpdate.currentLocation.longitude + (Math.random() - 0.5) * 0.1,
        };
      }

      dispatch(simulateShipmentUpdate(shipmentToUpdate));
    }, 5000);

    return () => clearInterval(interval);
  }, [dispatch, shipments.length]); // Track `shipments.length`, not `shipments`


  const totalShipments = shipments.length
  const inTransitShipments = shipments.filter((s) => s.status === "IN_TRANSIT").length
  const deliveredShipments = shipments.filter((s) => s.status === "DELIVERED").length
  const preparingShipments = shipments.filter((s) => s.status === "PREPARING").length

  return (
    <div className="space-y-4">
      <h1 className="text-2xl sm:text-3xl font-bold">Logistics and Shipment Tracking</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          card={{
            title: "Total Shipments",
            value: totalShipments.toString(),
            type: "number",
            icon: "Package",
            description: "All shipments",
            sparklineData: [totalShipments],
          }}
        />
        <DashboardCard
          card={{
            title: "In Transit",
            value: inTransitShipments.toString(),
            type: "number",
            icon: "Truck",
            description: "Shipments on the move",
            sparklineData: [inTransitShipments],
          }}
        />
        <DashboardCard
          card={{
            title: "Delivered",
            value: deliveredShipments.toString(),
            type: "number",
            icon: "CheckCircle",
            description: "Completed shipments",
            sparklineData: [deliveredShipments],
          }}
        />
        <DashboardCard
          card={{
            title: "Preparing",
            value: preparingShipments.toString(),
            type: "number",
            icon: "Package",
            description: "Shipments being prepared",
            sparklineData: [preparingShipments],
          }}
        />
      </div>

      <Tabs defaultValue="shipments">
        <TabsList className="w-full mb-8 flex flex-wrap justify-start">
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
          <TabsTrigger value="transport">Transportation</TabsTrigger>
        </TabsList>
        <TabsContent value="shipments">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="col-span-1 md:col-span-3">
              <CardHeader>
                <CardTitle>Shipment Map</CardTitle>
                <CardDescription>Visual representation of current shipments</CardDescription>
              </CardHeader>
              <CardContent className="relative block overflow-hidden">
                <MapComponent shipments={shipments} />
              </CardContent>

            </Card>
            <Card className="col-span-1  md:col-span-2">
              <CardContent>
                <ShipmentList shipments={shipments} onSelectShipment={setSelectedShipment} />
              </CardContent>
            </Card>
          </div>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Shipment Details</CardTitle>
              <CardDescription>
                {selectedShipment ? `Order #${selectedShipment.orderId}` : "Select a shipment to view details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedShipment ? <ShipmentDetails shipment={selectedShipment} /> : <p>No shipment selected</p>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="transport">
          <TransportManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}

