import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { KYCStatus, OnboardingStatus } from "@/lib/types";

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
      {onboardingStatus !== OnboardingStatus.COMPLETED && (
        <Alert
          variant={onboardingStatus === OnboardingStatus.NOT_STARTED ? "destructive" : "default"}
          className={onboardingStatus !== OnboardingStatus.NOT_STARTED ? "border-yellow-200 bg-yellow-50" : ""}
        >
          <AlertCircle className={`h-4 w-4 ${onboardingStatus === OnboardingStatus.NOT_STARTED ? "text-destructive" : "text-yellow-600"}`} />
          <AlertTitle className="text-lg font-semibold">Onboarding {onboardingStatus === OnboardingStatus.IN_PROGRESS ? "In Progress" : "Not Started"}</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="text-sm text-muted-foreground mb-2">
              {onboardingStatus === OnboardingStatus.IN_PROGRESS
                ? "Your onboarding process is incomplete. Please finish it to access all features."
                : "Start your onboarding process to unlock all features of your account."}
            </p>
            <Button
              variant={onboardingStatus === OnboardingStatus.NOT_STARTED ? "destructive" : "outline"}
              size="sm"
              onClick={onResumeOnboarding}
              className={`mt-2 ${onboardingStatus !== OnboardingStatus.NOT_STARTED ? "border-yellow-200 bg-yellow-50 hover:bg-yellow-100 hover:text-yellow-900" : ""}`}
            >
              {onboardingStatus === OnboardingStatus.IN_PROGRESS ? "Resume Onboarding" : "Start Onboarding"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {kycStatus !== KYCStatus.APPROVED && (
        <Alert
          variant={kycStatus === KYCStatus.REJECTED ? "destructive" : "default"}
          className={kycStatus !== KYCStatus.REJECTED ? "border-yellow-200 bg-yellow-50" : ""}
        >
          <FileText className={`h-4 w-4 ${kycStatus === KYCStatus.REJECTED ? "text-destructive" : "text-yellow-600"}`} />
          <AlertTitle className="text-lg font-semibold">
            KYC {kycStatus === KYCStatus.NOT_STARTED ? "Not Started" : kycStatus === KYCStatus.IN_PROGRESS ? "In Progress" : "Pending Review"}
          </AlertTitle>
          <AlertDescription className="mt-2">
            <p className="text-sm text-muted-foreground mb-2">
              {kycStatus === KYCStatus.NOT_STARTED
                ? "Start your KYC process to verify your account."
                : kycStatus === KYCStatus.IN_PROGRESS
                ? "Your KYC is in progress. Please complete all required steps."
                : "Your KYC is pending review. We'll notify you once it's approved."}
            </p>
            <Button
              variant={kycStatus === KYCStatus.REJECTED ? "destructive" : "outline"}
              size="sm"
              onClick={onReviewKYC}
              className={`mt-2 ${kycStatus !== KYCStatus.REJECTED ? "border-yellow-200 bg-yellow-50 hover:bg-yellow-100 hover:text-yellow-900" : ""}`}
            >
              {kycStatus === KYCStatus.NOT_STARTED ? "Start KYC" : "Review KYC"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {onboardingStatus === OnboardingStatus.COMPLETED && kycStatus === KYCStatus.APPROVED && (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-lg font-semibold text-green-700">Account Fully Verified</AlertTitle>
          <AlertDescription className="text-sm text-green-600">
            Your account is fully verified. You have complete access to all features.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default UserStatusAlert;

