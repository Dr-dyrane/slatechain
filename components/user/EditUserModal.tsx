// src/components/user/EditUserModal.tsx
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
import {   updateUser } from "@/lib/slices/user/user";
import { AppDispatch, RootState } from "@/lib/store";
import { useDispatch, useSelector } from "react-redux";
import { User, UserRole, OnboardingStatus, KYCStatus } from "@/lib/types";
import { useEffect } from 'react'
import { toast } from "sonner";

const editUserSchema = z.object({
    id: z.string().min(1, "ID is required"),
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(7, "Phone number is required"),
    role: z.enum([UserRole.ADMIN, UserRole.SUPPLIER, UserRole.MANAGER, UserRole.CUSTOMER]),
    isEmailVerified: z.boolean(),
    isPhoneVerified: z.boolean(),
    kycStatus: z.enum([KYCStatus.NOT_STARTED, KYCStatus.IN_PROGRESS, KYCStatus.PENDING_REVIEW, KYCStatus.APPROVED, KYCStatus.REJECTED]),
    onboardingStatus: z.enum([OnboardingStatus.PENDING, OnboardingStatus.NOT_STARTED, OnboardingStatus.IN_PROGRESS, OnboardingStatus.COMPLETED])
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserModalProps {
    open: boolean;
    onClose: () => void;
    data: User | null;
}

export const EditUserModal = ({ open, onClose, data }: EditUserModalProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading} = useSelector((state: RootState) => state.user);
    const {
        register,
        handleSubmit,
       reset,
        formState: { errors, isValid },
    } = useForm<EditUserFormValues>({
         resolver: zodResolver(editUserSchema),
         defaultValues: {
            id: data?.id || "",
            firstName: data?.firstName || "",
            lastName: data?.lastName || "",
            email: data?.email || "",
             phoneNumber: data?.phoneNumber || "",
            role: data?.role || UserRole.CUSTOMER,
            isEmailVerified: data?.isEmailVerified || false,
             isPhoneVerified: data?.isPhoneVerified || false,
             kycStatus: data?.kycStatus || KYCStatus.NOT_STARTED,
            onboardingStatus: data?.onboardingStatus || OnboardingStatus.NOT_STARTED,
         }
    });
    useEffect(() => {
        if (data) {
            reset({
                id: data?.id || "",
                firstName: data?.firstName || "",
                lastName: data?.lastName || "",
                email: data?.email || "",
                phoneNumber: data?.phoneNumber || "",
                role: data?.role || UserRole.CUSTOMER,
                isEmailVerified: data?.isEmailVerified || false,
                isPhoneVerified: data?.isPhoneVerified || false,
                kycStatus: data?.kycStatus || KYCStatus.NOT_STARTED,
                onboardingStatus: data?.onboardingStatus || OnboardingStatus.NOT_STARTED,
            });
        }
    }, [data, reset]);
   const onSubmit = async (data: EditUserFormValues) => {
        try {
          await dispatch(updateUser(data as User)).unwrap()
             toast.success('User updated successfully')
           onClose()
           reset();
      } catch (error: any) {
          toast.error("There was an issue updating item")
      }
  }
  return (
      <AlertDialog open={open} onOpenChange={onClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update User</AlertDialogTitle>
              <AlertDialogDescription>Please update your User information here.</AlertDialogDescription>
         </AlertDialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
             <div className="space-y-2">
                <Label htmlFor="id">User Id</Label>
                  <Input
                    id="id"
                      placeholder="Id"
                    {...register("id")}
                    className="input-focus input-hover"
                    readOnly
                    />
                      {errors.id && (
                        <p className="text-sm text-red-500">{errors.id.message}</p>
                     )}
                </div>
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
                         placeholder='Last Name'
                       {...register("lastName")}
                         className="input-focus input-hover"
                     />
                       {errors.lastName && (
                         <p className="text-sm text-red-500">{errors.lastName.message}</p>
                         )}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="email">email</Label>
                     <Input
                       id="email"
                         placeholder='Email'
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
                        {...register("phoneNumber")}
                        className="input-focus input-hover"
                        />
                          {errors.phoneNumber && (
                             <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
                          )}
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                       <Input
                          id="role"
                            placeholder='Role'
                            {...register("role")}
                             className="input-focus input-hover"
                         />
                          {errors.role && (
                            <p className="text-sm text-red-500">{errors.role.message}</p>
                           )}
                    </div>
                   <AlertDialogFooter>
                         <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction disabled={loading || !isValid} type="submit">
                             {loading ? "Updating.." : "Update Item"}
                           </AlertDialogAction>
                   </AlertDialogFooter>
               </form>
          </AlertDialogContent>
       </AlertDialog>
   );
}