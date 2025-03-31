// src/components/transport/carrier/AddCarrierModal.tsx
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
import { addCarrier } from "@/lib/slices/shipmentSlice"
import type { Carrier } from "@/lib/types"
import { X } from "lucide-react"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define a Zod schema for carrier validation
const carrierSchema = z.object({
    name: z.string().min(1, { message: "Carrier name is required" }),
    contactPerson: z.string().min(1, { message: "Contact person is required" }),
    email: z.string().email({ message: "Invalid email format" }),
    phone: z.string().min(1, { message: "Phone number is required" }),
    rating: z.number({ invalid_type_error: "Rating must be a number" }).min(0).max(5).optional(),
    status: z.enum(["ACTIVE", "INACTIVE"], { required_error: "Status is required" }),
})

type CarrierFormValues = z.infer<typeof carrierSchema>

interface AddCarrierModalProps {
    open: boolean
    onClose: () => void
}

export function AddCarrierModal({ open, onClose }: AddCarrierModalProps) {
    const dispatch = useDispatch<AppDispatch>()
    const { loading } = useSelector((state: RootState) => state.shipment)
    const [backendError, setBackendError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<CarrierFormValues>({
        resolver: zodResolver(carrierSchema),
        defaultValues: {
            name: "",
            contactPerson: "",
            email: "",
            phone: "",
            rating: 0,
            status: "ACTIVE",
        },
    })

    const onSubmit = async (data: CarrierFormValues) => {
        setBackendError(null)
        try {
            await dispatch(addCarrier(data as Omit<Carrier, "id">)).unwrap()
            toast.success("Carrier added successfully!")
            reset()
            onClose()
        } catch (error: any) {
            if (typeof error === "string") {
                setBackendError(error)
            } else {
                toast.error(error?.message || "Failed to add carrier. Please try again.")
            }
        }
    }

    const handleClose = () => {
        setBackendError(null)
        reset()
        onClose()
    }

    // Handle status selection
    const handleStatusChange = (value: string) => {
        setValue("status", value as "ACTIVE" | "INACTIVE", { shouldValidate: true })
    }

    return (
        <AlertDialog open={open} onOpenChange={handleClose}>
            <AlertDialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
                <AlertDialogHeader>
                    <div className="flex justify-center items-center relative">
                        <AlertDialogTitle>Add New Carrier</AlertDialogTitle>
                        <button
                            onClick={handleClose}
                            className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full"
                        >
                            <X className="w-5 h-5 " />
                        </button>
                    </div>
                    <AlertDialogDescription>Fill in the details for the new carrier.</AlertDialogDescription>
                </AlertDialogHeader>

                {backendError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{backendError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Carrier Name</Label>
                        <Input id="name" placeholder="Carrier Name" {...register("name")} />
                        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="contactPerson">Contact Person</Label>
                        <Input id="contactPerson" placeholder="Contact Person" {...register("contactPerson")} />
                        {errors.contactPerson && <p className="text-sm text-red-500">{errors.contactPerson.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="Email" {...register("email")} />
                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" placeholder="Phone Number" {...register("phone")} />
                        {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="rating">Rating (0-5)</Label>
                        <Input
                            id="rating"
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            placeholder="Rating"
                            {...register("rating", { valueAsNumber: true })}
                        />
                        {errors.rating && <p className="text-sm text-red-500">{errors.rating.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select onValueChange={handleStatusChange} defaultValue="ACTIVE">
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        <input type="hidden" {...register("status")} />
                        {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setBackendError(null)}>Cancel</AlertDialogCancel>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Adding..." : "Add Carrier"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}

