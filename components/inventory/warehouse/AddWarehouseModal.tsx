// src/components/inventory/warehouse/AddWarehouseModal.tsx
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
import type { Warehouse } from "@/lib/types"
import { addWarehouse } from "@/lib/slices/inventorySlice"
import { X } from "lucide-react"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const addWarehouseSchema = z.object({
    name: z.string().min(1, { message: "Warehouse name is required" }),
    location: z.string().min(1, { message: "Location is required" }),
    capacity: z
        .number({ invalid_type_error: "Capacity must be a number" })
        .min(0, { message: "Capacity must be positive" }),
    utilizationPercentage: z
        .number({ invalid_type_error: "Utilization must be a number" })
        .min(0)
        .max(100, { message: "Utilization must be between 0 and 100" }),
    status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"], { required_error: "Please select a status" }),
})

type AddWarehouseFormValues = z.infer<typeof addWarehouseSchema>

interface AddWarehouseModalProps {
    open: boolean
    onClose: () => void
}

export function AddWarehouseModal({ open, onClose }: AddWarehouseModalProps) {
    const dispatch = useDispatch<AppDispatch>()
    const { loading } = useSelector((state: RootState) => state.inventory)
    const [backendError, setBackendError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm<AddWarehouseFormValues>({
        resolver: zodResolver(addWarehouseSchema),
        defaultValues: {
            status: "ACTIVE",
            utilizationPercentage: 0,
            capacity: 100,
        },
    })

    const onSubmit = async (data: AddWarehouseFormValues) => {
        setBackendError(null)
        try {
            await dispatch(addWarehouse(data as Omit<Warehouse, "id" | "createdAt" | "updatedAt">)).unwrap()
            toast.success("Warehouse added successfully!")
            reset()
            onClose()
        } catch (error: any) {
            // Check if the error is a specific backend error
            if (error.includes("duplicate") || error.includes("already exists")) {
                setBackendError(error)
            } else {
                toast.error(error || "Failed to add warehouse. Please try again.")
            }
        }
    }

    const handleClose = () => {
        setBackendError(null)
        reset()
        onClose()
    }

    return (
        <AlertDialog open={open} onOpenChange={handleClose}>
            <AlertDialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
                <AlertDialogHeader>
                    <div className="flex justify-center items-center relative">
                        <AlertDialogTitle>Add New Warehouse</AlertDialogTitle>
                        <button
                            onClick={handleClose}
                            className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full"
                        >
                            <X className="w-5 h-5 " />
                        </button>
                    </div>
                    <AlertDialogDescription>Fill in the details for the new warehouse.</AlertDialogDescription>
                </AlertDialogHeader>

                {backendError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{backendError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Warehouse Name</Label>
                        <Input id="name" placeholder="Warehouse Name" {...register("name")} />
                        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" placeholder="Location" {...register("location")} />
                        {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="capacity">Capacity</Label>
                        <Input
                            id="capacity"
                            type="number"
                            placeholder="Capacity"
                            {...register("capacity", { valueAsNumber: true })}
                        />
                        {errors.capacity && <p className="text-sm text-red-500">{errors.capacity.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="utilizationPercentage">Utilization Percentage</Label>
                        <Input
                            id="utilizationPercentage"
                            type="number"
                            placeholder="Utilization Percentage"
                            {...register("utilizationPercentage", { valueAsNumber: true })}
                        />
                        {errors.utilizationPercentage && (
                            <p className="text-sm text-red-500">{errors.utilizationPercentage.message}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <select id="status" {...register("status")} className="w-full p-2 border rounded">
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="MAINTENANCE">Maintenance</option>
                        </select>
                        {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setBackendError(null)}>Cancel</AlertDialogCancel>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Adding..." : "Add Warehouse"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}

