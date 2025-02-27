import type React from "react";
import type { UserRole } from "@/lib/types";

// Base form data type that allows for different value types
export type FormData = Record<
	string,
	string | number | boolean | string[] | undefined
>;

// Onboarding state interface
export interface OnboardingState {
	currentStep: number;
	totalSteps: number;
	completedSteps: number[];
	roleSpecificData: Record<string, any>;
	completed: boolean;
	cancelled: boolean;
	userId: string | null;
	loading: boolean;
	error: string | null; 
}

// Base props that all onboarding steps share
export interface OnboardingStepProps {
	role: UserRole;
	name?: string;
	onComplete: (data: FormData) => Promise<void>;
	data?: FormData;
	onSkip?: (reason: string) => Promise<void>;
}

// Step-specific props
export interface WelcomeProps extends OnboardingStepProps {}
export interface ProfileSetupProps extends OnboardingStepProps {}
export interface ServiceQuestionsProps extends OnboardingStepProps {}
export interface IntegrationsProps extends OnboardingStepProps {}
export interface PreferencesProps extends OnboardingStepProps {}
export interface CompletionProps extends OnboardingStepProps {}

// Profile fields specific props
export interface ProfileFieldsProps {
	formData: FormData;
	onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Role specific questions props
export interface RoleSpecificQuestionsProps {
	role: string;
	formData: FormData;
	onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Preference fields props
export interface PreferenceFieldsProps {
	preferences: Record<string, boolean>;
	onToggle: (key: string) => void;
}
