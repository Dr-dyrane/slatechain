import type React from "react";
import type { UserRole } from "./index";

// Base form data type that allows for different value types
export type FormData = Record<
	string,
	string | number | boolean | string[] | undefined
>;

export interface OnboardingProgress {
	currentStep: number;
	completedSteps: number[];
	completed: boolean;
  roleSpecificData: Record<string, any>
}

// Onboarding state interface
export interface OnboardingState {
	currentStep: number;
	totalSteps: number;
	completedSteps: number[];
	roleSpecificData: Record<string, any>;
	completed: boolean;
	cancelled: boolean;
	loading: boolean;
	userId: string | null;
	error: string | null;
	stepHistory: number[]; // Array of step indices to track navigation history
	stepsData: Record<number, OnboardingStepData>;
}

export interface OnboardingStepData {
	[key: string]: any; // Stores dynamic step-specific data
	startedAt?: Date; // Ensures correct date parsing
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

// API Response types
export interface OnboardingResponse {
	code: string;
	data: {
		status: string;
		currentStep: number;
		completedSteps: number[];
		steps: OnboardingStep[];
		completed: boolean;
		roleSpecificData: Record<string, any>;
	};
}

export interface StepUpdateResponse {
	code: string;
	data: {
		id: number;
		status: string;
		name: string;
		component: string;
		data: Record<string, any>;
		currentStep: number;
	};
}

export interface StepSkipResponse {
	code: string;
	data: {
		id: number;
		name: string;
		component: string;
		status: string;
		skipReason: string;
		currentStep: number;
	};
}

export interface CompletionResponse {
	code: string;
	data: {
		success: boolean;
		completedAt: string;
	};
}

export interface OnboardingStep {
	id: number;
	name: string;
	component: string; // Or a more specific type if you know the component types
	status: string;
  data?: Record<string, any>
}
