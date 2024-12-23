import { User } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { updateUser } from "@/lib/slices/authSlice";
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

const profileFormSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(7, "Phone number is invalid")
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileEditProps {
    user: User;
}

export default function ProfileEdit({ user }: ProfileEditProps) {
    const dispatch = useDispatch<AppDispatch>();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            phoneNumber: user?.phoneNumber || "",
        },
    });

    const onSubmit = async (data: ProfileFormValues) => {
        try {
            await dispatch(updateUser(data)).unwrap();
            toast.success('Profile updated successfully', {
                duration: 5000
            });
        } catch (error: any) {
            toast.error('Failed to update profile, please try again later', {
                duration: 5000
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                    <div className="space-y-2">
                        <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                        <Input {...register("firstName")} placeholder="First Name" className='input-focus input-hover' />
                        {errors.firstName && (
                            <p className="text-sm text-red-500">{errors.firstName.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                        <Input  {...register("lastName")} placeholder="Last Name" className='input-focus input-hover' />
                        {errors.lastName && (
                            <p className="text-sm text-red-500">{errors.lastName.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                        <Input {...register("email")} placeholder="Email" className='input-focus input-hover' />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</label>
                        <Input {...register("phoneNumber")} placeholder="Phone Number" className='input-focus input-hover' />
                        {errors.phoneNumber && (
                            <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
                        )}
                    </div>
                    <Button type="submit" className="w-full mt-4">Update Profile</Button>
                </form>
            </CardContent>
        </Card>
    );
}

