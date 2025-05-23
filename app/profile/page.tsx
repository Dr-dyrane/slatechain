"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { User } from "@/lib/types";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import ProfileDashboard from "@/components/profile/ProfileDashboard";
import ProfileEdit from "@/components/profile/ProfileEdit";
import PasswordChange from "@/components/profile/PasswordChange";
import ProfileSkeleton from "./loading";
import { ErrorState } from "@/components/ui/error";
import { OnboardingHistory } from "./OnboardingHistory";
import WalletConnection from "./WalletConnection";
import { fetchUser } from "@/lib/slices/authSlice";

export default function ProfilePage() {
    const user = useSelector((state: RootState) => state.auth?.user) as User;
    const { loading: authLoading, error: authError } = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState("dashboard");
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(
            fetchUser()
        )
    }
        , [dispatch]);

    const refetch = () => {
        dispatch(
            fetchUser()
        )
    }

    if (authLoading) {
        return <ProfileSkeleton />;
    }

    if (authError) {
        return (
            <div className="flex h-full items-center justify-center bg-none">
                <ErrorState
                    title="Profile Error"
                    description="We encountered an issue while loading your profile."
                    message={authError.message}
                    onRetry={() => window.location.reload()}
                    onCancel={() => window.location.href = "/dashboard"}
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-bold">My Profile</h1>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full md:w-auto justify-between md:justify-start flex-wrap mb-10 gap-2">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="edit">Edit Profile</TabsTrigger>
                    <TabsTrigger className="bg-muted" value="password">Password</TabsTrigger>
                    <TabsTrigger className="bg-muted" value="wallet">Blockchain Wallet</TabsTrigger>
                    <TabsTrigger className="bg-muted" value="onboarding">Onboarding</TabsTrigger>
                </TabsList>
                <TabsContent value="dashboard">
                    <ProfileDashboard user={user} />
                </TabsContent>
                <TabsContent value="edit">
                    <ProfileEdit user={user} refetch={refetch} />
                </TabsContent>
                <TabsContent value="password">
                    <PasswordChange />
                </TabsContent>
                <TabsContent value="wallet">
                    <WalletConnection />
                </TabsContent>
                <TabsContent value="onboarding">
                    <OnboardingHistory />
                </TabsContent>
            </Tabs>
        </div>
    );
}

