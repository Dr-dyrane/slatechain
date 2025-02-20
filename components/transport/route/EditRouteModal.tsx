// src/components/transport/route/EditRouteModal.tsx
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
import { Route } from "@/lib/types";
import { useEffect } from "react";
import { updateRoute } from "@/lib/slices/shipmentSlice";
import { X } from "lucide-react";

const routeSchema = z.object({
    id: z.string().min(1, { message: "Id is required" }),
    name: z.string().min(1, { message: "Route name is required" }),
    startLocation: z.string().min(1, { message: "Start location is required" }),
    endLocation: z.string().min(1, { message: "End location is required" }),
    distance: z.number({ invalid_type_error: "Distance must be a number" }).min(0, { message: "Distance must be positive" }),
    estimatedDuration: z.number({ invalid_type_error: "Duration must be a number" }).min(0, { message: "Duration must be positive" }),
});

type RouteFormValues = z.infer<typeof routeSchema>;

interface EditRouteModalProps {
    open: boolean;
    onClose: () => void;
    route: Route | null;
}

export function EditRouteModal({ open, onClose, route }: EditRouteModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((state: RootState) => state.shipment);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm<RouteFormValues>({
        resolver: zodResolver(routeSchema),
        defaultValues: {
            id: route?.id || "",
            name: route?.name || "",
            startLocation: route?.startLocation || "",
            endLocation: route?.endLocation || "",
            distance: route?.distance || 0,
            estimatedDuration: route?.estimatedDuration || 0,
        },
    });

    useEffect(() => {
        if (route) {
            reset({
                id: route?.id || "",
                name: route?.name || "",
                startLocation: route?.startLocation || "",
                endLocation: route?.endLocation || "",
                distance: route?.distance || 0,
                estimatedDuration: route?.estimatedDuration || 0,
            });
        }
    }, [route, reset]);

    const onSubmit = async (data: RouteFormValues) => {
        try {
            await dispatch(updateRoute(data as Route)).unwrap();
            toast.success("Route updated successfully!");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to update route. Please try again.");
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
                <AlertDialogHeader>
                    <div className="flex justify-center items-center relative">
                        <AlertDialogTitle>Edit Route</AlertDialogTitle>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full">
                            <X className="w-5 h-5 " />
                        </button>
                    </div>
                    <AlertDialogDescription>Update route details.</AlertDialogDescription>
                </AlertDialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="id">ID</Label>
                        <Input id="id" placeholder="ID" {...register("id")} readOnly />
                    </div>
                    <div>
                        <Label htmlFor="name">Route Name</Label>
                        <Input id="name" placeholder="Route Name" {...register("name")} />
                    </div>
                    <div>
                        <Label htmlFor="startLocation">Start Location</Label>
                        <Input id="startLocation" placeholder="Start Location" {...register("startLocation")} />
                    </div>
                    <div>
                        <Label htmlFor="endLocation">End Location</Label>
                        <Input id="endLocation" placeholder="End Location" {...register("endLocation")} />
                    </div>
                    <div>
                        <Label htmlFor="distance">Distance (km)</Label>
                        <Input id="distance" type="number" placeholder="Distance (km)" {...register("distance", { valueAsNumber: true })} />
                    </div>
                    <div>
                        <Label htmlFor="estimatedDuration">Estimated Duration (hours)</Label>
                        <Input id="estimatedDuration" type="number" placeholder="Estimated Duration (hours)" {...register("estimatedDuration", { valueAsNumber: true })} />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Update Route"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}