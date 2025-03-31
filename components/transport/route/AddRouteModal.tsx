// src/components/transport/route/AddRouteModal.tsx
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
import { addRoute, fetchCarriers } from "@/lib/slices/shipmentSlice"
import type { RouteType, RouteStatus } from "@/lib/types"
import { X } from "lucide-react"
import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define a Zod schema for route validation
const routeSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    startLocation: z.string().min(1, { message: "Start location is required" }),
    endLocation: z.string().min(1, { message: "End location is required" }),
    distance: z
        .number({ invalid_type_error: "Distance must be a number" })
        .min(0, { message: "Distance must be positive" }),
    estimatedDuration: z
        .number({ invalid_type_error: "Duration must be a number" })
        .min(0, { message: "Duration must be positive" }),
    type: z.enum(["LOCAL", "REGIONAL", "INTERNATIONAL"], { required_error: "Route type is required" }),
    status: z.enum(["PLANNED", "ACTIVE", "INACTIVE", "UNDER_MAINTENANCE"], { required_error: "Status is required" }),
})

type RouteFormValues = z.infer<typeof routeSchema>

interface AddRouteModalProps {
    open: boolean
    onClose: () => void
}

export function AddRouteModal({ open, onClose }: AddRouteModalProps) {
    const dispatch = useDispatch<AppDispatch>()
    const { loading, carriers } = useSelector((state: RootState) => state.shipment)
    const [backendError, setBackendError] = useState<string | null>(null)

    // Fetch carriers when the modal opens
    useEffect(() => {
        if (open && carriers.length === 0) {
            dispatch(fetchCarriers())
        }
    }, [open, dispatch, carriers.length])

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<RouteFormValues>({
        resolver: zodResolver(routeSchema),
        defaultValues: {
            name: "",
            startLocation: "",
            endLocation: "",
            distance: 0,
            estimatedDuration: 0,
            type: "LOCAL",
            status: "PLANNED",
        },
    })

    const onSubmit = async (data: RouteFormValues) => {
        setBackendError(null)
        try {
            // Create origin and destination objects required by the model
            const routeData = {
                ...data,
                origin: {
                    type: "PICKUP",
                    location: {
                        address: data.startLocation,
                    },
                },
                destination: {
                    type: "DELIVERY",
                    location: {
                        address: data.endLocation,
                    },
                },
                schedule: {
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                },
            }

            await dispatch(addRoute(routeData as any)).unwrap()
            toast.success("Route added successfully!")
            reset()
            onClose()
        } catch (error: any) {
            if (typeof error === "string") {
                setBackendError(error)
            } else {
                toast.error(error?.message || "Failed to add route. Please try again.")
            }
        }
    }

    const handleClose = () => {
        setBackendError(null)
        reset()
        onClose()
    }

    // Handle type selection
    const handleTypeChange = (value: string) => {
        setValue("type", value as RouteType, { shouldValidate: true })
    }

    // Handle status selection
    const handleStatusChange = (value: string) => {
        setValue("status", value as RouteStatus, { shouldValidate: true })
    }

    return (
        <AlertDialog open={open} onOpenChange={handleClose}>
            <AlertDialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
                <AlertDialogHeader>
                    <div className="flex justify-center items-center relative">
                        <AlertDialogTitle>Add New Route</AlertDialogTitle>
                        <button
                            onClick={handleClose}
                            className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full"
                        >
                            <X className="w-5 h-5 " />
                        </button>
                    </div>
                    <AlertDialogDescription>Fill in the details for the new route.</AlertDialogDescription>
                </AlertDialogHeader>

                {backendError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{backendError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Route Name</Label>
                        <Input id="name" placeholder="Route Name" {...register("name")} />
                        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="startLocation">Start Location</Label>
                        <Input id="startLocation" placeholder="Start Location" {...register("startLocation")} />
                        {errors.startLocation && <p className="text-sm text-red-500">{errors.startLocation.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="endLocation">End Location</Label>
                        <Input id="endLocation" placeholder="End Location" {...register("endLocation")} />
                        {errors.endLocation && <p className="text-sm text-red-500">{errors.endLocation.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="distance">Distance (km)</Label>
                        <Input
                            id="distance"
                            type="number"
                            placeholder="Distance"
                            {...register("distance", { valueAsNumber: true })}
                        />
                        {errors.distance && <p className="text-sm text-red-500">{errors.distance.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="estimatedDuration">Estimated Duration (hours)</Label>
                        <Input
                            id="estimatedDuration"
                            type="number"
                            step="0.1"
                            placeholder="Estimated Duration"
                            {...register("estimatedDuration", { valueAsNumber: true })}
                        />
                        {errors.estimatedDuration && <p className="text-sm text-red-500">{errors.estimatedDuration.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="type">Route Type</Label>
                        <Select onValueChange={handleTypeChange} defaultValue="LOCAL">
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="LOCAL">Local</SelectItem>
                                <SelectItem value="REGIONAL">Regional</SelectItem>
                                <SelectItem value="INTERNATIONAL">International</SelectItem>
                            </SelectContent>
                        </Select>
                        <input type="hidden" {...register("type")} />
                        {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select onValueChange={handleStatusChange} defaultValue="PLANNED">
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PLANNED">Planned</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                                <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
                            </SelectContent>
                        </Select>
                        <input type="hidden" {...register("status")} />
                        {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setBackendError(null)}>Cancel</AlertDialogCancel>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Adding..." : "Add Route"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}

