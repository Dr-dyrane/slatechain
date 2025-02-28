"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileFields } from "./ProfileFields";
import type { UserRole } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
    Form, FormControl, FormField, FormItem,
    FormLabel, FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { FormData } from "@/lib/types/onboarding";

// ✅ Define schema for profile data
const profileSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phoneNumber: z.string().min(10, "Please enter a valid phone number"),
    companyName: z.string().optional(),
    businessType: z.string().optional(),
    employeeCount: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileSetupProps {
    role: UserRole;
    onComplete: (data: FormData) => Promise<void>;
    data?: Record<string, any>;
    onSubmit: (data: ProfileFormValues) => void;
}

// ✅ In the ProfileSetup component
export function ProfileSetup({ role, onComplete, onSubmit, data }: ProfileSetupProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    console.log("ProfileSetup", { role, data });

    // ✅ Initialize form with default values
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: data?.firstName || "",
            lastName: data?.lastName || "",
            email: data?.email || "",
            phoneNumber: data?.phoneNumber || "",
            companyName: data?.companyName || "",
            businessType: data?.businessType || "",
            employeeCount: data?.employeeCount || "",
        },
    });

    // ✅ Trigger onComplete when a field loses focus (onBlur)
    const handleFieldBlur = useCallback(() => {
        onComplete(form.getValues());
    }, [form, onComplete]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Setup</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John" {...field} onBlur={handleFieldBlur} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Doe" {...field} onBlur={handleFieldBlur} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="john.doe@example.com" type="email" {...field} onBlur={handleFieldBlur} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1 (555) 123-4567" {...field} onBlur={handleFieldBlur} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* ✅ Company information fields */}
                        <div className="pt-4 border-t">
                            <h3 className="text-sm font-medium mb-3">Company Information</h3>
                            <div className="space-y-4">
                                <ProfileFields />
                            </div>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
