export interface User {
    id: string;
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    onboardingStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  }
  
  export interface AuthResponse {
    user: User;
    token: string;
    refreshToken: string;
  }
  
  export interface KYCStatus {
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    documents: {
      [key: string]: string;
    };
  }
  
  export interface OnboardingProgress {
    currentStep: number;
    completedSteps: number[];
  }
  