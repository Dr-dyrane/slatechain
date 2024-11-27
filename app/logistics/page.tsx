"use client"

import { useState } from "react"
import { MapPin, Truck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const shipments = [
  { id: 1, orderNumber: "ORD001", status: "In Transit", origin: "New York", destination: "Los Angeles", progress: 65 },
  { id: 2, orderNumber: "ORD002", status: "Delivered", origin: "Chicago", destination: "Miami", progress: 100 },
  { id: 3, orderNumber: "ORD003", status: "Preparing", origin: "Seattle", destination: "Boston", progress: 10 },
]

export default function LogisticsPage() {
  const [selectedShipment, setSelectedShipment] = useState(shipments[0])

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
                  className={`p-2 rounded-md cursor-pointer ${
                    selectedShipment.id === shipment.id ? "bg-primary/10" : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedShipment(shipment)}
                >
                  <div className="font-medium">{shipment.orderNumber}</div>
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
            <CardDescription>Order #{selectedShipment.orderNumber}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <MapPin className="mr-2" />
                <span>{selectedShipment.origin}</span>
              </div>
              <Progress value={selectedShipment.progress} className="w-1/3" />
              <div className="flex items-center">
                <Truck className="mr-2" />
                <span>{selectedShipment.destination}</span>
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
