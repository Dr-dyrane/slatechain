import { apiClient } from "./apiClient";
import { KYCStatus } from "@/lib/types/user";

export const fetchKYCStatus = async (): Promise<KYCStatus> => {
	return apiClient.get<KYCStatus>("/kyc/status");
};

export const startKYCProcess = async (): Promise<KYCStatus> => {
	return apiClient.post<KYCStatus>("/kyc/start");
};

export const uploadKYCDocument = async (
	documentType: string,
	file: File
): Promise<{ documentId: string; status: string; documentUrl: string }> => {
	const formData = new FormData();
	formData.append("type", documentType);
	formData.append("document", file);
	return apiClient.post<{
		documentId: string;
		status: string;
		documentUrl: string;
	}>("/kyc/documents", formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
};
