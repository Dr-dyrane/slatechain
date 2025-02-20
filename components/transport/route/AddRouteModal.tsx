// src/components/transport/route/AddRouteModal.tsx
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
import { addRoute } from "@/lib/slices/shipmentSlice";
import { Route } from "@/lib/types";
import { X } from "lucide-react";

const routeSchema = z.object({
    name: z.string().min(1, { message: "Route name is required" }),
    startLocation: z.string().min(1, { message: "Start location is required" }),
    endLocation: z.string().min(1, { message: "End location is required" }),
    distance: z.number({ invalid_type_error: "Distance must be a number" }).min(0, { message: "Distance must be positive" }),
    estimatedDuration: z.number({ invalid_type_error: "Duration must be a number" }).min(0, { message: "Duration must be positive" }),
});

type RouteFormValues = z.infer<typeof routeSchema>;

interface AddRouteModalProps {
    open: boolean;
    onClose: () => void;
}

export function AddRouteModal({ open, onClose }: AddRouteModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((state: RootState) => state.shipment);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<RouteFormValues>({
        resolver: zodResolver(routeSchema),
    });

    const onSubmit = async (data: RouteFormValues) => {
        try {
            await dispatch(addRoute(data as Omit<Route, "id">)).unwrap();
            toast.success("Route added successfully!");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to add route. Please try again.");
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
                <AlertDialogHeader>
                    <div className="flex justify-center items-center relative">
                        <AlertDialogTitle>Add New Route</AlertDialogTitle>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full">
                            <X className="w-5 h-5 " />
                        </button>
                    </div>
                    <AlertDialogDescription>Fill in the details for the new route.</AlertDialogDescription>
                </AlertDialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Route Name</Label>
                        <Input id="name" placeholder="Route Name" {...register("name")} />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="startLocation">Start Location</Label>
                        <Input id="startLocation" placeholder="Start Location" {...register("startLocation")} />
                        {errors.startLocation && (
                            <p className="text-sm text-red-500">{errors.startLocation.message}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="endLocation">End Location</Label>
                        <Input id="endLocation" placeholder="End Location" {...register("endLocation")} />
                        {errors.endLocation && (
                            <p className="text-sm text-red-500">{errors.endLocation.message}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="distance">Distance (km)</Label>
                        <Input id="distance" type="number" placeholder="Distance (km)" {...register("distance", { valueAsNumber: true })} />
                        {errors.distance && (
                            <p className="text-sm text-red-500">{errors.distance.message}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="estimatedDuration">Estimated Duration (hours)</Label>
                        <Input id="estimatedDuration" type="number" placeholder="Estimated Duration (hours)" {...register("estimatedDuration", { valueAsNumber: true })} />
                        {errors.estimatedDuration && (
                            <p className="text-sm text-red-500">{errors.estimatedDuration.message}</p>
                        )}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Adding..." : "Add Route"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}