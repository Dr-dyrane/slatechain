// src/components/transport/carrier/DeleteCarrierModal.tsx
"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { removeCarrier } from "@/lib/slices/shipmentSlice";
import { AppDispatch, RootState } from "@/lib/store";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Carrier } from "@/lib/types";

const deleteSchema = z.object({
    id: z.string().min(1, "Id is required"),
    confirmation: z.string().min(1, "Name is required"),
});

type DeleteFormValues = z.infer<typeof deleteSchema>;

interface DeleteCarrierModalProps {
    open: boolean;
    onClose: () => void;
    carrier: Carrier | null;
    deleteModalTitle?: string;
}

export function DeleteCarrierModal({
    open,
    onClose,
    carrier,
    deleteModalTitle,
}: DeleteCarrierModalProps) {
    const [carrierName, setCarrierName] = useState<string>('');
    const { loading } = useSelector((state: RootState) => state.shipment);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (carrier) {
            setCarrierName(carrier.name);
        }
    }, [carrier]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm<DeleteFormValues>({
        resolver: zodResolver(deleteSchema),
        defaultValues: {
            id: carrier?.id ?? "",
        },
        mode: "onChange", // Enables dynamic validation
    });

    const onSubmit = async (formData: DeleteFormValues) => {
        try {
            if (formData.id) {
                await dispatch(removeCarrier(formData.id)).unwrap();
                toast.success("Carrier deleted successfully.");
                reset();
                onClose();
            }
        } catch (error) {
            toast.error("Failed to delete the carrier. Please try again later.");
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
                <AlertDialogHeader>
                    <div className="flex justify-center items-center relative">
                        <AlertDialogTitle>{deleteModalTitle || "Confirm Delete Carrier"}</AlertDialogTitle>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 absolute -top-4 -right-4 p-2 bg-muted rounded-full">
                            <X className="w-5 h-5 " />
                        </button>
                    </div>
                    <AlertDialogDescription>
                        Are you sure you want to delete this carrier?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
                    {carrier && (
                        <p>
                            You are about to delete <b>{carrierName}</b>. Please enter the name of the
                            carrier in the field below to confirm deletion.
                        </p>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="confirmation">Name of Carrier</Label>
                        <Input
                            id="confirmation"
                            placeholder="Enter Name To Confirm Deletion"
                            {...register("confirmation", {
                                validate: (value) =>
                                    value === carrierName || "Name does not match the carrier to be deleted.",
                            })}
                            className="input-focus input-hover"
                        />
                        {errors.confirmation && (
                            <p className="text-sm text-red-500">{errors.confirmation.message}</p>
                        )}
                    </div>
                    <div className="hidden">
                        <Input type="hidden" {...register("id")} />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction disabled={loading || !isValid} type="submit" className="bg-destructive">
                            {loading ? "Deleting..." : "Confirm Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}