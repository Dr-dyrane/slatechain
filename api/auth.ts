export const registerUser = async (userData: any) => {
	await new Promise((resolve) => setTimeout(resolve, 1000));

	// Save userId in localStorage
	localStorage.setItem("userId", "1");
	return {
		id: "1",
		token: "mock-jwt-token",
		...userData,
	};
};

export const loginUser = async (credentials: {
	email: string;
	password: string;
}) => {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	if (
		credentials.email === "test@example.com" &&
		credentials.password === "password"
	) {
		// Save userId in localStorage
		localStorage.setItem("userId", "1");
		return {
			id: "1",
			name: "John Doe",
			email: credentials.email,
			role: "admin",
			token: "mock-jwt-token",
		};
	}
	throw new Error("Invalid email or password.");
};

export const uploadDocument = async (
	file: File,
	userId: string,
	documentType: string
) => {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	console.log(`Uploading ${documentType} for user ${userId}: ${file.name}`);
	return { success: true, message: `${documentType} uploaded successfully.` };
};
