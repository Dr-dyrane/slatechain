### **User Authentication Model with Onboarding Changes**

To reflect the new structure where onboarding-related fields are separated into a dedicated **Onboarding** table, and to include the new `onboardingId` foreign key in the **User** table, here’s the updated data model:

---

### **User Authentication Model**

```typescript
interface User {
	userId: UUID; // Unique user identifier
	firstName: string; // User's first name
	lastName: string; // User's last name
	email: string; // User's email address
	phoneNumber: string; // User's phone number
	passwordHash: string; // Hashed password for authentication
	passwordSalt: string; // Salt used for password hashing
	role: RoleType; // User's role (e.g., ADMIN, SUPPLIER, CUSTOMER)
	kycStatus: KYCStatus; // KYC status (PENDING, APPROVED, REJECTED)
	createdAt: ISO8601DateTime; // Account creation timestamp
	updatedAt: ISO8601DateTime; // Last update timestamp
	lastLoginAt: ISO8601DateTime; // Last login time
	authenticationToken?: string; // JWT Token (stored temporarily in session/cookies)
	refreshToken?: string; // Refresh token for long-term authentication
	isEmailVerified: boolean; // To track if the user has verified their email
	isPhoneVerified: boolean; // To track if the user has verified their phone number
	onboardingId: UUID; // Foreign key reference to the Onboarding table
	onboardingStatus: "IN_PROGRESS" | "COMPLETED" | "PENDING"; // User's onboarding status
}
```

### **Onboarding Model (New Table)**

```typescript
interface Onboarding {
	onboardingId: UUID; // Unique onboarding identifier
	userId: UUID; // Reference to the user (foreign key from User table)
	preferences: Record<string, any>; // User preferences (e.g., language, notifications)
	companyDetails?: CompanyDetails; // Details specific to the user's company (e.g., for SUPPLIERS)
	roleSpecificData: RoleSpecificData; // Role-specific data (e.g., for SUPPLIERS, specific business data)
	documents: KYCDocument[]; // KYC documents uploaded by the user
	status: "PENDING" | "IN_PROGRESS" | "COMPLETED"; // Onboarding status
	createdAt: ISO8601DateTime; // Onboarding creation timestamp
	updatedAt: ISO8601DateTime; // Last update timestamp of onboarding
}

interface CompanyDetails {
	companyName: string; // Name of the company (if applicable)
	businessType: string; // Type of business (if applicable)
	employeeCount: number; // Number of employees (if applicable)
	productTypes: string[]; // Types of products offered (if applicable)
	paymentMethod: string; // Payment methods accepted (if applicable)
	registrationNumber?: string; // Optional: Business registration number
	businessLicense?: string; // Optional: Business license number
}

interface RoleSpecificData {
	supplierData?: SupplierData; // For SUPPLIERS: Data related to supplier's offerings
	customerData?: CustomerData; // For CUSTOMERS: Data related to customer preferences
}

interface SupplierData {
	storeName: string; // Name of the store (for SUPPLIERS)
	productCategories: string[]; // Categories of products offered
	paymentMethodsAccepted: string[]; // List of accepted payment methods
}

interface CustomerData {
	preferredCategories: string[]; // Preferred product categories for customers
	preferredPaymentMethods: string[]; // Preferred payment methods for customers
}

interface KYCDocument {
	documentId: UUID; // Unique document identifier
	userId: UUID; // Reference to the user
	documentType: string; // Type of document (e.g., ID card, utility bill)
	documentUrl: string; // URL to the uploaded document
	status: "PENDING" | "APPROVED" | "REJECTED"; // Status of the document
	uploadedAt: ISO8601DateTime; // Timestamp when the document was uploaded
}
```

---

### **Role-Based CRUD Permissions (RBAC)**

```typescript
interface RolePermissions {
	role: RoleType;
	canCreate: boolean; // Can create new records
	canRead: boolean; // Can view records
	canUpdate: boolean; // Can edit/update records
	canDelete: boolean; // Can delete records
}

const rolePermissions: RolePermissions[] = [
	{
		role: RoleType.ADMIN,
		canCreate: true,
		canRead: true,
		canUpdate: true,
		canDelete: true,
	},
	{
		role: RoleType.MANAGER,
		canCreate: true,
		canRead: true,
		canUpdate: true,
		canDelete: false, // Managers can't delete records
	},
	{
		role: RoleType.SUPPLIER,
		canCreate: true,
		canRead: true,
		canUpdate: true,
		canDelete: false, // Suppliers can manage their products but not delete users
	},
	{
		role: RoleType.CUSTOMER,
		canCreate: false,
		canRead: true,
		canUpdate: true, // Customers can update their profile
		canDelete: false,
	},
];
```

---

### **Key Changes and Their Impact**:

1. **Onboarding Fields Moved**:

   - Fields like `preferences`, `companyDetails`, and `roleSpecificData` have been moved from the **User** table to a separate **Onboarding** table. This separation allows for better scalability, as onboarding data can now grow independently from user details.

2. **Foreign Key Reference (onboardingId)**:

   - The `onboardingId` field in the **User** table references the **Onboarding** table, linking users to their onboarding data. This enables better data organization and avoids cluttering the **User** table with unnecessary fields.

3. **Onboarding Status**:
   - The **User** table now directly stores `onboardingStatus` to track the user's progress in the onboarding process. The status can be one of `IN_PROGRESS`, `COMPLETED`, or `PENDING`.

---

### **Password Hashing & Validation (Backend Logic)**

The password hashing and validation logic remains the same as in the previous model:

```typescript
import bcrypt from "bcryptjs";

// Hash password for secure storage
async function hashPassword(
	password: string
): Promise<{ passwordHash: string; passwordSalt: string }> {
	const salt = await bcrypt.genSalt(10);
	const passwordHash = await bcrypt.hash(password, salt);
	return { passwordHash, passwordSalt: salt };
}

// Validate entered password against stored hash
async function validatePassword(
	password: string,
	hashedPassword: string,
	salt: string
): Promise<boolean> {
	const isValid = await bcrypt.compare(password, hashedPassword);
	return isValid;
}
```

---

### **JWT Authentication Flow**

The authentication flow (using JWT tokens) also remains unchanged, as the focus is primarily on the onboarding fields being moved to a new table, with `onboardingId` as the key link.

```typescript
import jwt from "jsonwebtoken";

// Generate authentication token
function generateAuthToken(user: User): string {
	const payload = {
		userId: user.userId,
		role: user.role,
	};
	const secretKey = process.env.JWT_SECRET_KEY || "secret";
	const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });
	return token;
}

// Refresh token logic
function generateRefreshToken(user: User): string {
	const payload = {
		userId: user.userId,
	};
	const secretKey = process.env.JWT_SECRET_KEY || "secret";
	const refreshToken = jwt.sign(payload, secretKey, { expiresIn: "7d" }); // Refresh token expires in 7 days
	return refreshToken;
}
```

---

### **Data Model Summary After Changes**

```typescript
interface User {
	userId: UUID;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	passwordHash: string;
	passwordSalt: string;
	role: RoleType;
	kycStatus: KYCStatus;
	createdAt: ISO8601DateTime;
	updatedAt: ISO8601DateTime;
	lastLoginAt: ISO8601DateTime;
	authenticationToken?: string;
	refreshToken?: string;
	isEmailVerified: boolean;
	isPhoneVerified: boolean;
	onboardingId: UUID;
	onboardingStatus: "IN_PROGRESS" | "COMPLETED" | "PENDING";
}

interface Onboarding {
	onboardingId: UUID;
	userId: UUID;
	preferences: Record<string, any>;
	companyDetails?: CompanyDetails;
	roleSpecificData: RoleSpecificData;
	documents: KYCDocument[];
	status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
	createdAt: ISO8601DateTime;
	updatedAt: ISO8601DateTime;
}

interface CompanyDetails {
	companyName: string;
	businessType: string;
	employeeCount: number;
	productTypes: string[];
	paymentMethod: string;
	registrationNumber?: string;
	businessLicense?: string;
}

interface RoleSpecificData {
	supplierData?: SupplierData;
	customerData?: Customer;

	Data;
}

interface SupplierData {
	storeName: string;
	productCategories: string[];
	paymentMethodsAccepted: string[];
}

interface CustomerData {
	preferredCategories: string[];
	preferredPaymentMethods: string[];
}

interface KYCDocument {
	documentId: UUID;
	userId: UUID;
	documentType: string;
	documentUrl: string;
	status: "PENDING" | "APPROVED" | "REJECTED";
	uploadedAt: ISO8601DateTime;
}
```
