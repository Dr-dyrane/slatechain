// src/components/transport/route/DeleteRouteModal.tsx
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
import { removeRoute } from "@/lib/slices/shipmentSlice"
import type { Route } from "@/lib/types"
import { X } from "lucide-react"
import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const deleteRouteSchema = z.object({
    id: z.string().min(1, { message: "ID is required" }),
    confirmation: z.literal("DELETE", {
        errorMap: () => ({ message: "Please type DELETE to confirm" }),
    }),
})

type DeleteRouteFormValues = z.infer<typeof deleteRouteSchema>

interface DeleteRouteModalProps {
    open: boolean
    onClose: () => void
    route: Route
    deleteModalTitle?: string
}

export function DeleteRouteModal({ open, onClose, route, deleteModalTitle }: DeleteRouteModalProps) {
    const dispatch = useDispatch<AppDispatch>()
    const { loading } = useSelector((state: RootState) => state.shipment)
    const [backendError, setBackendError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm<DeleteRouteFormValues>({
        resolver: zodResolver(deleteRouteSchema),
        defaultValues: {
            id: route?.id || "",
            confirmation: "" as any,
        },
    })

    useEffect(() => {
        if (route) {
            reset({
                id: route.id,
                confirmation: "" as any,
            })
        }
    }, [route, reset])

    const onSubmit = async (data: DeleteRouteFormValues) => {
        setBackendError(null)
        try {
            await dispatch(removeRoute(data.id)).unwrap()
            toast.success("Route deleted successfully!")
            onClose()
        } catch (error: any) {
            if (typeof error === "string") {
                setBackendError(error)
            } else {
                toast.error(error?.message || "Failed to delete route. Please try again.")
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
            <AlertDialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto">
                <AlertDialogHeader>
                    <div className="flex justify-center items-center relative">
                        <AlertDialogTitle>{deleteModalTitle || "Delete Route"}</AlertDialogTitle>
                        <button
                            onClick={handleClose}
                            className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full"
                        >
                            <X className="w-5 h-5 " />
                        </button>
                    </div>
                    <AlertDialogDescription>
                        Are you sure you want to delete this route? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {backendError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{backendError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="confirmation">Type DELETE to confirm</Label>
                        <Input id="confirmation" placeholder="DELETE" {...register("confirmation")} />
                        {errors.confirmation && <p className="text-sm text-red-500">{errors.confirmation.message}</p>}
                    </div>
                    <input type="hidden" {...register("id")} />

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setBackendError(null)}>Cancel</AlertDialogCancel>
                        <Button type="submit" disabled={loading} variant="destructive">
                            {loading ? "Deleting..." : "Delete Route"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}

