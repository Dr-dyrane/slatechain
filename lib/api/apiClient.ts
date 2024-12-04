import { User, AuthResponse, KYCStatus, OnboardingProgress } from "@/lib/types/user";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const apiClient = async <T>(
  endpoint: string,
  method: string = "GET",
  body?: any
): Promise<T> => {
  const url = `${apiUrl}${endpoint}`;

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : null,
  };

  // Simulate a delay to mimic an API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock responses for the endpoints
  if (endpoint === "/auth/register" && method === "POST") {
    const user: User = {
      id: "1",
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phoneNumber: body.phoneNumber,
      role: "customer",
      isEmailVerified: false,
      isPhoneVerified: false,
      kycStatus: "PENDING",
      onboardingStatus: "PENDING",
    };
    return user as T;
  }

  if (endpoint === "/auth/login" && method === "POST") {
    if (body.email === "test@example.com" && body.password === "password") {
      const authResponse: AuthResponse = {
        user: {
          id: "1",
          firstName: "John",
          lastName: "Doe",
          email: body.email,
          phoneNumber: "+1234567890",
          role: "customer",
          isEmailVerified: true,
          isPhoneVerified: true,
          kycStatus: "APPROVED",
          onboardingStatus: "COMPLETED",
        },
        token: "mock-jwt-token",
        refreshToken: "mock-refresh-token",
      };
      return authResponse as T;
    } else {
      throw new Error("Invalid email or password.");
    }
  }

  if (endpoint === "/kyc/status" && method === "GET") {
    const kycStatus: KYCStatus = {
      status: "PENDING",
      documents: {
        identityProof: "identity-proof-url",
        addressProof: "address-proof-url",
      },
    };
    return kycStatus as T;
  }

  if (endpoint === "/kyc/update" && method === "PUT") {
    const updatedKycStatus: KYCStatus = {
      status: "APPROVED",
      documents: {
        identityProof: "new-identity-proof-url",
        addressProof: "new-address-proof-url",
      },
    };
    return updatedKycStatus as T;
  }

  if (endpoint === "/onboarding/progress" && method === "GET") {
    const onboardingProgress: OnboardingProgress = {
      currentStep: 2,
      completedSteps: [0, 1],
    };
    return onboardingProgress as T;
  }

  throw new Error("Endpoint not found.");
};

export default apiClient;

