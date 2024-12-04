export interface OnboardingStepProps {
    role: string;
    name?: string;
    onComplete: (data: any) => Promise<void>;
    data?: { [key: string]: string | number | boolean };
  }
  
  export interface WelcomeProps extends OnboardingStepProps {}
  export interface ProfileSetupProps extends OnboardingStepProps {}
  export interface ServiceQuestionsProps extends OnboardingStepProps {}
  export interface PreferencesProps extends OnboardingStepProps {}
  
  