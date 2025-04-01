"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Package, Truck, CheckCircle2, ShoppingCart, Warehouse, MapPin, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Shipment } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

interface ShipmentTimelineProps {
    shipment: Shipment
    onTrackOnMap?: () => void
}

export interface TimelineEvent {
    id: string
    date: Date
    title: string
    description: string
    icon: React.ReactNode
    status: "completed" | "current" | "upcoming" | "delayed"
  }

export function ShipmentTimeline({ shipment, onTrackOnMap }: ShipmentTimelineProps) {
    const [events, setEvents] = useState<TimelineEvent[]>([])
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        // Generate timeline events based on shipment data
        const timelineEvents: TimelineEvent[] = []

        // Order placed - use createdAt date
        const orderDate = new Date(shipment.createdAt)
        timelineEvents.push({
            id: "order-placed",
            date: orderDate,
            title: "Order Placed",
            description: `Order #${shipment.orderId.replace("ORD", "")} was placed`,
            icon: <ShoppingCart className="h-5 w-5" />,
            status: "completed",
        })

        // Shipment created - use createdAt date
        const shipmentCreatedDate = new Date(shipment.createdAt)
        timelineEvents.push({
            id: "shipment-created",
            date: shipmentCreatedDate,
            title: "Shipment Created",
            description: `Tracking #${shipment.trackingNumber} assigned`,
            icon: <Package className="h-5 w-5" />,
            status: "completed",
        })

        // Preparing for shipment
        const preparingDate = new Date(shipment.createdAt)
        preparingDate.setHours(preparingDate.getHours() + 2) // Assume 2 hours after creation
        timelineEvents.push({
            id: "preparing",
            date: preparingDate,
            title: "Preparing for Shipment",
            description: "Your order is being prepared at our warehouse",
            icon: <Warehouse className="h-5 w-5" />,
            status:
                shipment.status === "PREPARING"
                    ? "current"
                    : shipment.status === "IN_TRANSIT" || shipment.status === "DELIVERED"
                        ? "completed"
                        : "upcoming",
        })

        // In transit
        const inTransitDate = new Date(preparingDate)
        inTransitDate.setHours(inTransitDate.getHours() + 24) // Assume 24 hours after preparing
        timelineEvents.push({
            id: "in-transit",
            date: inTransitDate,
            title: "Shipment In Transit",
            description: `In transit with ${shipment.carrier}`,
            icon: <Truck className="h-5 w-5" />,
            status: shipment.status === "IN_TRANSIT" ? "current" : shipment.status === "DELIVERED" ? "completed" : "upcoming",
        })

        // Out for delivery - 1 day before estimated delivery
        const outForDeliveryDate = new Date(shipment.estimatedDeliveryDate)
        outForDeliveryDate.setHours(outForDeliveryDate.getHours() - 24)
        timelineEvents.push({
            id: "out-for-delivery",
            date: outForDeliveryDate,
            title: "Out for Delivery",
            description: "Your package is out for final delivery",
            icon: <MapPin className="h-5 w-5" />,
            status: "upcoming",
        })

        // Delivered - use estimated delivery date
        const deliveryDate = new Date(shipment.estimatedDeliveryDate)
        timelineEvents.push({
            id: "delivered",
            date: deliveryDate,
            title: "Delivered",
            description: `Expected delivery to ${shipment.destination}`,
            icon: <CheckCircle2 className="h-5 w-5" />,
            status: shipment.status === "DELIVERED" ? "completed" : "upcoming",
        })

        // Sort events by date
        timelineEvents.sort((a, b) => a.date.getTime() - b.date.getTime())

        setEvents(timelineEvents)
    }, [shipment])

    const formatDate = (date: Date) => {
        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-500 text-white"
            case "current":
                return "bg-blue-500 text-white"
            case "upcoming":
                return "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-300"
            case "delayed":
                return "bg-amber-500 text-white"
            default:
                return "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-300"
        }
    }

    const copyTrackingInfo = async () => {
        try {
            const trackingInfo = `
Tracking Number: ${shipment.trackingNumber}
Carrier: ${shipment.carrier}
Status: ${shipment.status.replace("_", " ")}
Destination: ${shipment.destination}
Estimated Delivery: ${new Date(shipment.estimatedDeliveryDate).toLocaleDateString()}
      `.trim()

            await navigator.clipboard.writeText(trackingInfo)
            setCopied(true)
            toast({
                title: "Tracking info copied",
                description: "Tracking information has been copied to your clipboard",
            })

            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            toast({
                title: "Failed to copy",
                description: "Please try again or copy manually",
                variant: "destructive",
            })
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <CardTitle className="flex items-center">
                            <span>Shipment Timeline</span>
                            {/* <Badge variant="outline" className="ml-2">
                                {shipment.status.replace("_", " ")}
                            </Badge> */}
                        </CardTitle>
                        <CardDescription>
                            Tracking #{shipment.trackingNumber} • {shipment.carrier}
                        </CardDescription>
                    </div>

                    {/* <div className="flex gap-2">
                        {onTrackOnMap && (
                            <Button size="sm" onClick={onTrackOnMap}>
                                <MapPin className="mr-2 h-4 w-4" />
                                View on Map
                            </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={copyTrackingInfo}>
                            {copied ? "Copied!" : "Copy Info"}
                        </Button>
                    </div> */}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-8 relative">
                    {/* Timeline connector line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

                    {events.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative pl-14"
                        >
                            {/* Timeline dot */}
                            <div
                                className={`absolute left-0 top-0 w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(event.status)}`}
                            >
                                {event.icon}
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-base">{event.title}</h4>
                                    <time className="text-xs text-muted-foreground">{formatDate(event.date)}</time>
                                </div>
                                <p className="text-sm text-muted-foreground">{event.description}</p>

                                {/* Current status indicator */}
                                {event.status === "current" && (
                                    <div className="flex items-center mt-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mr-2" />
                                        <span className="text-xs text-blue-500 font-medium">Current Status</span>
                                    </div>
                                )}

                                {/* Delayed status indicator */}
                                {event.status === "delayed" && (
                                    <div className="flex items-center mt-2">
                                        <AlertCircle className="w-4 h-4 text-amber-500 mr-2" />
                                        <span className="text-xs text-amber-500 font-medium">Delayed</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

