---

### **User Authentication and Onboarding Model Documentation**

---

### **User Authentication Details**

1. **User Authentication Data**:  
   The `User` model includes authentication details such as `passwordHash`, `passwordSalt`, and token management (`authenticationToken`, `refreshToken`). These fields store critical information for secure authentication and are essential for both CRUD operations and user session management.

2. **User CRUD Permissions (Role-Based Access Control)**:  
   Each user role (e.g., `ADMIN`, `SUPPLIER`, `CUSTOMER`) has associated CRUD permissions (create, read, update, delete). These permissions will be enforced through the backend API, ensuring that only authorized users can perform the actions they are permitted to.

3. **Password Management & Security**:  
   Passwords are securely hashed using algorithms like bcrypt. The `passwordHash` and `passwordSalt` fields store the encrypted version of the password, and password validation is done through a secure process to ensure the integrity of user authentication.

4. **Authentication Token Management**:  
   After successful login, a JWT token is issued (`authenticationToken`), allowing stateless operations for secure routes. The `refreshToken` is used for long-term authentication, which can be used to refresh expired tokens.

5. **Onboarding & KYC Status**:  
   User onboarding involves verifying KYC status and tracking the progress. These details are also stored in the model to ensure seamless verification and monitoring throughout the user's lifecycle.

---

### **Updated Data Model Relationships and Handling**:

---

#### **User Authentication Model**

```typescript
interface User {
  userId: UUID;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  passwordHash: string;  // Hashed password for authentication
  passwordSalt: string;  // Salt used for password hashing (if needed)
  role: RoleType;  // User role to define CRUD permissions
  kycStatus: KYCStatus;  // KYC status (PENDING, APPROVED, REJECTED)
  onboardingStatus: OnboardingStatus;  // Onboarding progress
  companyDetails?: CompanyDetails;  // For roles like SUPPLIER
  createdAt: ISO8601DateTime;  // Account creation timestamp
  updatedAt: ISO8601DateTime;  // Last update timestamp
  lastLoginAt: ISO8601DateTime;  // Last login time

  // Authentication-specific data
  authenticationToken?: string;  // JWT Token (stored temporarily in session/cookies)
  refreshToken?: string;  // Refresh token for long-term authentication
  isEmailVerified: boolean;  // To track if the user has verified their email
  isPhoneVerified: boolean;  // To track if the user has verified their phone number
}
```

---

#### **Role-Based CRUD Permissions (RBAC)**

```typescript
interface RolePermissions {
  role: RoleType;
  canCreate: boolean;  // Can create new records
  canRead: boolean;  // Can view records
  canUpdate: boolean;  // Can edit/update records
  canDelete: boolean;  // Can delete records
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
    canDelete: false,  // Managers can't delete records
  },
  {
    role: RoleType.SUPPLIER,
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: false,  // Suppliers can manage their products but not delete users
  },
  {
    role: RoleType.CUSTOMER,
    canCreate: false,
    canRead: true,
    canUpdate: true,  // Customers can update their profile
    canDelete: false,
  },
];
```

---

#### **Password Hashing & Validation (Backend Logic)**

```typescript
import bcrypt from 'bcryptjs';

// Hash password for secure storage
async function hashPassword(password: string): Promise<{ passwordHash: string, passwordSalt: string }> {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  return { passwordHash, passwordSalt: salt };
}

// Validate entered password against stored hash
async function validatePassword(password: string, hashedPassword: string, salt: string): Promise<boolean> {
  const isValid = await bcrypt.compare(password, hashedPassword);
  return isValid;
}
```

---

#### **JWT Authentication Flow**

1. **Login Flow:**
   - After successful login, the backend generates and returns the JWT token (`authenticationToken`) along with a `refreshToken`.
   - These tokens will be stored temporarily on the client-side (in session/cookies).

```typescript
import jwt from 'jsonwebtoken';

// Generate authentication token
function generateAuthToken(user: User): string {
  const payload = {
    userId: user.userId,
    role: user.role,
  };
  const secretKey = process.env.JWT_SECRET_KEY || 'secret';
  const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
  return token;
}

// Refresh token logic
function generateRefreshToken(user: User): string {
  const payload = {
    userId: user.userId,
  };
  const secretKey = process.env.JWT_SECRET_KEY || 'secret';
  const refreshToken = jwt.sign(payload, secretKey, { expiresIn: '7d' });  // Refresh token expires in 7 days
  return refreshToken;
}
```

2. **Token Expiration Handling:**
   - When the `authenticationToken` expires, a request is made with the `refreshToken` to obtain a new token.

---

#### **Onboarding & KYC Verification Process**

1. **Onboarding Steps**:
   - The onboarding process is tracked with a status of `PENDING`, `IN_PROGRESS`, or `COMPLETED`.
   - Each step may require KYC verification before moving to the next step.

2. **KYC Verification**:
   - User uploads documents for KYC verification (e.g., ID card, utility bill).
   - The KYC status is tracked as `PENDING`, `APPROVED`, or `REJECTED`.

```typescript
interface KYCStatus {
  userId: UUID;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';  // Track KYC status
  documents: KYCDocument[];
  remarks?: string;  // Optional remarks from the verification team
}

interface KYCDocument {
  documentId: UUID;
  userId: UUID;
  documentType: string;  // Type of document (e.g., ID card, utility bill)
  documentUrl: string;  // URL to the uploaded document
  status: 'PENDING' | 'APPROVED' | 'REJECTED';  // Status of the document
  uploadedAt: ISO8601DateTime;
}
```

---

### Complete Data Model Summary:

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
  onboardingStatus: OnboardingStatus;
  companyDetails?: CompanyDetails;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
  lastLoginAt: ISO8601DateTime;
  authenticationToken?: string;
  refreshToken?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

interface RolePermissions {
  role: RoleType;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

interface KYCStatus {
  userId: UUID;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  documents: KYCDocument[];
  remarks?: string;
}

interface KYCDocument {
  documentId: UUID;
  userId: UUID;
  documentType: string;
  documentUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  uploadedAt: ISO8601DateTime;
}

interface CompanyDetails {
  companyName: string;
  businessType: string;
  employeeCount: number;
  productTypes: string[];
  paymentMethod: string;
  teamOversight: string;
  registrationNumber?: string;
  businessLicense?: string;
}

interface OnboardingStep {
  stepId: UUID;
  type: OnboardingStepType;
  userId: UUID;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  timestamp?: ISO8601DateTime;
  requiresKYC: boolean;
  additionalData?: Record<string, any>;
}
```

---

### **How Data is Handled and Passed to Backend**

- **Authentication**: On the front end, the login process will store `authenticationToken` and `refreshToken` in the session/cookies. The backend will validate the user credentials, generate tokens, and return them.
- **Role Permissions**: The backend enforces role-based permissions during CRUD operations to ensure users can only perform actions allowed by their role.
- **Token Management**: The frontend uses the authentication token for secure routes and refresh tokens for long-term authentication. The backend provides a way to

 refresh the token when it expires.

---