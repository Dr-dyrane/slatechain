// src/components/transport/carrier/AddCarrierModal.tsx
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
import { addCarrier } from "@/lib/slices/shipmentSlice";
import { Carrier } from "@/lib/types";
import { X } from "lucide-react";

// Define a Zod schema for carrier validation
const carrierSchema = z.object({
    name: z.string().min(1, { message: "Carrier name is required" }),
    contactPerson: z.string().min(1, { message: "Contact person is required" }),
    email: z.string().email({ message: "Invalid email format" }),
    phone: z.string().min(1, { message: "Phone number is required" }),
    rating: z.number().optional(), // Optional as ratings might not always be provided
    status: z.enum(["ACTIVE", "INACTIVE"] as const).optional(), // Optional, can have default
});

type CarrierFormValues = z.infer<typeof carrierSchema>;

interface AddCarrierModalProps {
    open: boolean;
    onClose: () => void;
}

export function AddCarrierModal({ open, onClose }: AddCarrierModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((state: RootState) => state.shipment);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<CarrierFormValues>({
        resolver: zodResolver(carrierSchema),
    });

    const onSubmit = async (data: CarrierFormValues) => {
        try {
            await dispatch(addCarrier(data as Carrier)).unwrap();
            toast.success("Carrier added successfully!");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to add carrier. Please try again.");
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
                <AlertDialogHeader>
                    <div className="flex justify-center items-center relative">
                        <AlertDialogTitle>Add New Carrier</AlertDialogTitle>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full">
                            <X className="w-5 h-5 " />
                        </button>
                    </div>
                    <AlertDialogDescription>Fill in the details for the new carrier.</AlertDialogDescription>
                </AlertDialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Carrier Name</Label>
                        <Input id="name" placeholder="Carrier Name" {...register("name")} />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="contactPerson">Contact Person</Label>
                        <Input id="contactPerson" placeholder="Contact Person" {...register("contactPerson")} />
                        {errors.contactPerson && (
                            <p className="text-sm text-red-500">{errors.contactPerson.message}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="Email" {...register("email")} />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" placeholder="Phone Number" {...register("phone")} />
                        {errors.phone && (
                            <p className="text-sm text-red-500">{errors.phone.message}</p>
                        )}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Adding..." : "Add Carrier"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}