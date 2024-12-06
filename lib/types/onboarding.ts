import { UserRole } from ".";

export interface OnboardingStepProps {
    role: UserRole;
    name?: string;
    onComplete: (data: any) => Promise<void>;
    data?: { [key: string]: string | number | boolean };
  }
  
  export interface WelcomeProps extends OnboardingStepProps {}
  export interface ProfileSetupProps extends OnboardingStepProps {}
  export interface ServiceQuestionsProps extends OnboardingStepProps {}
  export interface PreferencesProps extends OnboardingStepProps {}
  
  