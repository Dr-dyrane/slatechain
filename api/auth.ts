// Simulated API calls for authentication and registration

export const registerUser = async (userData: any) => {
	// Simulate API call
	await new Promise((resolve) => setTimeout(resolve, 1000));
	// In a real app, you would make an API call here
	return { id: "1", ...userData };
};

export const loginUser = async (credentials: {
	email: string;
	password: string;
}) => {
	// Simulate API call
	await new Promise((resolve) => setTimeout(resolve, 1000));
	// In a real app, you would make an API call here
	return { id: "1", name: "John Doe", email: credentials.email, role: "admin" };
};

export const uploadDocument = async (
	file: File,
	userId: string,
	documentType: string
) => {
	// Simulate file upload
	await new Promise((resolve) => setTimeout(resolve, 1000));
	// In a real app, you would upload the file to a server
	console.log(`Uploading ${documentType} for user ${userId}: ${file.name}`);
	return { success: true, message: "Document uploaded successfully" };
};
