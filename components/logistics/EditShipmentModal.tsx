// src/components/logistics/EditShipmentModal.tsx
"use client"

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { AppDispatch, RootState } from "@/lib/store"
import { useDispatch, useSelector } from "react-redux"
import type { Shipment } from "@/lib/types"
import { toast } from "sonner"
import { updateShipment } from "@/lib/slices/shipmentSlice"
import { X } from "lucide-react"
import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const shipmentSchema = z.object({
    id: z.string().min(1, { message: "Id is required" }),
    name: z.string().min(1, { message: "Shipment name is required" }),
    orderId: z.string().min(1, { message: "Order ID is required" }),
    trackingNumber: z.string().min(1, { message: "Tracking number is required" }),
    carrier: z.string().min(1, { message: "Carrier is required" }),
    status: z.enum(["CREATED", "PREPARING", "IN_TRANSIT", "DELIVERED"] as const, {
        required_error: "Shipment status is required",
    }),
    destination: z.string().min(1, { message: "Destination is required" }),
    estimatedDeliveryDate: z.string().min(1, { message: "Estimated delivery date is required" }),
    freightId: z.string().min(1, { message: "Freight Id date is required" }),
    routeId: z.string().min(1, { message: "Route Id date is required" }),
})

type ShipmentFormValues = z.infer<typeof shipmentSchema>

interface EditShipmentModalProps {
    open: boolean
    onClose: () => void
    shipment: Shipment | null
}

export function EditShipmentModal({ open, onClose, shipment }: EditShipmentModalProps) {
    const dispatch = useDispatch<AppDispatch>()
    const { loading } = useSelector((state: RootState) => state.shipment)
    const [backendError, setBackendError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm<ShipmentFormValues>({
        resolver: zodResolver(shipmentSchema),
        defaultValues: {
            id: shipment?.id || "",
            name: shipment?.name || "",
            orderId: shipment?.orderId || "",
            trackingNumber: shipment?.trackingNumber || "",
            carrier: shipment?.carrier || "",
            status: shipment?.status || "PREPARING",
            destination: shipment?.destination || "",
            estimatedDeliveryDate: shipment?.estimatedDeliveryDate || "",
            freightId: shipment?.freightId || "",
            routeId: shipment?.routeId || "",
        },
    })

    useEffect(() => {
        if (shipment) {
            reset({
                id: shipment?.id || "",
                name: shipment?.name || "",
                orderId: shipment?.orderId || "",
                trackingNumber: shipment?.trackingNumber || "",
                carrier: shipment?.carrier || "",
                status: shipment?.status || "PREPARING",
                destination: shipment?.destination || "",
                estimatedDeliveryDate: shipment?.estimatedDeliveryDate || "",
                freightId: shipment?.freightId || "",
                routeId: shipment?.routeId || "",
            })
        }
    }, [shipment, reset])

    const onSubmit = async (data: ShipmentFormValues) => {
        setBackendError(null)
        try {
            await dispatch(updateShipment(data as Shipment)).unwrap()
            toast.success("Shipment updated successfully!")
            onClose()
        } catch (error: any) {
            if (typeof error === "string") {
                setBackendError(error)
            } else {
                toast.error(error?.message || "Failed to update shipment. Please try again.")
            }
        }
    }

    const handleClose = () => {
        setBackendError(null)
        onClose()
    }

    return (
        <AlertDialog open={open} onOpenChange={handleClose}>
            <AlertDialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
                <AlertDialogHeader>
                    <div className="flex justify-center items-center relative">
                        <AlertDialogTitle>Edit Shipment</AlertDialogTitle>
                        <button
                            onClick={handleClose}
                            className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full"
                        >
                            <X className="w-5 h-5 " />
                        </button>
                    </div>
                    <AlertDialogDescription>Update shipment details.</AlertDialogDescription>
                </AlertDialogHeader>

                {backendError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{backendError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="id">ID</Label>
                        <Input id="id" placeholder="ID" {...register("id")} readOnly />
                        {errors.id && <p className="text-sm text-red-500">{errors.id.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="name">Shipment Name</Label>
                        <Input id="name" placeholder="Shipment Name" {...register("name")} />
                        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="orderId">Order ID</Label>
                        <Input id="orderId" placeholder="Order ID" {...register("orderId")} />
                        {errors.orderId && <p className="text-sm text-red-500">{errors.orderId.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="trackingNumber">Tracking Number</Label>
                        <Input id="trackingNumber" placeholder="Tracking Number" {...register("trackingNumber")} />
                        {errors.trackingNumber && <p className="text-sm text-red-500">{errors.trackingNumber.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="carrier">Carrier</Label>
                        <Input id="carrier" placeholder="Carrier" {...register("carrier")} />
                        {errors.carrier && <p className="text-sm text-red-500">{errors.carrier.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <select id="status" {...register("status")} className="w-full p-2 border rounded">
                            <option value="PREPARING">Preparing</option>
                            <option value="IN_TRANSIT">In Transit</option>
                            <option value="DELIVERED">Delivered</option>
                        </select>
                        {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="destination">Destination</Label>
                        <Input id="destination" placeholder="Destination" {...register("destination")} />
                        {errors.destination && <p className="text-sm text-red-500">{errors.destination.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="estimatedDeliveryDate">Estimated Delivery Date</Label>
                        <Input id="estimatedDeliveryDate" type="datetime-local" {...register("estimatedDeliveryDate")} />
                        {errors.estimatedDeliveryDate && (
                            <p className="text-sm text-red-500">{errors.estimatedDeliveryDate.message}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="freightId">Freight Id</Label>
                        <Input id="freightId" type="text" {...register("freightId")} />
                        {errors.freightId && <p className="text-sm text-red-500">{errors.freightId.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="routeId">Route Id</Label>
                        <Input id="routeId" type="text" {...register("routeId")} />
                        {errors.routeId && <p className="text-sm text-red-500">{errors.routeId.message}</p>}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setBackendError(null)}>Cancel</AlertDialogCancel>
                        <Button type="submit" disabled={loading || !isValid}>
                            {loading ? "Updating..." : "Update Shipment"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}

