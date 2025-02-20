// src/components/inventory/manufacturing/EditManufacturingOrderModal.tsx
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppDispatch, RootState } from "@/lib/store";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { ManufacturingOrder } from "@/lib/types";
import { useEffect } from "react";
import { updateManufacturingOrder } from "@/lib/slices/inventorySlice";
import { X } from "lucide-react";

const editManufacturingOrderSchema = z.object({
    id: z.string().min(1, { message: "Id is required" }),
    name: z.string().min(1, { message: "Order name is required" }),
    orderNumber: z.string().min(1, { message: "Order number is required" }),
    inventoryItemId: z.string().min(1, { message: "Product ID is required" }),
    quantity: z.number({ invalid_type_error: "Quantity must be a number" }).min(1, { message: "Quantity must be positive" }),
    status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"], { required_error: "Status is required" }),
    startDate: z.string().min(1, { message: "Start date is required" }),
    endDate: z.string().min(1, { message: "End date is required" }),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"], { required_error: "Priority is required" }),
});

type EditManufacturingOrderFormValues = z.infer<typeof editManufacturingOrderSchema>;

interface EditManufacturingOrderModalProps {
    open: boolean;
    onClose: () => void;
    manufacturingOrder: ManufacturingOrder | null;
}

export function EditManufacturingOrderModal({ open, onClose, manufacturingOrder }: EditManufacturingOrderModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((state: RootState) => state.inventory);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm<EditManufacturingOrderFormValues>({
        resolver: zodResolver(editManufacturingOrderSchema),
        defaultValues: {
            id: manufacturingOrder?.id || "",
            name: manufacturingOrder?.name || "",
            orderNumber: manufacturingOrder?.orderNumber || "",
            inventoryItemId: manufacturingOrder?.inventoryItemId || "",
            quantity: manufacturingOrder?.quantity || 0,
            status: manufacturingOrder?.status || "PLANNED",
            startDate: manufacturingOrder?.startDate || "",
            endDate: manufacturingOrder?.endDate || "",
            priority: manufacturingOrder?.priority || "LOW",
        },
    });

    useEffect(() => {
        if (manufacturingOrder) {
            reset({
                id: manufacturingOrder?.id || "",
                name: manufacturingOrder?.name || "",
                orderNumber: manufacturingOrder?.orderNumber || "",
                inventoryItemId: manufacturingOrder?.inventoryItemId || "",
                quantity: manufacturingOrder?.quantity || 0,
                status: manufacturingOrder?.status || "PLANNED",
                startDate: manufacturingOrder?.startDate || "",
                endDate: manufacturingOrder?.endDate || "",
                priority: manufacturingOrder?.priority || "LOW",
            });
        }
    }, [manufacturingOrder, reset]);

    const onSubmit = async (data: EditManufacturingOrderFormValues) => {
        try {
            await dispatch(updateManufacturingOrder(data as ManufacturingOrder)).unwrap();
            toast.success("Manufacturing order updated successfully!");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to update manufacturing order. Please try again.");
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
                <AlertDialogHeader>
                    <div className="flex justify-center items-center relative">
                        <AlertDialogTitle>Edit Manufacturing Order</AlertDialogTitle>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full">
                            <X className="w-5 h-5 " />
                        </button>
                    </div>
                    <AlertDialogDescription>Update manufacturing order details.</AlertDialogDescription>
                </AlertDialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="id">ID</Label>
                        <Input id="id" placeholder="ID" {...register("id")} readOnly />
                    </div>
                     <div>
                        <Label htmlFor="name">Order Name</Label>
                        <Input id="name" placeholder="Order Name" {...register("name")} />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="orderNumber">Order Number</Label>
                        <Input id="orderNumber" placeholder="Order Number" {...register("orderNumber")} />
                        {errors.orderNumber && (
                            <p className="text-sm text-red-500">{errors.orderNumber.message}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="inventoryItemId">Product ID</Label>
                        <Input id="inventoryItemId" placeholder="Product ID" {...register("inventoryItemId")} />
                        {errors.inventoryItemId && (
                            <p className="text-sm text-red-500">{errors.inventoryItemId.message}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" type="number" placeholder="Quantity" {...register("quantity", { valueAsNumber: true })} />
                        {errors.quantity && (
                            <p className="text-sm text-red-500">{errors.quantity.message}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <select id="status" {...register("status")} className="w-full p-2 border rounded">
                            <option value="PLANNED">Planned</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                        {errors.status && (
                            <p className="text-sm text-red-500">{errors.status.message}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input id="startDate" type="datetime-local" {...register("startDate")} />
                        {errors.startDate && (
                            <p className="text-sm text-red-500">{errors.startDate.message}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input id="endDate" type="datetime-local" {...register("endDate")} />
                        {errors.endDate && (
                            <p className="text-sm text-red-500">{errors.endDate.message}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="priority">Priority</Label>
                        <select id="priority" {...register("priority")} className="w-full p-2 border rounded">
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                        {errors.priority && (
                            <p className="text-sm text-red-500">{errors.priority.message}</p>
                        )}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button type="submit" disabled={loading || !isValid}>
                            {loading ? "Updating..." : "Update Order"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}