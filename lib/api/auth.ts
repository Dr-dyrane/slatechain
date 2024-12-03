// lib/api/auth.ts
import apiClient from "@/lib/api/apiClient"; // Import apiClient

// Register user function
export const registerUser = async (userData: any) => {
	const endpoint = "/register"; // The backend API endpoint for registration
	const method = "POST";
	const response = await apiClient(endpoint, method, userData); // Use apiClient to make the request
	// Simulating the storage of userId in localStorage after registration
	localStorage.setItem("userId", response.id);
	return response; // Return mock data as the response
};

// Login user function
export const loginUser = async (credentials: {
	email: string;
	password: string;
}) => {
	const endpoint = "/login"; // The backend API endpoint for login
	const method = "POST";
	const response = await apiClient(endpoint, method, credentials); // Use apiClient to make the request
	// Simulating the storage of userId in localStorage after login
	localStorage.setItem("userId", response.id);
	return response; // Return mock data as the response
};

// Upload document function
export const uploadDocument = async (
	file: File,
	userId: string,
	documentType: string
) => {
	const endpoint = "/upload"; // The backend API endpoint for file upload
	const method = "POST";
	const body = { userId, documentType, file }; // Construct request body
	const response = await apiClient(endpoint, method, body); // Use apiClient to make the request
	return response; // Return mock data as the response
};
