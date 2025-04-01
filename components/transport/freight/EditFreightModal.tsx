// src/components/transport/freight/EditFreightModal.tsx
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
import { toast } from "sonner"
import { updateFreight, fetchCarriers, fetchRoutes, fetchTransports } from "@/lib/slices/shipmentSlice"
import type { Freight, FreightStatus } from "@/lib/types"
import { FreightTypes } from "@/lib/types"
import { X } from "lucide-react"
import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

// Define a Zod schema for freight validation
const freightSchema = z.object({
    id: z.string().min(1, { message: "ID is required" }),
    type: z.enum(
        [
            FreightTypes.STANDARD,
            FreightTypes.EXPRESS,
            FreightTypes.REFRIGERATED,
            FreightTypes.HAZARDOUS,
            FreightTypes.OVERSIZED,
            FreightTypes.FRAGILE,
            FreightTypes.PERISHABLE,
            FreightTypes.BULK,
            FreightTypes.CONTAINER,
            FreightTypes.LIQUID,
        ],
        { required_error: "Freight type is required" },
    ),
    carrierId: z.string().min(1, { message: "Carrier is required" }),
    routeId: z.string().min(1, { message: "Route is required" }),
    status: z.enum(["PENDING", "IN_TRANSIT", "DELIVERED", "ON_HOLD"], { required_error: "Status is required" }),
    vehicleType: z.enum(["TRUCK", "TRAIN", "PLANE", "SHIP", "OTHER"], { required_error: "Vehicle type is required" }),
    vehicleIdentifier: z.string().min(1, { message: "Vehicle identifier is required" }),
    departureDate: z.string().min(1, { message: "Departure date is required" }),
    arrivalDate: z.string().min(1, { message: "Arrival date is required" }),
    totalWeight: z
        .number({ invalid_type_error: "Weight must be a number" })
        .min(0, { message: "Weight must be positive" }),
    totalVolume: z
        .number({ invalid_type_error: "Volume must be a number" })
        .min(0, { message: "Volume must be positive" }),
    hazmat: z.boolean().default(false),
    notes: z.string().optional(),
})

type FreightFormValues = z.infer<typeof freightSchema>

interface EditFreightModalProps {
    open: boolean
    onClose: () => void
    freight: Freight
}

export function EditFreightModal({ open, onClose, freight }: EditFreightModalProps) {
    const dispatch = useDispatch<AppDispatch>()
    const { loading, carriers, routes, transports } = useSelector((state: RootState) => state.shipment)
    const [backendError, setBackendError] = useState<string | null>(null)
    const [updating, setUpdating] = useState(false)

    // Fetch carriers, routes, and transports when the modal opens
    useEffect(() => {
        if (open) {
            if (carriers.length === 0) dispatch(fetchCarriers())
            if (routes.length === 0) dispatch(fetchRoutes())
            if (transports.length === 0) dispatch(fetchTransports())
        }
    }, [open, dispatch, carriers.length, routes.length, transports.length])

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FreightFormValues>({
        resolver: zodResolver(freightSchema),
        defaultValues: {
            id: freight?.id || "",
            type: freight?.type || FreightTypes.STANDARD,
            carrierId: freight?.carrierId || "",
            routeId: freight?.routeId || "",
            status: freight?.status || "PENDING",
            vehicleType: freight?.vehicle?.type || "TRUCK",
            vehicleIdentifier: freight?.vehicle?.identifier || "",
            departureDate: freight?.schedule?.departureDate || new Date().toISOString().slice(0, 16),
            arrivalDate:
                freight?.schedule?.arrivalDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
            totalWeight: freight?.cargo?.totalWeight || 0,
            totalVolume: freight?.cargo?.totalVolume || 0,
            hazmat: freight?.cargo?.hazmat || false,
            notes: freight?.notes || "",
        },
    })

    const selectedCarrierId = watch("carrierId")

    useEffect(() => {
        if (freight) {
            reset({
                id: freight.id,
                type: freight.type as FreightTypes,
                carrierId: freight.carrierId,
                routeId: freight.routeId,
                status: freight.status as FreightStatus,
                vehicleType: freight.vehicle?.type,
                vehicleIdentifier: freight.vehicle?.identifier,
                departureDate: freight.schedule?.departureDate
                    ? new Date(freight.schedule.departureDate).toISOString().slice(0, 16)
                    : "",
                arrivalDate: freight.schedule?.arrivalDate
                    ? new Date(freight.schedule.arrivalDate).toISOString().slice(0, 16)
                    : "",
                totalWeight: freight.cargo?.totalWeight || 0,
                totalVolume: freight.cargo?.totalVolume || 0,
                hazmat: freight.cargo?.hazmat || false,
                notes: freight.notes || "",
            })
        }
    }, [freight, reset])

    const onSubmit = async (data: FreightFormValues) => {
        setBackendError(null)
        setUpdating(true)
        try {
            // Create freight data structure required by the model
            const freightData = {
                ...data,
                id: data.id,
                type: data.type,
                status: data.status,
                carrierId: data.carrierId,
                routeId: data.routeId,
                vehicle: {
                    type: data.vehicleType,
                    identifier: data.vehicleIdentifier,
                    capacity: freight.vehicle?.capacity || {
                        weight: data.totalWeight * 1.2, // 20% more than current weight
                        volume: data.totalVolume * 1.2, // 20% more than current volume
                        units: 1,
                    },
                },
                currentLocation: transports.find((t) => t.id === data.vehicleIdentifier)?.currentLocation || {
                    latitude: 0,
                    longitude: 0,
                },
                schedule: {
                    departureDate: new Date(data.departureDate),
                    arrivalDate: new Date(data.arrivalDate),
                },
                cargo: {
                    totalWeight: data.totalWeight,
                    totalVolume: data.totalVolume,
                    hazmat: data.hazmat,
                },
                notes: data.notes,
            }

            await dispatch(updateFreight(freightData as any)).unwrap()
            toast.success("Freight updated successfully!")
            onClose()
        } catch (error: any) {
            if (typeof error === "string") {
                setBackendError(error)
            } else {
                toast.error(error?.message || "Failed to update freight. Please try again.")
            }
        } finally {
            setUpdating(false)
        }
    }

    const handleClose = () => {
        setBackendError(null)
        onClose()
    }

    // Handle freight type selection
    const handleFreightTypesChange = (value: string) => {
        setValue("type", value as FreightTypes, { shouldValidate: true })
    }

    // Handle carrier selection
    const handleCarrierChange = (value: string) => {
        setValue("carrierId", value, { shouldValidate: true })
    }

    // Handle route selection
    const handleRouteChange = (value: string) => {
        setValue("routeId", value, { shouldValidate: true })
    }

    // Handle vehicle type selection
    const handleVehicleTypeChange = (value: string) => {
        setValue("vehicleType", value as any, { shouldValidate: true })
    }

    // Handle status selection
    const handleStatusChange = (value: string) => {
        setValue("status", value as FreightStatus, { shouldValidate: true })
    }

    return (
        <AlertDialog open={open} onOpenChange={handleClose}>
            <AlertDialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
                <AlertDialogHeader>
                    <div className="flex justify-center items-center relative">
                        <AlertDialogTitle>Edit Freight</AlertDialogTitle>
                        <button
                            onClick={handleClose}
                            className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full"
                        >
                            <X className="w-5 h-5 " />
                        </button>
                    </div>
                    <AlertDialogDescription>Update freight details.</AlertDialogDescription>
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
                    </div>

                    <div>
                        <Label htmlFor="type">Freight Type</Label>
                        <Select onValueChange={handleFreightTypesChange} defaultValue={freight.type}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select freight type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={FreightTypes.STANDARD}>Standard</SelectItem>
                                <SelectItem value={FreightTypes.EXPRESS}>Express</SelectItem>
                                <SelectItem value={FreightTypes.REFRIGERATED}>Refrigerated</SelectItem>
                                <SelectItem value={FreightTypes.HAZARDOUS}>Hazardous</SelectItem>
                                <SelectItem value={FreightTypes.OVERSIZED}>Oversized</SelectItem>
                                <SelectItem value={FreightTypes.FRAGILE}>Fragile</SelectItem>
                                <SelectItem value={FreightTypes.PERISHABLE}>Perishable</SelectItem>
                                <SelectItem value={FreightTypes.BULK}>Bulk</SelectItem>
                                <SelectItem value={FreightTypes.CONTAINER}>Container</SelectItem>
                                <SelectItem value={FreightTypes.LIQUID}>Liquid</SelectItem>
                            </SelectContent>
                        </Select>
                        <input type="hidden" {...register("type")} />
                        {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="carrierId">Carrier</Label>
                        <Select onValueChange={handleCarrierChange} defaultValue={freight.carrierId}>
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
                                        <SelectItem key={carrier.id} value={carrier.id}>
                                            {carrier.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        <input type="hidden" {...register("carrierId")} />
                        {errors.carrierId && <p className="text-sm text-red-500">{errors.carrierId.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="routeId">Route</Label>
                        <Select onValueChange={handleRouteChange} defaultValue={freight.routeId}>
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
                        <Label htmlFor="status">Status</Label>
                        <Select onValueChange={handleStatusChange} defaultValue={freight.status}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                                <SelectItem value="DELIVERED">Delivered</SelectItem>
                                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                            </SelectContent>
                        </Select>
                        <input type="hidden" {...register("status")} />
                        {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="vehicleType">Vehicle Type</Label>
                        <Select onValueChange={handleVehicleTypeChange} defaultValue={freight.vehicle?.type}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a vehicle type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TRUCK">Truck</SelectItem>
                                <SelectItem value="TRAIN">Train</SelectItem>
                                <SelectItem value="PLANE">Plane</SelectItem>
                                <SelectItem value="SHIP">Ship</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <input type="hidden" {...register("vehicleType")} />
                        {errors.vehicleType && <p className="text-sm text-red-500">{errors.vehicleType.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="vehicleIdentifier">Vehicle Identifier</Label>
                        <Select
                            onValueChange={(value) => setValue("vehicleIdentifier", value, { shouldValidate: true })}
                            defaultValue={freight.vehicle?.identifier}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a vehicle" />
                            </SelectTrigger>
                            <SelectContent>
                                {loading ? (
                                    <SelectItem value="loading" disabled>
                                        Loading vehicles...
                                    </SelectItem>
                                ) : transports.length === 0 ? (
                                    <SelectItem value="none" disabled>
                                        No vehicles available
                                    </SelectItem>
                                ) : (
                                    transports
                                        .filter((t) => !selectedCarrierId || t.carrierId === selectedCarrierId)
                                        .map((transport) => (
                                            <SelectItem key={transport.id} value={transport.id}>
                                                {transport.name} ({transport.type})
                                            </SelectItem>
                                        ))
                                )}
                            </SelectContent>
                        </Select>
                        <input type="hidden" {...register("vehicleIdentifier")} />
                        {errors.vehicleIdentifier && <p className="text-sm text-red-500">{errors.vehicleIdentifier.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="departureDate">Departure Date</Label>
                        <Input id="departureDate" type="datetime-local" {...register("departureDate")} />
                        {errors.departureDate && <p className="text-sm text-red-500">{errors.departureDate.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="arrivalDate">Arrival Date</Label>
                        <Input id="arrivalDate" type="datetime-local" {...register("arrivalDate")} />
                        {errors.arrivalDate && <p className="text-sm text-red-500">{errors.arrivalDate.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="totalWeight">Total Weight (kg)</Label>
                        <Input
                            id="totalWeight"
                            type="number"
                            placeholder="Total Weight"
                            {...register("totalWeight", { valueAsNumber: true })}
                        />
                        {errors.totalWeight && <p className="text-sm text-red-500">{errors.totalWeight.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="totalVolume">Total Volume (m³)</Label>
                        <Input
                            id="totalVolume"
                            type="number"
                            placeholder="Total Volume"
                            {...register("totalVolume", { valueAsNumber: true })}
                        />
                        {errors.totalVolume && <p className="text-sm text-red-500">{errors.totalVolume.message}</p>}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="hazmat"
                            checked={watch("hazmat")}
                            onCheckedChange={(checked) => setValue("hazmat", checked as boolean)}
                        />
                        <Label htmlFor="hazmat" className="cursor-pointer">
                            Hazardous Materials
                        </Label>
                    </div>

                    <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" placeholder="Notes" {...register("notes")} />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setBackendError(null)}>Cancel</AlertDialogCancel>
                        <Button type="submit" disabled={loading || updating}>
                            {loading || updating ? "Updating..." : "Update Freight"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}

