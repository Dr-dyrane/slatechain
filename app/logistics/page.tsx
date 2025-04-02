"use client"

import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { RootState, AppDispatch } from "@/lib/store"
import type { Shipment } from "@/lib/types"
import { fetchShipments, simulateShipmentUpdate } from "@/lib/slices/shipmentSlice"

import { TransportManagement } from "./TransportManagement"
import DashboardCard from "@/components/dashboard/DashboardCard"
import { ShipmentDashboard } from "@/components/logistics/shipment-dashboard"

export default function LogisticsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const shipments = useSelector((state: RootState) => state.shipment.items) as Shipment[]

  useEffect(() => {
    dispatch(fetchShipments()); // Ensure data is loaded on mount
  }, [dispatch]); // Keep dependency minimal

  useEffect(() => {
    if (shipments.length === 0) return; // Prevent running if shipments are empty

    let time = 60000; // Initial interval of 1 minute
    let maxTime = 600000; // Max interval of 10 minutes

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

      // Gradually increase the polling interval (double it each time, but don't exceed maxInterval)
      time = Math.min(time * 2, maxTime)
    }, time);

    return () => clearInterval(interval);
  }, [dispatch, shipments.length]); // Track `shipments.length`, not `shipments`


  const totalShipments = shipments.length
  const inTransitShipments = shipments.filter((s) => s.status === "IN_TRANSIT").length
  const deliveredShipments = shipments.filter((s) => s.status === "DELIVERED").length
  const preparingShipments = shipments.filter((s) => s.status === "PREPARING").length

  return (
    <div className="space-y-4">
      <h1 className="text-2xl sm:text-3xl font-bold">Logistics and Shipment Tracking</h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
          <ShipmentDashboard shipments={shipments} />
        </TabsContent>
        <TabsContent value="transport">
          <TransportManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}

