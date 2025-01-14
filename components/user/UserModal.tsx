// src/components/user/UserModal.tsx
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {  addUser } from "@/lib/slices/user/user";
import { AppDispatch, RootState } from "@/lib/store";
import { useDispatch, useSelector } from "react-redux";
import { UserRole, User } from "@/lib/types";
import { useState } from "react";
import { toast } from "sonner";

const addUserSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(7, "Phone number is invalid"),
    role: z.enum([UserRole.ADMIN, UserRole.SUPPLIER, UserRole.MANAGER, UserRole.CUSTOMER])
})


type AddUserFormValues = z.infer<typeof addUserSchema>;


interface UserModalProps {
    open: boolean;
    onClose: () => void;
}
export const UserModal = ({ open, onClose }: UserModalProps) => {
      const dispatch = useDispatch<AppDispatch>();
    const { loading} = useSelector((state: RootState) => state.user);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm<AddUserFormValues>({
        resolver: zodResolver(addUserSchema),
    });

    const onSubmit = async (data: AddUserFormValues) => {
        try {
           await dispatch(addUser({ ...data } as Omit<User, 'id'>)).unwrap();
             toast.success("User has been successfully created");
              onClose()
               reset();
        } catch (error: any) {
            toast.error('There was an error creating the user');
        }
    };


    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Add New User</AlertDialogTitle>
                   <AlertDialogDescription>Please provide the following information to create a user.</AlertDialogDescription>
               </AlertDialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                   <div className="space-y-2">
                         <Label htmlFor="firstName">First Name</Label>
                        <Input
                           id="firstName"
                           placeholder="First Name"
                           {...register("firstName")}
                           className="input-focus input-hover"
                         />
                             {errors.firstName && (
                                <p className="text-sm text-red-500">{errors.firstName.message}</p>
                           )}
                       </div>
                        <div className="space-y-2">
                         <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                 id="lastName"
                                placeholder="Last Name"
                                 {...register("lastName")}
                                className="input-focus input-hover"
                              />
                            {errors.lastName && (
                              <p className="text-sm text-red-500">{errors.lastName.message}</p>
                            )}
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
                         {errors.email && (
                            <p className="text-sm text-red-500">{errors.email.message}</p>
                          )}
                       </div>
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                                id="phoneNumber"
                               placeholder="Phone Number"
                                type='tel'
                                 {...register("phoneNumber")}
                              className="input-focus input-hover"
                           />
                           {errors.phoneNumber && (
                              <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
                            )}
                        </div>
                         <div className="space-y-2">
                             <Label htmlFor="role">User Role</Label>
                             <select
                                   id="role"
                                   className="input-focus input-hover"
                                {...register("role")}
                             >
                               <option value="admin">Admin</option>
                              <option value="supplier">Supplier</option>
                               <option value="manager">Manager</option>
                                <option value="customer">Customer</option>
                            </select>

                        </div>
                      <AlertDialogFooter>
                         <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button type="submit" disabled={loading || !isValid}>
                             {loading ? 'Adding User...' : 'Add User'}
                       </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
};