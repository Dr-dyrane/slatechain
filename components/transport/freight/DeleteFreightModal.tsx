// src/components/transport/freight/DeleteFreightModal.tsx
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
import { removeFreight } from "@/lib/slices/shipmentSlice"
import type { Freight } from "@/lib/types"
import { X } from "lucide-react"
import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const deleteFreightSchema = z.object({
    id: z.string().min(1, { message: "ID is required" }),
    confirmation: z.literal("DELETE", {
        errorMap: () => ({ message: "Please type DELETE to confirm" }),
    }),
})

type DeleteFreightFormValues = z.infer<typeof deleteFreightSchema>

interface DeleteFreightModalProps {
    open: boolean
    onClose: () => void
    freight: Freight
    deleteModalTitle?: string
}

export function DeleteFreightModal({ open, onClose, freight, deleteModalTitle }: DeleteFreightModalProps) {
    const dispatch = useDispatch<AppDispatch>()
    const { loading } = useSelector((state: RootState) => state.shipment)
    const [backendError, setBackendError] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm<DeleteFreightFormValues>({
        resolver: zodResolver(deleteFreightSchema),
        defaultValues: {
            id: freight?.id || "",
            confirmation: "" as any,
        },
    })

    useEffect(() => {
        if (freight) {
            reset({
                id: freight.id,
                confirmation: "" as any,
            })
        }
    }, [freight, reset])

    const onSubmit = async (data: DeleteFreightFormValues) => {
        setBackendError(null)
        setDeleting(true)
        try {
            await dispatch(removeFreight(data.id)).unwrap()
            toast.success("Freight deleted successfully!")
            onClose()
        } catch (error: any) {
            if (typeof error === "string") {
                setBackendError(error)
            } else {
                toast.error(error?.message || "Failed to delete freight. Please try again.")
            }
        }
        finally {
            setDeleting(false)
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
                        <AlertDialogTitle>{deleteModalTitle || "Delete Freight"}</AlertDialogTitle>
                        <button
                            onClick={handleClose}
                            className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full"
                        >
                            <X className="w-5 h-5 " />
                        </button>
                    </div>
                    <AlertDialogDescription>
                        Are you sure you want to delete this freight? This action cannot be undone.
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
                        <Button type="submit" disabled={loading || deleting} variant="destructive">
                            {loading || deleting ? "Deleting..." : "Delete Freight"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}

