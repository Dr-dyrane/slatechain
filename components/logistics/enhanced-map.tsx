"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Truck, MapPin, Loader2, RefreshCw, ZoomIn, ZoomOut, Maximize, Minimize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Shipment } from "@/lib/types"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface EnhancedMapProps {
    shipments: Shipment[]
    selectedShipment?: Shipment | null
    onShipmentSelect?: (shipment: Shipment) => void
}

export function EnhancedMap({ shipments, selectedShipment, onShipmentSelect }: EnhancedMapProps) {
    const mapRef = useRef<L.Map | null>(null)
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const markersRef = useRef<Record<string, L.Marker>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [lastUpdate, setLastUpdate] = useState<number>(() => {
        return Number(localStorage.getItem("lastMapUpdate")) || 0
    })

    const [lastLocation, setLastLocation] = useState<{ lat: number; lng: number } | null>(() => {
        const savedLocation = localStorage.getItem("lastMapLocation")
        return savedLocation ? JSON.parse(savedLocation) : null
    })

    // Function to create custom marker icons
    const createMarkerIcon = (isSelected = false, status = "IN_TRANSIT") => {
        // Choose color based on status
        let color = "blue-500"
        if (status === "PREPARING") color = "amber-500"
        if (status === "DELIVERED") color = "green-500"

        return L.divIcon({
            className: "custom-marker",
            html: `
        <div class="relative">
          <div class="${isSelected ? `animate-ping absolute h-8 w-8 rounded-full bg-${color}/40` : ""}"></div>
          <div class="relative flex justify-center items-center w-8 h-8 rounded-full ${isSelected ? `bg-${color}` : `bg-${color}`} text-white shadow-lg transform transition-all duration-300 ${isSelected ? "scale-110" : ""}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z"/>
              <circle cx="12" cy="11" r="2"/>
            </svg>
          </div>
        </div>
      `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
        })
    }

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current) return

        if (!mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current, {
                zoomControl: false,
                dragging: true,
                doubleClickZoom: true,
                scrollWheelZoom: true,
            }).setView([0, 0], 2)

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(mapRef.current)

            // Add scale control
            L.control.scale({ position: "bottomleft" }).addTo(mapRef.current)
        }

        setIsLoading(false)

        return () => {
            if (mapRef.current) {
                mapRef.current.remove()
                mapRef.current = null
            }
        }
    }, [])

    // Update markers when shipments change or selected shipment changes
    useEffect(() => {
        const updateMap = () => {
            const map = mapRef.current
            if (!map) return

            setIsLoading(true)

            // Track which shipment IDs are in the current data
            const currentShipmentIds = new Set<string>()

            // Create bounds to fit all markers
            const bounds = L.latLngBounds([])
            let hasValidBounds = false

            // Process each shipment
            shipments.forEach((shipment) => {
                if (shipment.currentLocation) {
                    const { latitude, longitude } = shipment.currentLocation
                    currentShipmentIds.add(shipment.id)

                    const isSelected = selectedShipment?.id === shipment.id
                    const markerIcon = createMarkerIcon(isSelected, shipment.status)

                    // If marker already exists, update its position and icon
                    if (markersRef.current[shipment.id]) {
                        const marker = markersRef.current[shipment.id]
                        marker.setLatLng([latitude, longitude])
                        marker.setIcon(markerIcon)

                        // Update popup content
                        const popupContent = `
              <div class="p-2">
                <div class="font-bold">${shipment.name}</div>
                <div class="text-sm">${shipment.status.replace("_", " ")}</div>
                <div class="text-xs text-gray-500">Carrier: ${shipment.carrier}</div>
              </div>
            `
                        marker.bindPopup(popupContent)
                    }
                    // Otherwise create a new marker
                    else {
                        const marker = L.marker([latitude, longitude], { icon: markerIcon })
                            .addTo(map)
                            .bindPopup(`
                <div class="p-2">
                  <div class="font-bold">${shipment.name}</div>
                  <div class="text-sm">${shipment.status.replace("_", " ")}</div>
                  <div class="text-xs text-gray-500">Carrier: ${shipment.carrier}</div>
                </div>
              `)

                        // Add click handler if callback provided
                        if (onShipmentSelect) {
                            marker.on("click", () => {
                                onShipmentSelect(shipment)
                            })
                        }

                        markersRef.current[shipment.id] = marker
                    }

                    // Extend bounds to include this marker
                    bounds.extend([latitude, longitude])
                    hasValidBounds = true
                }
            })

            // Remove markers for shipments that are no longer in the data
            Object.keys(markersRef.current).forEach((id) => {
                if (!currentShipmentIds.has(id)) {
                    markersRef.current[id].remove()
                    delete markersRef.current[id]
                }
            })

            // If a shipment is selected, focus on it
            if (selectedShipment?.currentLocation) {
                const { latitude, longitude } = selectedShipment.currentLocation
                map.setView([latitude, longitude], 13, { animate: true })

                // Open popup for selected shipment
                const marker = markersRef.current[selectedShipment.id]
                if (marker) {
                    marker.openPopup()
                }
            }
            // Otherwise fit all markers in view
            else if (hasValidBounds) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13, animate: true })

                // Save last known location
                const center = bounds.getCenter()
                localStorage.setItem("lastMapLocation", JSON.stringify({ lat: center.lat, lng: center.lng }))
                setLastLocation({ lat: center.lat, lng: center.lng })
            }

            // Save last update time
            const currentTime = Date.now()
            localStorage.setItem("lastMapUpdate", String(currentTime))
            setLastUpdate(currentTime)

            setIsLoading(false)
        }

        // Only update if map is initialized
        if (mapRef.current) {
            updateMap()
        }
    }, [shipments, selectedShipment, onShipmentSelect])

    // Handle manual refresh
    const handleRefresh = () => {
        if (!mapRef.current) return

        setIsLoading(true)

        // Simulate refresh delay
        setTimeout(() => {
            // Update markers
            shipments.forEach((shipment) => {
                if (shipment.currentLocation && markersRef.current[shipment.id]) {
                    const { latitude, longitude } = shipment.currentLocation
                    markersRef.current[shipment.id].setLatLng([latitude, longitude])
                }
            })

            setIsLoading(false)
        }, 1000)
    }

    // Handle zoom controls
    const handleZoomIn = () => {
        if (!mapRef.current) return
        mapRef.current.zoomIn()
    }

    const handleZoomOut = () => {
        if (!mapRef.current) return
        mapRef.current.zoomOut()
    }

    // Handle fullscreen toggle
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen)
    }

    return (
        <div
            className={`relative rounded-lg overflow-hidden border transition-all duration-300 ${isFullscreen ? "fixed inset-4 z-50" : "h-[400px]"}`}
        >
            {/* Map container */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="mt-2 text-sm">Loading map data...</span>
                    </div>
                </div>
            )}

            {/* Map controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-8 w-8 shadow-md bg-background/90 backdrop-blur-sm"
                                onClick={toggleFullscreen}
                            >
                                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p>{isFullscreen ? "Exit fullscreen" : "Fullscreen"}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-8 w-8 shadow-md bg-background/90 backdrop-blur-sm"
                                onClick={handleRefresh}
                                disabled={isLoading}
                            >
                                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p>Refresh map</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-8 w-8 shadow-md bg-background/90 backdrop-blur-sm"
                                onClick={handleZoomIn}
                            >
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p>Zoom in</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-8 w-8 shadow-md bg-background/90 backdrop-blur-sm"
                                onClick={handleZoomOut}
                            >
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p>Zoom out</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Last updated indicator */}
            <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-md backdrop-blur-sm z-10">
                Last updated: {new Date(lastUpdate).toLocaleTimeString()}
            </div>

            {/* Selected shipment info */}
            {selectedShipment && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg shadow-lg max-w-xs z-10 border"
                >
                    <div className="flex items-center gap-2 mb-1">
                        <Truck className="h-4 w-4 text-primary" />
                        <h3 className="font-medium text-sm">{selectedShipment.name}</h3>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                        {selectedShipment.status.replace("_", " ")} • {selectedShipment.carrier}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{selectedShipment.destination}</span>
                    </div>
                </motion.div>
            )}
        </div>
    )
}

