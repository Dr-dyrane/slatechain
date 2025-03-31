// src/components/logistics/AddShipmentModal.tsx
"use client"

import type React from "react"

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
import type { Shipment, Order, Route } from "@/lib/types"
import { toast } from "sonner"
import { addShipment, fetchCarriers, fetchRoutes, fetchTransports, fetchFreights } from "@/lib/slices/shipmentSlice"
import { fetchOrders } from "@/lib/slices/orderSlice"
import { X } from "lucide-react"
import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define a Zod schema for shipment validation
const shipmentSchema = z.object({
    name: z.string().min(1, { message: "Shipment name is required" }),
    orderId: z.string().min(1, { message: "Order ID is required" }),
    trackingNumber: z.string().min(1, { message: "Tracking number is required" }),
    carrier: z.string().min(1, { message: "Carrier is required" }),
    status: z.enum(["CREATED", "PREPARING", "IN_TRANSIT", "DELIVERED"] as const, {
        required_error: "Shipment status is required",
    }),
    destination: z.string().min(1, { message: "Destination is required" }),
    estimatedDeliveryDate: z.string().min(1, { message: "Estimated delivery date is required" }),
    freightId: z.string().min(1, { message: "Freight ID is required" }),
    routeId: z.string().min(1, { message: "Route ID is required" }),
})

type ShipmentFormValues = z.infer<typeof shipmentSchema>

interface AddShipmentModalProps {
    open: boolean
    onClose: () => void
}

export function AddShipmentModal({ open, onClose }: AddShipmentModalProps) {
    const dispatch = useDispatch<AppDispatch>()
    const { loading, carriers, routes, transports, freights } = useSelector((state: RootState) => state.shipment)
    const orders = useSelector((state: RootState) => state.orders.items as Order[])
    const [backendError, setBackendError] = useState<string | null>(null)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [destinationEdited, setDestinationEdited] = useState(false)
    const [adding, setAdding] = useState(false)

    // Fetch related data when the modal opens
    useEffect(() => {
        if (open) {
            dispatch(fetchOrders())
            dispatch(fetchCarriers())
            dispatch(fetchRoutes())
            dispatch(fetchTransports())
            dispatch(fetchFreights())
        }
    }, [open, dispatch])

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ShipmentFormValues>({
        resolver: zodResolver(shipmentSchema),
        defaultValues: {
            status: "PREPARING",
            estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        },
    })

    const selectedOrderId = watch("orderId")
    const selectedCarrier = watch("carrier")
    const destination = watch("destination")

    // Update destination when order changes
    useEffect(() => {
        if (selectedOrderId && orders.length > 0 && !destinationEdited) {
            const order = orders.find((o) => o.id.toString() === selectedOrderId)
            if (order) {
                setSelectedOrder(order)

                // Set destination from shipping address if available
                if (order.shippingAddress) {
                    const address = order.shippingAddress
                    const formattedAddress = `${address.address1}${address.address2 ? ", " + address.address2 : ""}, ${address.city || ""}, ${address.country || ""}`
                    setValue("destination", formattedAddress, { shouldValidate: true })
                }

                // Set name based on order number
                setValue("name", `Shipment for Order #${order.orderNumber}`, { shouldValidate: true })
            }
        }
    }, [selectedOrderId, orders, setValue, destinationEdited])

    // Track when user manually edits the destination
    const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value !== destination) {
            setDestinationEdited(true)
        }
    }

    const onSubmit = async (data: ShipmentFormValues) => {
        setBackendError(null)
        setAdding(true)
        try {
            // Generate a tracking number if not provided
            if (!data.trackingNumber) {
                data.trackingNumber = `TRK-${Date.now().toString().slice(-8)}`
            }

            await dispatch(addShipment(data as Omit<Shipment, "id">)).unwrap()
            toast.success("Shipment added successfully!")
            reset()
            setDestinationEdited(false)
            onClose()
        } catch (error: any) {
            if (typeof error === "string") {
                setBackendError(error)
            } else {
                toast.error(error?.message || "Failed to add shipment. Please try again.")
            }
        }
        finally {
            setAdding(false)
        }
    }

    const handleClose = () => {
        setBackendError(null)
        reset()
        setDestinationEdited(false)
        onClose()
    }

    // Handle order selection
    const handleOrderChange = (value: string) => {
        setValue("orderId", value, { shouldValidate: true })
        setDestinationEdited(false) // Reset destination edited flag when order changes
    }

    // Handle carrier selection
    const handleCarrierChange = (value: string) => {
        setValue("carrier", value, { shouldValidate: true })
    }

    // Handle route selection
    const handleRouteChange = (value: string) => {
        setValue("routeId", value, { shouldValidate: true })

        // If a route is selected, update destination if not manually edited
        if (!destinationEdited && routes.length > 0) {
            const selectedRoute = routes.find((r: Route) => r.id === value)
            if (selectedRoute && selectedRoute.destination?.location?.address) {
                setValue("destination", selectedRoute.destination.location.address, { shouldValidate: true })
            }
        }
    }

    // Handle freight selection
    const handleFreightChange = (value: string) => {
        setValue("freightId", value, { shouldValidate: true })
    }

    // Handle status selection
    const handleStatusChange = (value: string) => {
        setValue("status", value as Shipment["status"], { shouldValidate: true })
    }

    return (
        <AlertDialog open={open} onOpenChange={handleClose}>
            <AlertDialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
                <AlertDialogHeader>
                    <div className="flex justify-center items-center relative">
                        <AlertDialogTitle>Add New Shipment</AlertDialogTitle>
                        <button
                            onClick={handleClose}
                            className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full"
                        >
                            <X className="w-5 h-5 " />
                        </button>
                    </div>
                    <AlertDialogDescription>Fill in the details for the new shipment.</AlertDialogDescription>
                </AlertDialogHeader>

                {backendError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{backendError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="orderId">Order</Label>
                        <Select onValueChange={handleOrderChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select an order" />
                            </SelectTrigger>
                            <SelectContent>
                                {loading ? (
                                    <SelectItem value="loading" disabled>
                                        Loading orders...
                                    </SelectItem>
                                ) : orders.length === 0 ? (
                                    <SelectItem value="none" disabled>
                                        No orders available
                                    </SelectItem>
                                ) : (
                                    orders.map((order) => (
                                        <SelectItem key={order.id} value={order.id.toString()}>
                                            Order #{order.orderNumber} - ${order.totalAmount}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        <input type="hidden" {...register("orderId")} />
                        {errors.orderId && <p className="text-sm text-red-500">{errors.orderId.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="name">Shipment Name</Label>
                        <Input id="name" placeholder="Shipment Name" {...register("name")} />
                        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="trackingNumber">Tracking Number</Label>
                        <Input
                            id="trackingNumber"
                            placeholder="Tracking Number (auto-generated if empty)"
                            {...register("trackingNumber")}
                        />
                        {errors.trackingNumber && <p className="text-sm text-red-500">{errors.trackingNumber.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="carrier">Carrier</Label>
                        <Select onValueChange={handleCarrierChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a carrier" />
                            </SelectTrigger>
                            <SelectContent>
                                {loading ? (
                                    <SelectItem value="loading" disabled>
                                        Loading carriers...
                                    </SelectItem>
                                ) : carriers.length === 0 ? (
                                    <SelectItem value="none" disabled>
                                        No carriers available
                                    </SelectItem>
                                ) : (
                                    carriers.map((carrier) => (
                                        <SelectItem key={carrier.id} value={carrier.name}>
                                            {carrier.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        <input type="hidden" {...register("carrier")} />
                        {errors.carrier && <p className="text-sm text-red-500">{errors.carrier.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="routeId">Route</Label>
                        <Select onValueChange={handleRouteChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a route" />
                            </SelectTrigger>
                            <SelectContent>
                                {loading ? (
                                    <SelectItem value="loading" disabled>
                                        Loading routes...
                                    </SelectItem>
                                ) : routes.length === 0 ? (
                                    <SelectItem value="none" disabled>
                                        No routes available
                                    </SelectItem>
                                ) : (
                                    routes.map((route) => (
                                        <SelectItem key={route.id} value={route.id}>
                                            {route.name} ({route.startLocation} to {route.endLocation})
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        <input type="hidden" {...register("routeId")} />
                        {errors.routeId && <p className="text-sm text-red-500">{errors.routeId.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="freightId">Freight</Label>
                        <Select onValueChange={handleFreightChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a freight" />
                            </SelectTrigger>
                            <SelectContent>
                                {loading ? (
                                    <SelectItem value="loading" disabled>
                                        Loading freights...
                                    </SelectItem>
                                ) : freights.length === 0 ? (
                                    <SelectItem value="none" disabled>
                                        No freights available
                                    </SelectItem>
                                ) : (
                                    freights
                                        .filter(
                                            (f) => !selectedCarrier || f.carrierId === carriers.find((c) => c.name === selectedCarrier)?.id,
                                        )
                                        .map((freight) => (
                                            <SelectItem key={freight.id} value={freight.id}>
                                                {freight.type} - {freight.freightNumber || freight.id}
                                            </SelectItem>
                                        ))
                                )}
                            </SelectContent>
                        </Select>
                        <input type="hidden" {...register("freightId")} />
                        {errors.freightId && <p className="text-sm text-red-500">{errors.freightId.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select onValueChange={handleStatusChange} defaultValue="PREPARING">
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CREATED">Created</SelectItem>
                                <SelectItem value="PREPARING">Preparing</SelectItem>
                                <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                                <SelectItem value="DELIVERED">Delivered</SelectItem>
                            </SelectContent>
                        </Select>
                        <input type="hidden" {...register("status")} />
                        {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="destination">
                            Destination
                            {selectedOrder && !selectedOrder.shippingAddress && (
                                <span className="text-amber-500 ml-2 text-xs">(No shipping address found for this order)</span>
                            )}
                        </Label>
                        <Input
                            id="destination"
                            placeholder="Destination Address"
                            {...register("destination")}
                            onChange={handleDestinationChange}
                        />
                        {errors.destination && <p className="text-sm text-red-500">{errors.destination.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="estimatedDeliveryDate">Estimated Delivery Date</Label>
                        <Input id="estimatedDeliveryDate" type="datetime-local" {...register("estimatedDeliveryDate")} />
                        {errors.estimatedDeliveryDate && (
                            <p className="text-sm text-red-500">{errors.estimatedDeliveryDate.message}</p>
                        )}
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setBackendError(null)}>Cancel</AlertDialogCancel>
                        <Button type="submit" disabled={loading || adding}>
                            {loading || adding ? "Adding..." : "Add Shipment"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}

