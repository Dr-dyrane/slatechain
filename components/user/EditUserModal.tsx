"use client"

import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { updateUser } from "@/lib/slices/user/user"
import { type User, UserRole, KYCStatus, OnboardingStatus } from "@/lib/types"
import type { AppDispatch } from "@/lib/store"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const editUserSchema = z.object({
    id: z.string().min(1, "ID is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(7, "Phone number is invalid"),
    role: z.nativeEnum(UserRole),
    kycStatus: z.nativeEnum(KYCStatus),
    onboardingStatus: z.nativeEnum(OnboardingStatus),
})

type EditUserFormValues = z.infer<typeof editUserSchema>

interface EditUserModalProps {
    open: boolean
    onClose: () => void
    user: User | null
}

export const EditUserModal = ({ open, onClose, user }: EditUserModalProps) => {
    const dispatch = useDispatch<AppDispatch>()
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<EditUserFormValues>({
        resolver: zodResolver(editUserSchema),
    })

    useEffect(() => {
        if (user) {
            reset(user)
        }
    }, [user, reset])

    const onSubmit = async (data: EditUserFormValues) => {
        setLoading(true)
        try {
            await dispatch(updateUser(data as User)).unwrap()
            toast.success("User updated successfully")
            onClose()
        } catch (error: any) {
            toast.error("There was an issue updating the user")
        } finally {
            setLoading(false)
        }
    }

    if (!user) return null

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit User</AlertDialogTitle>
                    <AlertDialogDescription>Update the user's information below.</AlertDialogDescription>
                </AlertDialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <input type="hidden" {...register("id")} />
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                            id="firstName"
                            placeholder="First Name"
                            {...register("firstName")}
                            className="input-focus input-hover"
                        />
                        {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                            id="lastName"
                            placeholder="Last Name"
                            {...register("lastName")}
                            className="input-focus input-hover"
                        />
                        {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Email"
                            {...register("email")}
                            className="input-focus input-hover"
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                            id="phoneNumber"
                            placeholder="Phone Number"
                            type="tel"
                            {...register("phoneNumber")}
                            className="input-focus input-hover"
                        />
                        {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">User Role</Label>
                        <Controller
                            name="role"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="input-focus input-hover">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(UserRole).map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="kycStatus">KYC Status</Label>
                        <Controller
                            name="kycStatus"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="input-focus input-hover">
                                        <SelectValue placeholder="Select KYC status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(KYCStatus).map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.kycStatus && <p className="text-sm text-red-500">{errors.kycStatus.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="onboardingStatus">Onboarding Status</Label>
                        <Controller
                            name="onboardingStatus"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="input-focus input-hover">
                                        <SelectValue placeholder="Select onboarding status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(OnboardingStatus).map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.onboardingStatus && <p className="text-sm text-red-500">{errors.onboardingStatus.message}</p>}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Updating User..." : "Update User"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}

