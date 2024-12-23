// src/app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState, AppDispatch } from "@/lib/store";
import { User, OnboardingStatus, KYCStatus, PasswordChangeFormData } from "@/lib/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Mail,
    Phone,
    MapPin,
    CircleUserRound,
    Pencil,
    ChevronRight,
    LayoutDashboard,
    Clock,
    CheckCircle
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { updateUserProfile, changeUserPassword } from "@/lib/api/auth"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input"
import { toast } from 'sonner'
import { setUser, fetchUser, changePassword, updateUser } from "@/lib/slices/authSlice";
import Link from "next/link";

import { ErrorState } from "@/components/ui/error";
import ProfileSkeleton  from "./loading";


const profileFormSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(7, "Phone number is invalid")
});

const passwordFormSchema = z.object({
    currentPassword: z.string().min(8, "Current password should be a minimum of 8 characters"),
    newPassword: z.string().min(8, "New password should be a minimum of 8 characters"),
    confirmNewPassword: z.string().min(8, "Confirm new password should be a minimum of 8 characters")
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords must match',
    path: ['confirmNewPassword']
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function ProfilePage() {
    const user = useSelector((state: RootState) => state.auth.user) || {} as User;
    const { loading: authLoading, error: authError } = useSelector((state: RootState) => state.auth)
    const [activeTab, setActiveTab] = useState("dashboard")
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();


    const {
        register,
        handleSubmit,
        reset,
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
    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        formState: { errors: passwordErrors },
    } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
    });

    if (authLoading) {
        return <ProfileSkeleton />
    }
    if (authError) {
        return (
            <div className="flex h-full items-center justify-center bg-none">
                <ErrorState
                    message="There was an error loading your profile, please try again later"
                    onRetry={() => router.refresh()}
                    onCancel={() => router.push("/dashboard")}
                />
            </div>
        )
    }

    const userRoleBadge = () => {
        switch (user.role) {
            case "customer":
                return <Badge variant="secondary">Customer</Badge>
            case "supplier":
                return <Badge variant="secondary">Supplier</Badge>
            case "manager":
                return <Badge variant="secondary">Manager</Badge>
            case "admin":
                return <Badge variant="secondary">Admin</Badge>
            default:
                return null;
        }
    }


    const handleResumeOnboarding = () => {
        router.push('/onboarding')
    }

    const handleReviewKYC = () => {
        router.push('/kyc')
    }

    const renderOnboardingStatus = () => {
        if (user.onboardingStatus === OnboardingStatus.COMPLETED) return <div className="text-sm text-green-500 flex items-center space-x-1"><CheckCircle className="h-3 w-3 mr-2" /> Onboarding Completed </div>;
        if (user.onboardingStatus === OnboardingStatus.PENDING) return <div className="text-sm text-yellow-500 flex items-center space-x-1"><Clock className="h-3 w-3 mr-2" />  Onboarding Pending <Link href={"/onboarding"} className="text-sm text-muted-foreground hover:underline ml-1">(Resume)</Link></div>;
        return <div className="text-sm text-muted-foreground flex items-center space-x-1"><Clock className="h-3 w-3 mr-2" /> Onboarding {user.onboardingStatus} <Link href={"/onboarding"} className="text-sm text-muted-foreground hover:underline ml-1">(Resume)</Link></div>
    }


    const renderKycStatus = () => {
        if (user.kycStatus === KYCStatus.APPROVED) return <div className="text-sm text-green-500 flex items-center space-x-1"><CheckCircle className="h-3 w-3 mr-2" /> KYC Approved </div>
        return <div className="text-sm text-muted-foreground flex items-center space-x-1">
            {user.kycStatus === KYCStatus.PENDING_REVIEW ? <Clock className="h-3 w-3 text-yellow-500 mr-2" /> : null}
            {user.kycStatus === KYCStatus.REJECTED ? <Clock className="h-3 w-3 text-red-500 mr-2" /> : null}
            KYC: {user.kycStatus} <Link href={"/kyc"} className="text-sm text-muted-foreground hover:underline ml-1">(Review)</Link></div>
    }


    const onSubmit = async (data: ProfileFormValues) => {
        try {
          dispatch(updateUser(data)).unwrap();
                toast.success('Profile updated successfully', {
                    duration: 5000
                });
        } catch (error: any) {
            toast.error('Failed to update profile, please try again later', {
                duration: 5000
            });
        }
    }
    const onPasswordChangeSubmit = async (data: PasswordChangeFormData) => {
        try {
            await dispatch(changePassword(data)).unwrap()
            reset()
            toast.success('Password changed successfully');
        } catch (error: any) {
            toast.error('Failed to change password, please try again later', {
                duration: 5000
            });
        }
    }

    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold">User Profile</h1>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full md:w-auto justify-between md:justify-start">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="edit">Edit Profile</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                <TabsContent value="dashboard">
                    <Card>
                        <CardHeader className="flex flex-col items-center space-y-2">
                            <Avatar className="h-32 w-32">
                                <AvatarImage src={user.avatarUrl || "https://placekitten.com/200/200"} alt={user?.name || "Avatar"} />
                                <AvatarFallback>{user?.firstName[0]}{user?.lastName[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-center">
                                <CardTitle className="text-2xl font-semibold">{user.name}</CardTitle>
                                <div className="text-sm text-muted-foreground flex space-x-1">
                                    {userRoleBadge()}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className='flex flex-col space-y-4'>
                            <div className="flex items-center justify-between">
                                <span className="text-md font-semibold">User Details</span>
                                <Link href={"/settings"} className="text-sm bg-muted px-4 py-1 rounded-lg flex items-center justify-center text-muted-foreground hover:underline">
                                    More Settings<ChevronRight className="h-4 w-4 ml-1" />
                                </Link>
                            </div>
                            <Separator />
                            <div className='space-y-4'>
                                <div className="flex items-center space-x-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{user.email}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{user.phoneNumber}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <CircleUserRound className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{user.id}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col bg-muted p-4 gap-4">
                            {renderOnboardingStatus()}
                            {renderKycStatus()}
                        </CardFooter>
                    </Card>

                </TabsContent>
                <TabsContent value="edit">
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
                </TabsContent>
                <TabsContent value="password">
                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Change your account password</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordSubmit(onPasswordChangeSubmit)} className='space-y-4'>
                                <div className="space-y-2">
                                    <label htmlFor="currentPassword" className="text-sm font-medium">Current Password</label>
                                    <Input {...registerPassword("currentPassword")} type="password" placeholder="Current Password" className='input-focus input-hover' />
                                    {passwordErrors.currentPassword && (
                                        <p className="text-sm text-red-500">{passwordErrors.currentPassword.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
                                    <Input {...registerPassword("newPassword")} type="password" placeholder="New Password" className='input-focus input-hover' />
                                    {passwordErrors.newPassword && (
                                        <p className="text-sm text-red-500">{passwordErrors.newPassword.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="confirmNewPassword" className="text-sm font-medium">Confirm New Password</label>
                                    <Input {...registerPassword("confirmNewPassword")} type="password" placeholder="Confirm New Password" className='input-focus input-hover' />
                                    {passwordErrors.confirmNewPassword && (
                                        <p className="text-sm text-red-500">{passwordErrors.confirmNewPassword.message}</p>
                                    )}
                                </div>

                                <Button type="submit" className="w-full mt-4">Change Password</Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}