import { User, OnboardingStatus, KYCStatus } from "@/lib/types";
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
import { Mail, Phone, CircleUserRound, ChevronRight, Clock, CheckCircle, Wallet } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import Image from "next/image";

interface ProfileDashboardProps {
    user: User;
}

export default function ProfileDashboard({ user }: ProfileDashboardProps) {
    const { wallet } = useSelector((state: RootState) => state.auth)
    const userRoleBadge = () => {
        switch (user.role) {
            case "customer":
                return <Badge variant="secondary">Customer</Badge>;
            case "supplier":
                return <Badge variant="secondary">Supplier</Badge>;
            case "manager":
                return <Badge variant="secondary">Manager</Badge>;
            case "admin":
                return <Badge variant="secondary">Admin</Badge>;
            default:
                return null;
        }
    };

    const renderOnboardingStatus = () => {
        if (user.onboardingStatus === OnboardingStatus.COMPLETED) return <div className="text-sm text-green-500 flex items-center space-x-1"><CheckCircle className="h-3 w-3 mr-2" /> Onboarding Completed </div>;
        if (user.onboardingStatus === OnboardingStatus.PENDING) return <div className="text-sm text-yellow-500 flex items-center space-x-1"><Clock className="h-3 w-3 mr-2" />  Onboarding Pending <Link href={"/onboarding"} className="text-sm text-muted-foreground hover:underline ml-1">(Resume)</Link></div>;
        return <div className="text-sm text-muted-foreground flex items-center space-x-1"><Clock className="h-3 w-3 mr-2" /> Onboarding {user.onboardingStatus} <Link href={"/onboarding"} className="text-sm text-muted-foreground hover:underline ml-1">(Resume)</Link></div>;
    };

    const renderKycStatus = () => {
        if (user.kycStatus === KYCStatus.APPROVED) return <div className="text-sm text-green-500 flex items-center space-x-1"><CheckCircle className="h-3 w-3 mr-2" /> KYC Approved </div>;
        return <div className="text-sm text-muted-foreground flex items-center space-x-1">
            {user.kycStatus === KYCStatus.PENDING_REVIEW ? <Clock className="h-3 w-3 text-yellow-500 mr-2" /> : null}
            {user.kycStatus === KYCStatus.REJECTED ? <Clock className="h-3 w-3 text-red-500 mr-2" /> : null}
            KYC: {user.kycStatus} <Link href={"/kyc"} className="text-sm text-muted-foreground hover:underline ml-1">(Review)</Link></div>;
    };

    return (
        <Card>
            <CardHeader className="flex flex-col items-center space-y-2">
                <Avatar className="h-32 w-32">
                    <AvatarImage src={user.avatarUrl || "https://placekitten.com/200/200"} alt={user?.name || "Avatar"} />
                    <AvatarFallback>
                        {user?.firstName?.[0] || "U"}
                        {user?.lastName?.[0] || "N"}
                    </AvatarFallback>
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
                    <div className="flex items-center space-x-2">
                        <Image
                            src="/icons/ethereum.svg"
                            alt="Ethereum"
                            width={16}
                            height={16}
                            className="h-4 w-4"
                        />
                        <span className="text-sm">
                            {wallet ? (
                                <span>
                                    {wallet.address.substring(0, 6)}...{wallet.address.substring(wallet.address.length - 4)}
                                </span>
                            ) : (
                                <span className="text-muted-foreground">No wallet connected</span>
                            )}
                        </span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col bg-muted p-4 gap-4">
                {renderOnboardingStatus()}
                {renderKycStatus()}
            </CardFooter>
        </Card>
    );
}

