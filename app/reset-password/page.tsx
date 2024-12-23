// src/app/reset-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { resetUserPassword } from "@/lib/slices/authSlice";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import LayoutLoader from "@/components/layout/loading";
import { toast } from "sonner";

const resetPasswordSchema = z.object({
	code: z.string().min(6, "Code should be 6 characters long"),
    newPassword: z.string().min(8, "New password should be a minimum of 8 characters"),
	confirmNewPassword: z.string().min(8, "Confirm new password should be a minimum of 8 characters")
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords must match',
	path: ['confirmNewPassword']
});

type ResetFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
	const router = useRouter();
	const dispatch = useDispatch<AppDispatch>();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
    const email = searchParams.get("email");
    const { loading, error } = useSelector((state: RootState) => state.auth)
	const [resetSuccessful, setResetSuccessful] = useState(false);
     const {
        register,
        handleSubmit,
         formState: { errors },
    } = useForm<ResetFormValues>({
         resolver: zodResolver(resetPasswordSchema),
    });


    useEffect(() => {
		if (!token && !email) {
			router.push("/login");
		}
	}, [token, router, email]);


    const onSubmit = async (data: ResetFormValues) => {
          try {
           await dispatch(resetUserPassword({token: data.code, newPassword: data.newPassword})).unwrap()
           setResetSuccessful(true)
             setTimeout(() => {
               router.push("/login")
           }, 3000)

       } catch (err: any) {
           setResetSuccessful(false);
           toast.error(err.message || 'There was an error with the password reset process please try again')
        }
    }
        if (loading) {
           return <LayoutLoader />
        }
    if (!token && !email) {
        return (
            <div className="flex h-full items-center justify-center bg-none">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Invalid Request</CardTitle>
                         <CardDescription>This link is either invalid or has expired, please check and try again</CardDescription>
                    </CardHeader>
                    <CardContent></CardContent>
                    <CardFooter>
                         <Button onClick={() => router.push('/login')}>Go to Login</Button>
                  </CardFooter>
                </Card>
           </div>
        )
    }
      if (resetSuccessful) {
            return (
                 <div className="flex h-full items-center justify-center bg-none">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                 <CardTitle>Password Reset Successful</CardTitle>
                                <CardDescription>Your password has been reset successfully, you will be redirected to login page in 3 seconds</CardDescription>
                            </CardHeader>
                            <CardContent></CardContent>
                        </Card>
                  </div>
            )
      }


    return (
        <div className="flex h-full items-center justify-center bg-none">
              <Card className="w-[350px]">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl mt-2">Reset Password</CardTitle>
                  <CardDescription>Enter a code and your new password to reset your account.</CardDescription>
                </CardHeader>
                <CardContent>
                     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div className="space-y-2">
                         <Label htmlFor="code">Code</Label>
                          <Input
                              id="code"
                               placeholder='Enter Code'
                            {...register("code")}
                              className="input-focus input-hover"
                            />
                           {errors.code && (
                                 <p className="text-sm text-red-500">{errors.code.message}</p>
                            )}
                         </div>
                        <div className="space-y-2">
                         <Label htmlFor="newPassword">New Password</Label>
                          <Input
                              id="newPassword"
                             type='password'
                            placeholder='New Password'
                              {...register("newPassword")}
                              className="input-focus input-hover"
                           />
                            {errors.newPassword && (
                              <p className="text-sm text-red-500">{errors.newPassword.message}</p>
                            )}
                         </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                        <Input
                            id="confirmNewPassword"
                           type='password'
                            placeholder='Confirm New Password'
                            {...register("confirmNewPassword")}
                             className="input-focus input-hover"
                       />
                        {errors.confirmNewPassword && (
                            <p className="text-sm text-red-500">{errors.confirmNewPassword.message}</p>
                         )}
                    </div>
                       <Button type="submit" className='mt-4 w-full' disabled={loading}>
                              {loading ? "Reseting..." : "Reset Password"}
                       </Button>
                        {error && (
                            <Alert variant="destructive" className="mt-4">
                                <AlertDescription>{error.message}</AlertDescription>
                             </Alert>
                         )}

                </form>
           </CardContent>
          <CardFooter>
                 <Button variant='link' size={'sm'} onClick={() => router.push('/login')}>Cancel</Button>
          </CardFooter>
        </Card>
       </div>
    )
}