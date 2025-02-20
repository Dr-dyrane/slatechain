// src/components/transport/carrier/EditCarrierModal.tsx
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
import { Carrier } from "@/lib/types";
import { useEffect } from "react";
import { updateCarrier } from "@/lib/slices/shipmentSlice";
import { X } from "lucide-react";

const carrierSchema = z.object({
    id: z.string().min(1, { message: "Id is required" }),
    name: z.string().min(1, { message: "Carrier name is required" }),
    contactPerson: z.string().min(1, { message: "Contact person is required" }),
    email: z.string().email({ message: "Invalid email format" }),
    phone: z.string().min(1, { message: "Phone number is required" }),
    rating: z.number().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"] as const).optional(),
});

type CarrierFormValues = z.infer<typeof carrierSchema>;

interface EditCarrierModalProps {
    open: boolean;
    onClose: () => void;
    carrier: Carrier | null;
}

export function EditCarrierModal({ open, onClose, carrier }: EditCarrierModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((state: RootState) => state.shipment);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm<CarrierFormValues>({
        resolver: zodResolver(carrierSchema),
        defaultValues: {
            id: carrier?.id || "",
            name: carrier?.name || "",
            contactPerson: carrier?.contactPerson || "",
            email: carrier?.email || "",
            phone: carrier?.phone || "",
            rating: carrier?.rating || 0,
            status: carrier?.status || "ACTIVE",
        },
    });

    useEffect(() => {
        if (carrier) {
            reset({
                id: carrier?.id || "",
                name: carrier?.name || "",
                contactPerson: carrier?.contactPerson || "",
                email: carrier?.email || "",
                phone: carrier?.phone || "",
                rating: carrier?.rating || 0,
                status: carrier?.status || "ACTIVE",
            });
        }
    }, [carrier, reset]);

    const onSubmit = async (data: CarrierFormValues) => {
        try {
            await dispatch(updateCarrier(data as Carrier)).unwrap();
            toast.success("Carrier updated successfully!");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to update carrier. Please try again.");
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
                <AlertDialogHeader>
                    <div className="flex justify-center items-center relative">
                        <AlertDialogTitle>Edit Carrier</AlertDialogTitle>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full">
                            <X className="w-5 h-5 " />
                        </button>
                    </div>
                    <AlertDialogDescription>Update carrier details.</AlertDialogDescription>
                </AlertDialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="id">ID</Label>
                        <Input id="id" placeholder="ID" {...register("id")} readOnly />
                    </div>
                    <div>
                        <Label htmlFor="name">Carrier Name</Label>
                        <Input id="name" placeholder="Carrier Name" {...register("name")} />
                    </div>
                    <div>
                        <Label htmlFor="contactPerson">Contact Person</Label>
                        <Input id="contactPerson" placeholder="Contact Person" {...register("contactPerson")} />
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="Email" {...register("email")} />
                    </div>
                    <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" placeholder="Phone Number" {...register("phone")} />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Update Carrier"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
