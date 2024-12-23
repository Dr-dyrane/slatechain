import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { changePassword } from "@/lib/slices/authSlice";
import { toast } from 'sonner';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const passwordFormSchema = z.object({
    currentPassword: z.string().min(8, "Current password should be a minimum of 8 characters"),
    newPassword: z.string().min(8, "New password should be a minimum of 8 characters"),
    confirmNewPassword: z.string().min(8, "Confirm new password should be a minimum of 8 characters")
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords must match',
    path: ['confirmNewPassword']
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function PasswordChange() {
    const dispatch = useDispatch<AppDispatch>();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
    });

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

    return (
        <Card>
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Change your account password</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                    <div className="space-y-2">
                        <label htmlFor="currentPassword" className="text-sm font-medium">Current Password</label>
                        <Input {...register("currentPassword")} type="password" placeholder="Current Password" className='input-focus input-hover' />
                        {errors.currentPassword && (
                            <p className="text-sm text-red-500">{errors.currentPassword.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
                        <Input {...register("newPassword")} type="password" placeholder="New Password" className='input-focus input-hover' />
                        {errors.newPassword && (
                            <p className="text-sm text-red-500">{errors.newPassword.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="confirmNewPassword" className="text-sm font-medium">Confirm New Password</label>
                        <Input {...register("confirmNewPassword")} type="password" placeholder="Confirm New Password" className='input-focus input-hover' />
                        {errors.confirmNewPassword && (
                            <p className="text-sm text-red-500">{errors.confirmNewPassword.message}</p>
                        )}
                    </div>
                    <Button type="submit" className="w-full mt-4">Change Password</Button>
                </form>
            </CardContent>
        </Card>
    );
}

