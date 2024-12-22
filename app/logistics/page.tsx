// src/app/logistics/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { MapPin, Truck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from "@/components/ui/progress"
import { RootState } from "@/lib/store";
import { Shipment } from '@/lib/types'


export default function LogisticsPage() {
  const shipments = useSelector((state: RootState) => state.shipment.items);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  useEffect(() => {
    if (shipments.length > 0) {
      setSelectedShipment(shipments[0])
    }
  }, [shipments])

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Logistics and Shipment Tracking</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Shipment Map</CardTitle>
            <CardDescription>Visual representation of current shipments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Map Placeholder</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Shipment List</CardTitle>
            <CardDescription>Select a shipment to view details</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {shipments.map((shipment) => (
                <li
                  key={shipment.id}
                  className={`p-2 rounded-md cursor-pointer ${selectedShipment?.id === shipment.id ? "bg-primary/10" : "hover:bg-muted"
                    }`}
                  onClick={() => setSelectedShipment(shipment)}
                >
                  <div className="font-medium">{shipment.trackingNumber}</div>
                  <div className="text-sm text-muted-foreground">{shipment.status}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      {selectedShipment && (
        <Card>
          <CardHeader>
            <CardTitle>Shipment Details</CardTitle>
            <CardDescription>Order #{selectedShipment.orderId}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <MapPin className="mr-2" />
                <span>{selectedShipment.carrier}</span>
              </div>
              <Progress
                value={selectedShipment.status === "DELIVERED" ? 100 : selectedShipment.status === "IN_TRANSIT" ? 65 : 10}
                className="w-1/3"
              />
              <div className="flex items-center">
                <Truck className="mr-2" />
                <span>{selectedShipment.estimatedDeliveryDate}</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Status: {selectedShipment.status}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}