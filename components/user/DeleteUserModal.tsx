"use client"

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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { AppDispatch } from "@/lib/store"
import { useDispatch } from "react-redux"
import { removeUser } from "@/lib/slices/user/user"
import { useState } from "react"
import type { User } from "@/lib/types"
import { toast } from "sonner"
import { X } from "lucide-react"

const deleteSchema = z.object({
    confirmation: z.string().min(1, "Confirmation is required"),
})

type DeleteFormValues = z.infer<typeof deleteSchema>

interface DeleteUserModalProps {
    open: boolean
    onClose: () => void
    user: User | null
    setRefetchUsers: (value: boolean) => void
}

export const DeleteUserModal = ({ open, onClose, user, setRefetchUsers }: DeleteUserModalProps) => {
    const dispatch = useDispatch<AppDispatch>()
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<DeleteFormValues>({
        resolver: zodResolver(deleteSchema),
    })

    const onSubmit = async (data: DeleteFormValues) => {
        if (!user) return

        setLoading(true)
        try {
            if (data.confirmation !== `${user.firstName} ${user.lastName}`) {
                toast.error("Name entered does not match the user to be deleted")
                return
            }

            await dispatch(removeUser(user.id)).unwrap()
            toast.success(`User ${user.firstName} ${user.lastName} has been deleted.`)
            onClose()
        } catch (error: any) {
            toast.error("There was an issue deleting the user. Please try again later.")
        } finally {
            setLoading(false)
            setRefetchUsers(true)
        }
    }

    if (!user) return null

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
                <AlertDialogHeader>
                    <div className="flex justify-center items-center relative">
                        <AlertDialogTitle>Confirm Delete User</AlertDialogTitle>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 absolute -top-4 -right-4 p-2 bg-muted rounded-full">
                            <X className="w-5 h-5 " />
                        </button>
                    </div>
                    <AlertDialogDescription>
                        Are you sure you want to delete the user{" "}
                        <b>
                            {user.firstName} {user.lastName}
                        </b>
                        ? This action cannot be undone. Please enter the full name of the user to confirm.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
                    <div className="space-y-2">
                        <Label htmlFor="confirmation">Full Name</Label>
                        <Input
                            id="confirmation"
                            placeholder="Enter Full Name To Confirm Deletion"
                            {...register("confirmation")}
                            className="input-focus input-hover"
                        />
                        {errors.confirmation && <p className="text-sm text-red-500">{errors.confirmation.message}</p>}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button type="submit" disabled={loading || !isValid} variant="destructive">
                            {loading ? "Deleting..." : "Confirm Delete"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}

