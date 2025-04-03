---

### **Login Flow**

#### **1. User Enters Credentials**
- **Username/Email/Phone Number**: The user enters their registered **username**, **email**, or **phone number** (based on your app's configuration).
- **Password**: The user enters their password.

#### **2. Authentication Request**
- The credentials are sent to the backend API for authentication.
  - **Backend validates the user credentials** (email/phone + password combination).
  - If valid, a **JWT token** is generated and sent back as the response.
  - **Token**: The token is used to authenticate further API calls.
  - If invalid, an error message is returned (e.g., "Invalid credentials").

#### **3. Verification (Optional: 2FA)**
- If Two-Factor Authentication (2FA) is enabled, the user is prompted to enter a **verification code** sent to their **email** or **phone number**.
- Once 2FA is successfully completed, the user is authenticated.

#### **4. Redirect or Dashboard Access**
- Upon successful login, the user is redirected to their appropriate dashboard based on their **role**:
  - **Customer**: Customer dashboard.
  - **Manager**: Manager dashboard.
  - **Supplier**: Supplier dashboard.
  - **Admin**: Admin dashboard.

#### **5. Token Storage**
- After successful login, the backend response includes a **JWT token** and possibly a **refresh token**.
- These tokens are stored locally (usually in **cookies** or **localStorage**) for maintaining the session.

#### **6. Session Expiry (Optional)**
- **Token Expiry**: If the token expires, the user needs to be redirected to the login page.
  - **Refresh Token**: If using a refresh token, an automatic request can be made to refresh the session without requiring the user to log in again.

#### **7. Error Handling**
- If there is an authentication error (e.g., incorrect password, expired token, etc.), the user will be notified and prompted to retry.
- If the login is successful, the app provides access to the appropriate resources.

---

### **Simplified Steps:**

1. **User enters login details (email/phone and password)**.
2. **Backend checks credentials and generates a token**.
3. If enabled, **2FA verification is requested**.
4. **Redirect to the appropriate dashboard** based on the user role.
5. **Tokens are stored** for maintaining session state.
6. Handle **session expiration** via a refresh mechanism (optional).

---

### **Key Points:**

- **Role-Based Access**: After logging in, the system checks the user's role and determines what dashboard or section to display.
- **Security**: You can implement additional layers like 2FA, especially for **admins** or **managers**, to enhance security.
- **Session Management**: Tokens are used to maintain the user session, with the option to refresh the token when it expires.

Overall, the **login flow** is straightforward compared to registration but can have additional complexities like 2FA or session expiration handling based on security needs.

Based on the provided code and your question, I'll help you update the authentication process for Google login and create an API document for the backend. Let's start by addressing your questions and then move on to the API documentation.

1. Implementing Google Login:
   You don't need to implement a separate `auth/googleLogin` in your `auth` API call with `apiClient`. The Google login is already handled by NextAuth in your `route.ts` file. However, you need to update your `authSlice.ts` to handle the Google login response correctly.

Update your `googleLogin` thunk in `authSlice.ts`:

```typescriptreact project="SupplyCycles"
...
```

2. Backend API Document:
   Let's create an API document for the Google login process and update the user schema if needed.

### Google Login

#### Endpoint: `POST /api/auth/callback/google`

This endpoint is handled by NextAuth and is called after successful Google authentication.

#### Request

No request body is required. The Google authentication data is handled by NextAuth.

#### Response

```json
{
	"user": {
		"id": "string",
		"firstName": "string",
		"lastName": "string",
		"name": "string",
		"email": "string",
		"phoneNumber": "string",
		"role": "enum(UserRole)",
		"isEmailVerified": "boolean",
		"isPhoneVerified": "boolean",
		"kycStatus": "enum(KYCStatus)",
		"onboardingStatus": "enum(OnboardingStatus)",
		"avatarUrl": "string"
	},
	"accessToken": "string",
	"refreshToken": "string"
}
```

### Get Current User

#### Endpoint: `GET /api/auth/me`

Retrieves the current authenticated user's data.

#### Request

Headers:

- Authorization: Bearer accessToken

#### Response

```json
{
	"user": {
		"id": "string",
		"firstName": "string",
		"lastName": "string",
		"name": "string",
		"email": "string",
		"phoneNumber": "string",
		"role": "enum(UserRole)",
		"isEmailVerified": "boolean",
		"isPhoneVerified": "boolean",
		"kycStatus": "enum(KYCStatus)",
		"onboardingStatus": "enum(OnboardingStatus)",
		"avatarUrl": "string"
	},
	"accessToken": "string",
	"refreshToken": "string"
}
```

## User Schema

```typescript
interface User {
	id: string;
	firstName: string;
	lastName: string;
	name: string;
	email: string;
	phoneNumber: string;
	role: UserRole;
	isEmailVerified: boolean;
	isPhoneVerified: boolean;
	kycStatus: KYCStatus;
	onboardingStatus: OnboardingStatus;
	avatarUrl?: string;
	googleId?: string; // Add this field to link Google accounts
}

enum UserRole {
	ADMIN = "admin",
	SUPPLIER = "supplier",
	MANAGER = "manager",
	CUSTOMER = "customer",
}

enum KYCStatus {
	NOT_STARTED = "NOT_STARTED",
	IN_PROGRESS = "IN_PROGRESS",
	PENDING_REVIEW = "PENDING_REVIEW",
	APPROVED = "APPROVED",
	REJECTED = "REJECTED",
}

enum OnboardingStatus {
	PENDING = "PENDING",
	NOT_STARTED = "NOT_STARTED",
	IN_PROGRESS = "IN_PROGRESS",
	COMPLETED = "COMPLETED",
}
```

This API documentation covers the Google login process and the user schema. The backend should implement these endpoints and update the user schema to include a `googleId` field for linking Google accounts.

To implement this on the backend:

1. Create a new endpoint `/api/auth/me` that returns the current user's data.
2. Update your user model to include the `googleId` field.
3. In your Google authentication handler, check if a user with the given Google ID exists. If not, create a new user with the data from Google. If a user exists, update their information if necessary.

Remember to handle token generation and refreshing on the backend as well. The `accessToken` and `refreshToken` should be generated by your backend after successful Google authentication and returned to the frontend.
