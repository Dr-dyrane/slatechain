// src/components/inventory/manufacturing/DeleteManufacturingOrderModal.tsx
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
import { deleteManufacturingOrder } from "@/lib/slices/inventorySlice";
import { AppDispatch, RootState } from "@/lib/store";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { ManufacturingOrder } from "@/lib/types";

const deleteSchema = z.object({
    id: z.string().min(1, "Id is required"),
    confirmation: z.string().min(1, "Name is required"),
});

type DeleteFormValues = z.infer<typeof deleteSchema>;

interface DeleteManufacturingOrderModalProps {
    open: boolean;
    onClose: () => void;
    manufacturingOrder: ManufacturingOrder | null;
    deleteModalTitle?: string;
}

export function DeleteManufacturingOrderModal({
    open,
    onClose,
    manufacturingOrder,
    deleteModalTitle,
}: DeleteManufacturingOrderModalProps) {
    const [orderName, setOrderName] = useState<string>('');
    const { loading } = useSelector((state: RootState) => state.inventory);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (manufacturingOrder) {
            setOrderName(manufacturingOrder.orderNumber);
        }
    }, [manufacturingOrder]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm<DeleteFormValues>({
        resolver: zodResolver(deleteSchema),
        defaultValues: {
            id: manufacturingOrder?.id ?? "",
        },
        mode: "onChange", // Enables dynamic validation
    });

    const onSubmit = async (formData: DeleteFormValues) => {
        try {
            if (formData.id) {
                await dispatch(deleteManufacturingOrder(formData.id)).unwrap();
                toast.success("Manufacturing order deleted successfully.");
                reset();
                onClose();
            }
        } catch (error) {
            toast.error("Failed to delete the manufacturing order. Please try again later.");
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
                <AlertDialogHeader>
                    <div className="flex justify-center items-center relative">
                        <AlertDialogTitle>{deleteModalTitle || "Confirm Delete Manufacturing Order"}</AlertDialogTitle>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 absolute -top-4 -right-4 p-2 bg-muted rounded-full">
                            <X className="w-5 h-5 " />
                        </button>
                    </div>
                    <AlertDialogDescription>
                        Are you sure you want to delete this manufacturing order?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
                    {manufacturingOrder && (
                        <p>
                            You are about to delete <b>{orderName}</b>. Please enter the order number to confirm deletion.
                        </p>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="confirmation">Order Number</Label>
                        <Input
                            id="confirmation"
                            placeholder="Enter Order Number To Confirm Deletion"
                            {...register("confirmation", {
                                validate: (value) =>
                                    value === orderName || "Order number does not match the order to be deleted.",
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
                        <button
                            type="submit"
                            disabled={loading || !isValid}
                            className="bg-destructive text-white px-4 py-2 rounded-md"
                        >
                            {loading ? "Deleting..." : "Confirm Delete"}
                        </button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}