// src/components/transport/transport/DeleteTransportModal.tsx
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
import { removeTransport } from "@/lib/slices/shipmentSlice"
import type { Transport } from "@/lib/types"
import { X } from "lucide-react"
import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const deleteTransportSchema = z.object({
    id: z.string().min(1, { message: "ID is required" }),
    confirmation: z.literal("DELETE", {
        errorMap: () => ({ message: "Please type DELETE to confirm" }),
    }),
})

type DeleteTransportFormValues = z.infer<typeof deleteTransportSchema>

interface DeleteTransportModalProps {
    open: boolean
    onClose: () => void
    transport: Transport
    deleteModalTitle?: string
}

export function DeleteTransportModal({ open, onClose, transport, deleteModalTitle }: DeleteTransportModalProps) {
    const dispatch = useDispatch<AppDispatch>()
    const { loading } = useSelector((state: RootState) => state.shipment)
    const [backendError, setBackendError] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm<DeleteTransportFormValues>({
        resolver: zodResolver(deleteTransportSchema),
        defaultValues: {
            id: transport?.id || "",
            confirmation: "" as any,
        },
    })

    useEffect(() => {
        if (transport) {
            reset({
                id: transport.id,
                confirmation: "" as any,
            })
        }
    }, [transport, reset])

    const onSubmit = async (data: DeleteTransportFormValues) => {
        setBackendError(null)
        setDeleting(true)
        try {
            await dispatch(removeTransport(data.id)).unwrap()
            toast.success("Transport deleted successfully!")
            onClose()
        } catch (error: any) {
            if (typeof error === "string") {
                setBackendError(error)
            } else {
                toast.error(error?.message || "Failed to delete transport. Please try again.")
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
                        <AlertDialogTitle>{deleteModalTitle || "Delete Transport"}</AlertDialogTitle>
                        <button
                            onClick={handleClose}
                            className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full"
                        >
                            <X className="w-5 h-5 " />
                        </button>
                    </div>
                    <AlertDialogDescription>
                        Are you sure you want to delete this transport? This action cannot be undone.
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
                            {loading || deleting ? "Deleting..." : "Delete Transport"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}

