// src/components/transport/freight/EditFreightModal.tsx
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
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, Control, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppDispatch, RootState } from "@/lib/store";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Freight } from "@/lib/types";
import { useEffect } from "react";
import { updateFreight } from "@/lib/slices/shipmentSlice";
import { X } from "lucide-react";
import { CheckedState } from "@radix-ui/react-checkbox";

const freightSchema = z.object({
    id: z.string().min(1, { message: "Id is required" }),
    name: z.string().min(1, { message: "Freight name is required" }),
    type: z.string().min(1, { message: "Freight type is required" }),
    weight: z.number({ invalid_type_error: "Weight must be a number" }).min(0, { message: "Weight must be positive" }),
    volume: z.number({ invalid_type_error: "Volume must be a number" }).min(0, { message: "Volume must be positive" }),
    hazardous: z.boolean().default(false),
    specialInstructions: z.string().optional(),
});

type FreightFormValues = z.infer<typeof freightSchema>;

interface EditFreightModalProps {
    open: boolean;
    onClose: () => void;
    freight: Freight | null;
}

export function EditFreightModal({ open, onClose, freight }: EditFreightModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((state: RootState) => state.shipment);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        reset,
        control
    } = useForm<FreightFormValues>({
        resolver: zodResolver(freightSchema),
        defaultValues: {
            id: freight?._id || "",
            name: freight?.name || "",
            type: freight?.type || "",
            weight: freight?.weight || 0,
            volume: freight?.volume || 0,
            hazardous: freight?.hazardous || false,
            specialInstructions: freight?.specialInstructions || "",
        },
    });

    useEffect(() => {
        if (freight) {
            reset({
                id: freight?._id || "",
                name: freight?.name || "",
                type: freight?.type || "",
                weight: freight?.weight || 0,
                volume: freight?.volume || 0,
                hazardous: freight?.hazardous || false,
                specialInstructions: freight?.specialInstructions || "",
            });
        }
    }, [freight, reset]);

    const onSubmit = async (data: FreightFormValues) => {
        try {
            await dispatch(updateFreight(data as Freight)).unwrap();
            toast.success("Freight updated successfully!");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to update freight. Please try again.");
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
                <AlertDialogHeader>
                    <div className="flex justify-center items-center relative">
                        <AlertDialogTitle>Edit Freight</AlertDialogTitle>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full">
                            <X className="w-5 h-5 " />
                        </button>
                    </div>
                    <AlertDialogDescription>Update freight details.</AlertDialogDescription>
                </AlertDialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="id">ID</Label>
                        <Input id="id" placeholder="ID" {...register("id")} readOnly />
                    </div>
                    <div>
                        <Label htmlFor="name">Freight Name</Label>
                        <Input id="name" placeholder="Freight Name" {...register("name")} />
                    </div>
                    <div>
                        <Label htmlFor="type">Freight Type</Label>
                        <Input id="type" placeholder="Freight Type" {...register("type")} />
                    </div>
                    <div>
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input id="weight" type="number" placeholder="Weight (kg)" {...register("weight", { valueAsNumber: true })} />
                    </div>
                    <div>
                        <Label htmlFor="volume">Volume (m³)</Label>
                        <Input id="volume" type="number" placeholder="Volume (m³)" {...register("volume", { valueAsNumber: true })} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Controller
                            name="hazardous"
                            control={control}
                            render={({ field }) => <Checkbox id="hazardous" checked={field.value} onCheckedChange={field.onChange} />}
                        />
                        <Label htmlFor="hazardous">Hazardous</Label>
                    </div>
                    <div>
                        <Label htmlFor="specialInstructions">Special Instructions</Label>
                        <Input id="specialInstructions" placeholder="Special Instructions" {...register("specialInstructions")} />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button type="submit" disabled={loading || !isValid}>
                            {loading ? "Updating..." : "Update Freight"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}