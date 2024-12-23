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
import { User as UserIcon, Mail, Phone, ArrowRight } from "lucide-react";
import * as Tooltip from '@radix-ui/react-tooltip';
import { Label } from "@/components/ui/label";

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
                        <Tooltip.Provider>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <Label htmlFor="firstName" className='flex items-center gap-1'>
                                        <UserIcon className="h-4 w-4 text-muted-foreground" /> First Name
                                    </Label>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md" side="top" align="center" >
                                        Enter your first name
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                        <Input {...register("firstName")} placeholder="First Name" className='input-focus input-hover' />
                        {errors.firstName && (
                            <p className="text-sm text-red-500">{errors.firstName.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Tooltip.Provider>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <Label htmlFor="lastName" className='flex items-center gap-1'>
                                        <UserIcon className="h-4 w-4 text-muted-foreground" /> Last Name
                                    </Label>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md" side="top" align="center" >
                                        Enter your last name
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                        <Input  {...register("lastName")} placeholder="Last Name" className='input-focus input-hover' />
                        {errors.lastName && (
                            <p className="text-sm text-red-500">{errors.lastName.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Tooltip.Provider>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <Label htmlFor="email" className='flex items-center gap-1'>
                                        <Mail className="h-4 w-4 text-muted-foreground" /> Email
                                    </Label>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md" side="top" align="center" >
                                        Enter your email address
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                        <Input {...register("email")} placeholder="Email" className='input-focus input-hover' />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Tooltip.Provider>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <Label htmlFor="phoneNumber" className='flex items-center gap-1'>
                                        <Phone className="h-4 w-4 text-muted-foreground" /> Phone Number
                                    </Label>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md" side="top" align="center" >
                                        Enter your phone number
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                        <Input {...register("phoneNumber")} placeholder="Phone Number" className='input-focus input-hover' />
                        {errors.phoneNumber && (
                            <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
                        )}
                    </div>
                    <Button type="submit" className="w-full mt-4 flex items-center justify-center gap-2">Update Profile <ArrowRight size={16} /></Button>
                </form>
            </CardContent>
        </Card>
    );
}