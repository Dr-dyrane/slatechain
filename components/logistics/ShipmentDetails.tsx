import { MapPin, Truck } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { Shipment } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

interface ShipmentDetailsProps {
    shipment: Shipment
}

export function ShipmentDetails({ shipment }: ShipmentDetailsProps) {
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
                return 10
            case "IN_TRANSIT":
                return 65
            case "DELIVERED":
                return 100
            default:
                return 0
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 justify-start md:justify-between mb-4">
                <div className="w-full flex flex-col md:flex-row items-start md:items-center gap-4 flex-1 h-full">
                    <div className="flex items-center">
                        <MapPin className="mr-2" />
                        <span>{shipment.carrier}</span>
                    </div>
                    <Progress value={getProgressValue(shipment.status)} className="w-full md:w-1/3" />
                </div>

                <div className="flex gap-2 flex-col md:flex-row items-start md:items-center">
                    <Truck className="mr-2" />
                    <div>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                            <span className="text-sm">{formatDate(shipment.estimatedDeliveryDate)}</span>
                            <span className="text-xs italic px-4 py-1.5 bg-muted rounded-full items-center justify-center">
                                {shipment.destination}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="text-sm text-muted-foreground">Status: {shipment.status}</div>
        </div>

    )
}

