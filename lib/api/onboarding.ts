// lib/api/onboarding.ts
import apiClient from "@/lib/api/apiClient"; // Import apiClient

// Fetch user progress
export const fetchProgress = async (userId: string) => {
  const endpoint = "/progress"; // Endpoint to fetch user progress
  const method = "GET";
  const response = await apiClient(endpoint, method, { userId });
  return response; // Return mock data as the response
};

// Save step progress
export const saveStepProgress = async (userId: string, stepId: number) => {
  const endpoint = "/save-progress"; // Endpoint to save progress
  const method = "POST";
  const body = { userId, stepId };
  const response = await apiClient(endpoint, method, body);
  return response; // Return mock data as the response
};

// Complete onboarding
export const completeOnboardingApi = async (userId: string) => {
  const endpoint = "/complete-onboarding"; // Endpoint to complete onboarding
  const method = "POST";
  const body = { userId };
  const response = await apiClient(endpoint, method, body);
  return response; // Return mock data as the response
};
