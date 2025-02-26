// lib/api/kyc.ts

import { KYCStatus, KYCDocument, KYCSubmissionRequest } from "@/lib/types";
import { apiClient } from "./apiClient";

export const fetchKYCStatus = async (): Promise<{ status: KYCStatus; documents: KYCDocument[] }> => {
  return apiClient.get<{ status: KYCStatus; documents: KYCDocument[] }>("/kyc/status");
};

export const startKYCProcess = async (): Promise<KYCStatus> => {
  return apiClient.post<KYCStatus>("/kyc/start");
};

export const uploadKYCDocument = async (
  documentType: string,
  file: File
): Promise<KYCDocument> => {
  const formData = new FormData();
  formData.append("type", documentType);
  formData.append("document", file);
  return apiClient.post<KYCDocument>("/kyc/documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const submitKYCData = async (kycData: KYCSubmissionRequest): Promise<{ status: KYCStatus; referenceId: string }> => {
  return apiClient.post<{ status: KYCStatus; referenceId: string }>('/kyc/submit', kycData);
};

