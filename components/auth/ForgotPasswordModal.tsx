// src/components/auth/ForgotPasswordModal.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
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
import { sendResetEmail, resetLoading } from "@/lib/slices/authSlice";
import { AppDispatch, RootState } from "@/lib/store";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const resetPasswordSchema = z.object({
   email: z.string().email("Invalid email address"),
});

type ResetFormValues = z.infer<typeof resetPasswordSchema>;

export function ForgotPasswordModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter()
     const { loading } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    reset,
      formState: { errors },
  } = useForm<ResetFormValues>({
         resolver: zodResolver(resetPasswordSchema),
    });


    const onSubmit = async (data: ResetFormValues) => {
        try {
            await dispatch(sendResetEmail(data.email)).unwrap()
             toast.success("A reset code has been sent to your email address");
             onClose()
             router.push(`/reset-password?email=${data.email}`)
        } catch (error: any) {
            toast.error(error.message || 'There was an error sending email, please try again later');
        }
    };
  return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Forgot Password</AlertDialogTitle>
            <AlertDialogDescription>
                Enter your registered email address to reset your password.
             </AlertDialogDescription>
          </AlertDialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
             <div className='space-y-2'>
                 <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                  type='email'
                  placeholder='Email'
                    {...register("email")}
                    className="input-focus input-hover"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
             </div>
             <AlertDialogFooter>
                 <AlertDialogCancel>Cancel</AlertDialogCancel>
                 <Button disabled={loading} type="submit">
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </Button>
             </AlertDialogFooter>
            </form>
        </AlertDialogContent>
      </AlertDialog>
  );
}