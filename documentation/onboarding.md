---

### **Onboarding Process Overview**
The **onboarding process** consists of a series of steps, where users select their role early in the registration process. The flow is dynamic, changing based on whether the user is an **Admin**, **Manager**, **Supplier**, or **Customer**. 

Each role has specific steps to complete, and the registration flow adjusts to the user’s role.

---

### **Roles**
Here are the updated roles that the users can select during registration:

- **Admin**: Manages the platform, users, and overall business settings.
- **Manager**: Oversees specific operational tasks or areas of the platform.
- **Supplier**: Provides goods or services on the platform, adds products, manages orders, etc.
- **Customer**: End-users who purchase products/services from suppliers.

---

### **Onboarding Steps for Each Role**

#### **1. Admin Onboarding Steps**:

- **Step 1: Profile Setup**: 
  - Enter basic information like name, business details, contact information.
  
- **Step 2: Business Setup**: 
  - Admins configure platform-wide business settings like payment methods, platform policies, etc.
  
- **Step 3: User Management**: 
  - Admin assigns roles (Manager, Supplier, Customer) to other users.

- **Step 4: KYC Verification**: 
  - Submit documents (e.g., business registration) for verification.

- **Step 5: Confirmation and Activation**:
  - Finalize setup and ensure all configurations are completed.

#### **2. Manager Onboarding Steps**:

- **Step 1: Profile Setup**: 
  - Enter basic information like name, company details.

- **Step 2: Operational Setup**: 
  - Managers configure specific operational settings (inventory, logistics, etc.).

- **Step 3: KYC Verification**: 
  - Provide identity verification documents for approval.

- **Step 4: Confirmation**: 
  - Complete final checks for approval by the Admin.

#### **3. Supplier Onboarding Steps**:

- **Step 1: Profile Setup**: 
  - Enter basic business information, contact info, etc.
  
- **Step 2: Product Setup**: 
  - Add product catalog to the platform (name, price, description).

- **Step 3: Payment Method Setup**: 
  - Add business bank account or payment method details.

- **Step 4: KYC Verification**: 
  - Upload identification documents for verification (business and personal).

- **Step 5: Confirmation**: 
  - Final check to complete registration.

#### **4. Customer Onboarding Steps**:

- **Step 1: Profile Setup**: 
  - Enter personal details like name, contact information, etc.
  
- **Step 2: Payment Method Setup**: 
  - Add a payment method (e.g., credit card, wallet, etc.).

- **Step 3: Preferences**: 
  - Set preferences for communication and notifications.

- **Step 4: KYC Verification** (if required for certain products/services): 
  - Upload identity verification documents.

- **Step 5: Confirmation**: 
  - Final check to complete the onboarding process.

---

### **User Registration Flow**

Below is the **complete registration flow**, including role selection, form submission, and the dynamic onboarding process based on the user’s role.

#### **1. Role Selection During Registration**
At the beginning of the registration process, the user is asked to choose their role. This will determine the subsequent steps in their onboarding journey.

```typescript
interface RegistrationForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: RoleType;  // User selects their role here
  agreeToTerms: boolean;
}

type RoleType = 'ADMIN' | 'MANAGER' | 'SUPPLIER' | 'CUSTOMER';
```

- **Role Choices**: The user selects one of the roles (**Admin**, **Manager**, **Supplier**, **Customer**).
- After the user selects their role, the system dynamically adjusts the onboarding process.

---

#### **2. Role-Specific Onboarding Steps**
Once the user completes the registration form, they are guided through **role-specific steps** based on the role they selected during registration. 

Each role’s onboarding steps are predefined. Here’s a simplified outline of how the flow works for each role:

##### **For Admin**:
1. **Step 1**: Profile Setup
   - Capture name, business details, etc.
2. **Step 2**: Business Setup
   - Set up payment methods, business rules, policies.
3. **Step 3**: User Management
   - Assign roles to others: Managers, Suppliers, Customers.
4. **Step 4**: KYC Verification
   - Submit KYC documents.
5. **Step 5**: Confirmation
   - Review and activate account.

##### **For Manager**:
1. **Step 1**: Profile Setup
   - Add personal details.
2. **Step 2**: Operational Setup
   - Configure operational settings.
3. **Step 3**: KYC Verification
   - Submit identity documents.
4. **Step 4**: Confirmation
   - Admin review and approval.

##### **For Supplier**:
1. **Step 1**: Profile Setup
   - Enter business details.
2. **Step 2**: Product Setup
   - Add product listings, pricing, and details.
3. **Step 3**: Payment Method Setup
   - Configure business payment methods.
4. **Step 4**: KYC Verification
   - Upload necessary documents for identity verification.
5. **Step 5**: Confirmation
   - Ensure everything is complete and ready for activation.

##### **For Customer**:
1. **Step 1**: Profile Setup
   - Provide personal details.
2. **Step 2**: Payment Method Setup
   - Add a payment method for purchases.
3. **Step 3**: Preferences
   - Choose communication preferences.
4. **Step 4**: KYC Verification (if applicable)
   - Upload verification documents (if necessary for high-value transactions or purchases).
5. **Step 5**: Confirmation
   - Complete the onboarding process.

---

#### **3. Role Selection and Onboarding Sequence**

Here’s how the registration and onboarding flow looks in a structured sequence:

1. **Step 1**: **Registration Form**
   - The user fills out the registration form with details like name, phone number, email, password, and selects a role.
   
2. **Step 2**: **Onboarding Steps** (Role-Based)
   - After registration, the system identifies the user’s role and displays the appropriate onboarding steps based on the role they selected.
   - Admins see steps like **Business Setup**, **User Management**, etc.
   - Managers get steps like **Operational Setup**, etc.
   - Suppliers add **Product Catalog**, set up **Payment Methods**, etc.
   - Customers are guided to **Payment Setup**, **Preferences**, etc.
   
3. **Step 3**: **KYC Verification**
   - If required, users are asked to upload identification documents for **KYC** verification.
   - This step may be **PENDING**, **IN_PROGRESS**, or **COMPLETED** based on the user's action and verification status.
   
4. **Step 4**: **Confirmation & Activation**
   - After completing the necessary steps (including KYC), the system confirms completion and activates the user’s account.
   - The user is granted access to the platform based on their role.

---

### **KYC Verification Flow**

1. **KYC Document Submission**:
   - Users upload their **KYC documents** (e.g., personal ID, business registration, etc.).

2. **Admin or System Approval**:
   - The system (or admin) reviews the submitted documents.
   - The **KYC status** can be: 
     - `PENDING` (awaiting approval)
     - `APPROVED`
     - `REJECTED` (if documents are invalid or incorrect)

3. **KYC Approval/Denial**:
   - If documents are approved, users move to the next step (activation).
   - If rejected, the user is informed to re-submit valid documents.

---

### **Final User Activation**

After all steps, including KYC verification, the user account is activated, and they can fully access the platform’s features based on their role. 

---

### **User Registration Summary**

1. **User Chooses Role**: During registration, the user selects one of the following roles: **Admin**, **Manager**, **Supplier**, or **Customer**.
   
2. **Role-Specific Onboarding**: Based on the role, the user is shown a series of onboarding steps tailored to their role.
   
3. **KYC Verification**: If required, users will submit documents for KYC verification. This is handled by the system or admin for approval.
   
4. **Final Activation**: After completing the necessary steps and getting KYC approval, the user’s account is activated, and they can access platform features according to their role.

---