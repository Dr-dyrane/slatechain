// lib/api/apiClient.ts
const apiUrl = process.env.NEXT_PUBLIC_API_URL; // Backend URL from environment variable

const apiClient = async (endpoint: string, method: string = "GET", body?: any) => {
  const url = `${apiUrl}${endpoint}`; // Construct full API URL

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : null,
  };

  // Simulate a delay to mimic an API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock responses for the new endpoints
  if (endpoint === "/progress" && method === "GET") {
    // Simulate fetching user progress
    return {
      currentStep: 1, // Example: User is on step 2
      completedSteps: [0, 1], // Steps 0 and 1 completed
    };
  }

  if (endpoint === "/save-progress" && method === "POST") {
    // Simulate saving step progress
    return { success: true, message: "Step progress saved." };
  }

  if (endpoint === "/complete-onboarding" && method === "POST") {
    // Simulate completing onboarding
    return { success: true, message: "Onboarding completed." };
  }

  // Handle registration, login, and file upload as before
  if (endpoint === "/register" && method === "POST") {
    return {
      id: "1",
      token: "mock-jwt-token",
      ...body,
    };
  }

  if (endpoint === "/login" && method === "POST") {
    if (body.email === "test@example.com" && body.password === "password") {
      return {
        id: "1",
        name: "John Doe",
        email: body.email,
        role: "admin",
        token: "mock-jwt-token",
      };
    } else {
      throw new Error("Invalid email or password.");
    }
  }

  if (endpoint === "/upload" && method === "POST") {
    return { success: true, message: `${body.documentType} uploaded successfully.` };
  }

  throw new Error("Endpoint not found.");
};

export default apiClient;
