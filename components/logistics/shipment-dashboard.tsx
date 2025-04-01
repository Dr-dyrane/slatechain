"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, ArrowLeftCircle, Clock, Info, ArrowRightCircle } from "lucide-react"
import type { Shipment } from "@/lib/types"
import { ShipmentDetailsPanel } from "./shipment-details-panel"
import { ShipmentTimeline } from "./shipment-timeline"
import { EnhancedMap } from "./enhanced-map"
import { ShipmentList } from "./ShipmentList"

interface ShipmentDashboardProps {
    shipments: Shipment[]
}

export function ShipmentDashboard({ shipments }: ShipmentDashboardProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
    const [activeTab, setActiveTab] = useState("all")
    const [mapFocusedShipment, setMapFocusedShipment] = useState<Shipment | null>(null)
    const [activeView, setActiveView] = useState<"map" | "timeline" | "details">("map")
    const mapRef = useRef<HTMLDivElement>(null)

    // Filter shipments based on search term, status filter, and active tab
    const filteredShipments = shipments.filter((shipment) => {
        const nameMatches =
            shipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())

        const statusMatches = statusFilter === "ALL" || shipment.status === statusFilter

        const tabMatches =
            activeTab === "all" ||
            (activeTab === "in-transit" && shipment.status === "IN_TRANSIT") ||
            (activeTab === "delivered" && shipment.status === "DELIVERED") ||
            (activeTab === "preparing" && shipment.status === "PREPARING")

        return nameMatches && statusMatches && tabMatches
    })

    // Set first shipment as selected by default if none is selected
    useEffect(() => {
        if (filteredShipments.length > 0 && !selectedShipment) {
            setSelectedShipment(filteredShipments[0])
            setMapFocusedShipment(filteredShipments[0])
        }
    }, [filteredShipments, selectedShipment])

    // Handle tracking on map
    const handleTrackOnMap = () => {
        if (selectedShipment) {
            setMapFocusedShipment(selectedShipment)
            setActiveView("map")

            // Scroll to map if needed
            if (mapRef.current) {
                mapRef.current.scrollIntoView({ behavior: "smooth" })
            }
        }
    }

    // Navigate through shipments
    const navigateShipment = (direction: "next" | "prev") => {
        if (!selectedShipment || filteredShipments.length <= 1) return

        const currentIndex = filteredShipments.findIndex((s) => s.id === selectedShipment.id)
        if (currentIndex === -1) return

        let newIndex
        if (direction === "next") {
            newIndex = (currentIndex + 1) % filteredShipments.length
        } else {
            newIndex = (currentIndex - 1 + filteredShipments.length) % filteredShipments.length
        }

        const newSelectedShipment = filteredShipments[newIndex]
        setSelectedShipment(newSelectedShipment)
        setMapFocusedShipment(newSelectedShipment)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Shipment Tracking</h2>
                    <p className="text-muted-foreground">Monitor and manage your shipments in real-time</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Map and details */}
                <div className="col-span-1 md:col-span-3 space-y-6">
                    {/* Navigation controls */}
                    {selectedShipment && filteredShipments.length > 1 && (
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigateShipment("prev")}
                                className="flex items-center gap-1"
                            >
                                <ArrowLeftCircle className="h-4 w-4 rounded-full" />
                                <span className="hidden xl:inline">Previous</span>
                            </Button>

                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    variant={activeView === "map" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setActiveView("map")}
                                    className="flex items-center gap-1 justify-center"
                                >
                                    <MapPin className="h-4 w-4 rounded-full" />
                                    <span className="hidden lg:inline">Map View</span>
                                </Button>
                                <Button
                                    variant={activeView === "timeline" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setActiveView("timeline")}
                                    className="flex items-center gap-1 justify-center"
                                >
                                    <Clock className="h-4 w-4 rounded-full" />
                                    <span className="hidden lg:inline">Timeline</span>
                                </Button>
                                <Button
                                    variant={activeView === "details" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setActiveView("details")}
                                    className="flex items-center gap-1 justify-center"
                                >
                                    <Info className="h-4 w-4 rounded-full" />
                                    <span className="hidden lg:inline">Details</span>
                                </Button>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigateShipment("next")}
                                className="flex items-center gap-1"
                            >
                                <span className="hidden xl:inline">Next</span>
                                <ArrowRightCircle className="h-4 w-4 rounded-full" />
                            </Button>
                        </div>

                    )}

                    {/* Map view */}
                    {activeView === "map" && (
                        <div ref={mapRef}>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle>Shipment Map</CardTitle>
                                    <CardDescription>Real-time location tracking</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <EnhancedMap
                                        shipments={shipments}
                                        selectedShipment={mapFocusedShipment}
                                        onShipmentSelect={(shipment) => {
                                            setSelectedShipment(shipment)
                                            setMapFocusedShipment(shipment)
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Timeline view */}
                    {activeView === "timeline" && selectedShipment && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                            <ShipmentTimeline shipment={selectedShipment} onTrackOnMap={handleTrackOnMap} />
                        </motion.div>
                    )}

                    {/* Details view */}
                    {activeView === "details" && selectedShipment && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                            <ShipmentDetailsPanel shipment={selectedShipment} onTrackOnMap={handleTrackOnMap} />
                        </motion.div>
                    )}

                    {/* Always show details panel if not in details view */}
                    {activeView !== "details" && selectedShipment && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                            <ShipmentDetailsPanel shipment={selectedShipment} onTrackOnMap={handleTrackOnMap} />
                        </motion.div>
                    )}
                </div>
                {/* Shipment list */}
                <Card className="col-span-1 md:col-span-2">
                    <CardContent>
                        <ShipmentList shipments={shipments} onSelectShipment={setSelectedShipment} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

