"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
    Truck,
    Package,
    MapPin,
    Calendar,
    Clock,
    CheckCircle2,
    BarChart,
    Share2,
    Check,
    Copy,
    Link,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Shipment } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

interface ShipmentDetailsPanelProps {
    shipment: Shipment
    onTrackOnMap: () => void
}

export function ShipmentDetailsPanel({ shipment, onTrackOnMap }: ShipmentDetailsPanelProps) {
    const [activeTab, setActiveTab] = useState("overview")
    const [isCopying, setIsCopying] = useState(false)
    const [isSharing, setIsSharing] = useState(false)

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
        return new Date(dateString).toLocaleDateString("en-US", options)
    }

    const getProgressValue = (status: string) => {
        switch (status) {
            case "PREPARING":
                return 25
            case "IN_TRANSIT":
                return 65
            case "DELIVERED":
                return 100
            default:
                return 10
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PREPARING":
                return "text-amber-500"
            case "IN_TRANSIT":
                return "text-blue-500"
            case "DELIVERED":
                return "text-green-500"
            default:
                return "text-gray-500"
        }
    }

    const getStatusBg = (status: string) => {
        switch (status) {
            case "PREPARING":
                return "bg-amber-500/10"
            case "IN_TRANSIT":
                return "bg-blue-500/10"
            case "DELIVERED":
                return "bg-green-500/10"
            default:
                return "bg-gray-500/10"
        }
    }

    // Copy tracking number to clipboard
    const copyTrackingNumber = async () => {
        try {
            setIsCopying(true)
            await navigator.clipboard.writeText(shipment.trackingNumber)
            toast({
                title: "Tracking number copied",
                description: `${shipment.trackingNumber} has been copied to your clipboard.`,
            })
        } catch (err) {
            toast({
                title: "Failed to copy",
                description: "Please try again or copy manually.",
                variant: "destructive",
            })
        } finally {
            setTimeout(() => setIsCopying(false), 2000)
        }
    }

    // Share shipment details
    const shareShipment = async () => {
        try {
            setIsSharing(true)

            // Create share data
            const shareData = {
                title: `Tracking ${shipment.trackingNumber}`,
                text: `Track my shipment: ${shipment.name} with ${shipment.carrier}. Estimated delivery: ${formatDate(shipment.estimatedDeliveryDate)}`,
                url: `${window.location.origin}/track?id=${shipment.id}`,
            }

            // Check if Web Share API is available
            if (navigator.share && navigator.canShare(shareData)) {
                await navigator.share(shareData)
                toast({
                    title: "Shared successfully",
                    description: "Shipment details have been shared.",
                })
            } else {
                // Fallback to clipboard if Web Share API is not available
                const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`
                await navigator.clipboard.writeText(shareText)
                toast({
                    title: "Share link copied",
                    description: "Share link has been copied to your clipboard.",
                })
            }
        } catch (err) {
            if ((err as Error).name !== "AbortError") {
                toast({
                    title: "Failed to share",
                    description: "Please try again later.",
                    variant: "destructive",
                })
            }
        } finally {
            setTimeout(() => setIsSharing(false), 2000)
        }
    }

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl font-semibold">{shipment.name}</CardTitle>
                        <CardDescription>
                            Order #{shipment.orderId.replace("ORD", "")} • Tracking #{shipment.trackingNumber}
                        </CardDescription>
                    </div>
                    <Badge className={`${getStatusBg(shipment.status)} ${getStatusColor(shipment.status)} px-3 py-1`}>
                        {shipment.status.replace("_", " ")}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsContent value="overview" className="pt-4 space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Delivery Progress</span>
                                <span className="font-medium">{getProgressValue(shipment.status)}%</span>
                            </div>
                            <Progress value={getProgressValue(shipment.status)} className="h-2" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex items-start gap-3 p-3 rounded-lg border"
                            >
                                <div className="p-2 rounded-full bg-primary/10 text-primary">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-sm">Destination</h3>
                                    <p className="text-sm text-muted-foreground">{shipment.destination}</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-start gap-3 p-3 rounded-lg border"
                            >
                                <div className="p-2 rounded-full bg-primary/10 text-primary">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-sm">Estimated Delivery</h3>
                                    <p className="text-sm text-muted-foreground">{formatDate(shipment.estimatedDeliveryDate)}</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-start gap-3 p-3 rounded-lg border"
                            >
                                <div className="p-2 rounded-full bg-primary/10 text-primary">
                                    <Truck className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-sm">Carrier</h3>
                                    <p className="text-sm text-muted-foreground">{shipment.carrier}</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-start gap-3 p-3 rounded-lg border"
                            >
                                <div className="p-2 rounded-full bg-primary/10 text-primary">
                                    <BarChart className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-sm">Status</h3>
                                    <p className="text-sm text-muted-foreground">{shipment.status.replace("_", " ")}</p>
                                </div>
                            </motion.div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-6">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button onClick={onTrackOnMap} className="flex-1 sm:flex-none" variant="default">
                                            <MapPin className="mr-2 h-4 w-4" />
                                            Track on Map
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>View this shipment on the map</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="flex-1 sm:flex-none"
                                            onClick={copyTrackingNumber}
                                            disabled={isCopying}
                                        >
                                            {isCopying ? (
                                                <>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Copy Tracking
                                                </>
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Copy tracking number to clipboard</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="flex-1 sm:flex-none"
                                            onClick={shareShipment}
                                            disabled={isSharing}
                                        >
                                            {isSharing ? (
                                                <>
                                                    <Link className="mr-2 h-4 w-4 animate-pulse" />
                                                    Sharing...
                                                </>
                                            ) : (
                                                <>
                                                    <Share2 className="mr-2 h-4 w-4" />
                                                    Share
                                                </>
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Share shipment details</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

