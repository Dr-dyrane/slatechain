import type { KYCStatus, KYCDocument, KYCSubmissionRequest } from "@/lib/types"
import { apiClient } from "./apiClient/[...live]";

// User KYC Operations
export const fetchKYCStatus = async (): Promise<{
  status: KYCStatus
  documents: KYCDocument[]
}> => {
  return apiClient.get<{ status: KYCStatus; documents: KYCDocument[] }>("/kyc/status")
}

export const startKYCProcess = async (): Promise<KYCStatus> => {
  return apiClient.post<KYCStatus>("/kyc/start")
}

export const submitKYCData = async (
  kycData: KYCSubmissionRequest,
): Promise<{ status: KYCStatus; referenceId: string }> => {
  return apiClient.post<{ status: KYCStatus; referenceId: string }>("/kyc/submit", kycData)
}

// Document Operations
export const uploadKYCDocument = async (documentType: string, file: File): Promise<KYCDocument> => {
  const formData = new FormData()
  formData.append("type", documentType)
  formData.append("document", file)
  return apiClient.post<KYCDocument>("/kyc/documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
}

export const getKYCDocument = async (documentId: string): Promise<KYCDocument> => {
  return apiClient.get<KYCDocument>(`/kyc/documents/${documentId}`)
}

export const deleteKYCDocument = async (documentId: string): Promise<{ success: boolean; message: string }> => {
  return apiClient.delete<{ success: boolean; message: string }>(`/kyc/documents/${documentId}`)
}

// Admin Operations
interface KYCSubmissionResponse {
  id: string
  userId: string
  fullName: string
  status: string
  createdAt: string
  role: string
  documents: KYCDocument[]
}

interface PaginatedKYCSubmissions {
  submissions: KYCSubmissionResponse[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export const verifyKYCSubmission = async (
  submissionId: string,
  status: "APPROVED" | "REJECTED",
  rejectionReason?: string,
): Promise<{ success: boolean; message: string }> => {
  return apiClient.post<{ success: boolean; message: string }>("/admin/kyc/verify", {
    submissionId,
    status,
    rejectionReason,
  })
}

export const listPendingKYCSubmissions = async (
  page = 1,
  limit = 10,
  status = "PENDING",
): Promise<PaginatedKYCSubmissions> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    status,
  })

  return apiClient.get<PaginatedKYCSubmissions>(`/admin/kyc/list?${params.toString()}`)
}

// Types for the API responses
export interface KYCStatusResponse {
  status: KYCStatus
  documents: KYCDocument[]
}

export interface KYCSubmitResponse {
  status: KYCStatus
  referenceId: string
}

export interface KYCDocumentResponse {
  success: boolean
  message: string
  document?: KYCDocument
}

export interface KYCVerificationResponse {
  success: boolean
  message: string
}

// Error handling types
export interface KYCError {
  code: string
  message: string
  status?: number
}

