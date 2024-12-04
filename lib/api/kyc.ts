import apiClient from "./apiClient";
import { KYCStatus } from "@/lib/types/user";

export const fetchKYCStatus = async (userId: string): Promise<KYCStatus> => {
  const response = await apiClient<KYCStatus>("/kyc/status", "GET");
  return response;
};

export const updateKYCStatus = async (userId: string, documents: { [key: string]: string }): Promise<KYCStatus> => {
  const response = await apiClient<KYCStatus>("/kyc/update", "PUT", { userId, documents });
  return response;
};

