import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { changePassword } from "@/lib/slices/authSlice";
import { toast } from 'sonner';
import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Check, X, Lock, ArrowRight } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

const passwordFormSchema = z.object({
    currentPassword: z.string().min(8, "Current password should be a minimum of 8 characters"),
    newPassword: z.string().min(8, "New password should be a minimum of 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    confirmNewPassword: z.string().min(8, "Confirm new password should be a minimum of 8 characters")
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords must match',
    path: ['confirmNewPassword']
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function PasswordChange() {
    const dispatch = useDispatch<AppDispatch>();
    const [newPasswordVisible, setNewPasswordVisible] = useState(false);
    const [confirmNewPasswordVisible, setConfirmNewPasswordVisible] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<{ hasUppercase: boolean; hasLowercase: boolean; hasNumber: boolean; isLongEnough: boolean } | null>(null);
    const [passwordsMatch, setPasswordsMatch] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        watch,
        trigger,
        formState: { errors, isValid },
    } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        mode: "onChange"
    });

    const newPasswordValue = watch("newPassword");
    const confirmNewPasswordValue = watch("confirmNewPassword");

    useEffect(() => {
        if (newPasswordValue) {
            setPasswordStrength(validatePasswordStrength(newPasswordValue));
            trigger("newPassword");
        } else {
            setPasswordStrength(null);
        }
    }, [newPasswordValue, trigger]);

    useEffect(() => {
        if (confirmNewPasswordValue && newPasswordValue) {
            setPasswordsMatch(newPasswordValue === confirmNewPasswordValue);
            trigger("confirmNewPassword");
        } else {
            setPasswordsMatch(false);
        }
    }, [confirmNewPasswordValue, newPasswordValue, trigger]);

    const onSubmit = async (data: PasswordFormValues) => {
        try {
            await dispatch(changePassword(data)).unwrap();
            reset();
            toast.success('Password changed successfully');
        } catch (error: any) {
            toast.error('Failed to change password, please try again later', {
                duration: 5000
            });
        }
    };

    const toggleNewPasswordVisibility = () => {
        setNewPasswordVisible(!newPasswordVisible);
    };

    const toggleConfirmNewPasswordVisibility = () => {
        setConfirmNewPasswordVisible(!confirmNewPasswordVisible);
    };

    const validatePasswordStrength = (password: string) => {
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const isLongEnough = password.length >= 8;
        return { hasUppercase, hasLowercase, hasNumber, isLongEnough };
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Change your account password</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                    <div className="space-y-2">
                        <Tooltip.Provider>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <Label htmlFor="currentPassword" className="text-sm font-medium flex items-center gap-1">
                                        <Lock className="h-4 w-4 text-muted-foreground" /> Current Password
                                    </Label>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md" side="top" align="center" >
                                        Enter your current account password
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                        <Input
                            {...register("currentPassword")}
                            type="password"
                            placeholder="Current Password"
                            className='input-focus input-hover'
                        />
                        {errors.currentPassword && (
                            <p className="text-sm text-red-500">{errors.currentPassword.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Tooltip.Provider>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <Label htmlFor="newPassword" className="text-sm font-medium flex items-center gap-1">
                                        <Lock className="h-4 w-4 text-muted-foreground" /> New Password
                                    </Label>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md" side="top" align="center" >
                                        Enter your new account password
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                        <div className="relative">
                            <Input
                                {...register("newPassword")}
                                type={newPasswordVisible ? "text" : "password"}
                                placeholder="New Password"
                                className='input-focus input-hover pr-10'
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                onClick={toggleNewPasswordVisibility}
                            >
                                {newPasswordVisible ? (
                                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-5 w-5 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                        {passwordStrength && (
                            <div className="space-y-1 mt-3 bg-muted p-2 rounded-md">
                                <p className={`text-sm ${passwordStrength.isLongEnough ? 'text-green-500' : 'text-red-500'}`}>
                                    {passwordStrength.isLongEnough ? <Check className="inline mr-1" /> : <X className="inline mr-1" />}
                                    At least 8 characters
                                </p>
                                <p className={`text-sm ${passwordStrength.hasUppercase ? 'text-green-500' : 'text-red-500'}`}>
                                    {passwordStrength.hasUppercase ? <Check className="inline mr-1" /> : <X className="inline mr-1" />}
                                    Contains uppercase letter
                                </p>
                                <p className={`text-sm ${passwordStrength.hasLowercase ? 'text-green-500' : 'text-red-500'}`}>
                                    {passwordStrength.hasLowercase ? <Check className="inline mr-1" /> : <X className="inline mr-1" />}
                                    Contains lowercase letter
                                </p>
                                <p className={`text-sm ${passwordStrength.hasNumber ? 'text-green-500' : 'text-red-500'}`}>
                                    {passwordStrength.hasNumber ? <Check className="inline mr-1" /> : <X className="inline mr-1" />}
                                    Contains number
                                </p>
                            </div>
                        )}
                        {errors.newPassword && (
                            <p className="text-sm text-red-500">{errors.newPassword.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Tooltip.Provider>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <Label htmlFor="confirmNewPassword" className="text-sm font-medium flex items-center gap-1">
                                        <Lock className="h-4 w-4 text-muted-foreground" /> Confirm New Password
                                    </Label>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md" side="top" align="center" >
                                        Confirm your new account password
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                        <div className="relative">
                            <Input
                                {...register("confirmNewPassword")}
                                type={confirmNewPasswordVisible ? "text" : "password"}
                                placeholder="Confirm New Password"
                                className='input-focus input-hover pr-10'
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                onClick={toggleConfirmNewPasswordVisibility}
                            >
                                {confirmNewPasswordVisible ? (
                                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-5 w-5 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                        {errors.confirmNewPassword && (
                            <p className="text-sm text-red-500">{errors.confirmNewPassword.message}</p>
                        )}
                        {newPasswordValue && confirmNewPasswordValue && passwordsMatch && (
                            <p className="text-sm text-green-500 flex items-center mt-1">
                                <Check className="inline mr-1" />
                                Passwords match
                            </p>
                        )}
                        {!passwordsMatch && confirmNewPasswordValue && newPasswordValue && (
                            <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
                        )}
                    </div>
                    <Button type="submit" className="w-full mt-4 flex items-center justify-center gap-2" disabled={!isValid}>Change Password <ArrowRight size={16} /></Button>
                </form>
            </CardContent>
        </Card>
    );
}