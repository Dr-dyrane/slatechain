// src/components/user/DeleteUserModal.tsx
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
import {  removeUser } from "@/lib/slices/user/user";
import { useEffect, useState } from "react";
import { User } from "@/lib/types";
import { toast } from "sonner";

const deleteSchema = z.object({
    id: z.string().min(1, "Id is required"),
    confirmation: z.string().min(1, "Confirmation is required"),
});

type DeleteFormValues = z.infer<typeof deleteSchema>;

interface DeleteUserModalProps {
    open: boolean;
    onClose: () => void;
     user: User | null
}

export const DeleteUserModal = ({ open, onClose, user }: DeleteUserModalProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((state: RootState) => state.user);
    const [dataName, setDataName] = useState<string>('')

      useEffect(() => {
        if (user && typeof user === 'object' && 'name' in user) {
              setDataName(user.name as string);
        }
    }, [user]);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<DeleteFormValues>({
         resolver: zodResolver(deleteSchema),
            defaultValues: {
                id: user?.id || "",
            }
    });

    const onSubmit = async (data: DeleteFormValues) => {
        try {
            if (data.confirmation !== dataName) {
                 toast.error("Name entered does not match record to be deleted");
            } else if (isValid && dataName) {
                 await dispatch(removeUser(user?.id!) as any).unwrap();
                 toast.success(`User has been deleted.`);
                onClose()
            }
        } catch (error: any) {
             toast.error("There was an issue deleting user. Please try again later.");
       }
  };

   return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Delete User</AlertDialogTitle>
                    <AlertDialogDescription>
                       Are you sure you want to delete the user <b>{user?.firstName} {user?.lastName}</b> with the id of <b>{user?.id}</b>?
                      Please enter the full name of the user to confirm.
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
                        {errors.confirmation && (
                            <p className="text-sm text-red-500">{errors.confirmation.message}</p>
                         )}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                           <Button  disabled={loading || !isValid} type="submit">
                               Confirm Delete
                          </Button>
                   </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}