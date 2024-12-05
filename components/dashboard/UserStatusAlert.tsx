import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, FileText, ArrowRight } from "lucide-react";
import { KYCStatus, OnboardingStatus } from "@/lib/types";

interface StatusAlertProps {
    status: string;
    title: string;
    description: string;
    buttonText: string;
    buttonVariant: "default" | "destructive" | "link" | "outline" | "secondary" | "ghost";
    onButtonClick: () => void;
    icon: React.ReactNode;
}


const StatusAlert: React.FC<StatusAlertProps> = ({
    status,
    title,
    description,
    buttonText,
    buttonVariant,
    onButtonClick,
    icon,
}) => {
    return (
        <Alert
            variant={status === "destructive" ? "destructive" : "default"}
            className={status !== "approved"
                ? "border-yellow-200 bg-yellow-50 dark:bg-muted dark:border-muted"
                : ""}
        >
            {icon}
            <AlertTitle className="text-lg font-semibold text-muted-foreground dark:text-muted-foreground">
                {title}
            </AlertTitle>
            <AlertDescription className="mt-2">
                <p className="text-sm text-muted-foreground mb-2 dark:text-muted-foreground">
                    {description}
                </p>
                <Button
                    variant={buttonVariant}
                    size="sm"
                    onClick={onButtonClick}
                    className={`mt-2 ${status !== "approved"
                        ? "border-yellow-200 bg-yellow-50 hover:bg-yellow-100 hover:text-yellow-900 dark:bg-muted dark:border-muted dark:hover:bg-muted/70 dark:hover:text-yellow-300"
                        : ""}`}
                >
                    {buttonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </AlertDescription>
        </Alert>
    );
};


interface UserStatusAlertProps {
    kycStatus: KYCStatus;
    onboardingStatus: OnboardingStatus;
    onResumeOnboarding: () => void;
    onReviewKYC: () => void;
}

const UserStatusAlert: React.FC<UserStatusAlertProps> = ({
    kycStatus,
    onboardingStatus,
    onResumeOnboarding,
    onReviewKYC,
}) => {
    if (onboardingStatus === OnboardingStatus.COMPLETED && kycStatus === KYCStatus.APPROVED) {
        return null; // Do not show anything if both are completed
    }

    return (
        <div className="space-y-4">
            {/* Onboarding Status */}
            {onboardingStatus !== OnboardingStatus.COMPLETED && (
                <StatusAlert
                    status={onboardingStatus === OnboardingStatus.NOT_STARTED ? "destructive" : "default"}
                    title={`Onboarding ${onboardingStatus === OnboardingStatus.IN_PROGRESS ? "In Progress" : "Not Started"}`}
                    description={
                        onboardingStatus === OnboardingStatus.IN_PROGRESS
                            ? "Your onboarding process is incomplete. Please finish it to access all features."
                            : "Start your onboarding process to unlock all features of your account."
                    }
                    buttonText={onboardingStatus === OnboardingStatus.IN_PROGRESS ? "Resume Onboarding" : "Start Onboarding"}
                    buttonVariant={onboardingStatus === OnboardingStatus.NOT_STARTED ? "destructive" : "outline"}
                    onButtonClick={onResumeOnboarding}
                    icon={
                        <AlertCircle className={`h-4 w-4 ${onboardingStatus === OnboardingStatus.NOT_STARTED ? "text-destructive" : "text-yellow-600"}`} />
                    }
                />
            )}

            {/* KYC Status */}
            {kycStatus !== KYCStatus.APPROVED && (
                <StatusAlert
                    status={kycStatus === KYCStatus.REJECTED ? "destructive" : "default"}
                    title={`KYC ${kycStatus === KYCStatus.NOT_STARTED ? "Not Started" : kycStatus === KYCStatus.IN_PROGRESS ? "In Progress" : "Pending Review"}`}
                    description={
                        kycStatus === KYCStatus.NOT_STARTED
                            ? "Start your KYC process to verify your account."
                            : kycStatus === KYCStatus.IN_PROGRESS
                                ? "Your KYC is in progress. Please complete all required steps."
                                : "Your KYC is pending review. We'll notify you once it's approved."
                    }
                    buttonText={kycStatus === KYCStatus.NOT_STARTED ? "Start KYC" : "Review KYC"}
                    buttonVariant={kycStatus === KYCStatus.REJECTED ? "destructive" : "outline"}
                    onButtonClick={onReviewKYC}
                    icon={
                        <FileText className={`h-4 w-4 ${kycStatus === KYCStatus.REJECTED ? "text-destructive" : "text-yellow-600"}`} />
                    }
                />
            )}

            {/* Fully Verified Status */}
            {onboardingStatus === OnboardingStatus.COMPLETED && kycStatus === KYCStatus.APPROVED && (
                <StatusAlert
                    status="approved"
                    title="Account Fully Verified"
                    description="Your account is fully verified. You have complete access to all features."
                    buttonText=""
                    buttonVariant="default"
                    onButtonClick={() => { }}
                    icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                />
            )}
        </div>
    );
};

export default UserStatusAlert;
