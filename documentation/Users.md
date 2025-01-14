# User Management API Documentation

This document outlines the API endpoints related to the user management system. It provides details on the request methods, request bodies, response formats, and expected behavior for each endpoint.

## Base URL

All endpoints are relative to the base URL (example):

```
https://your-api-base-url/api/v1
```

## Endpoints

### 1. Get All Users (Admin Only)

*   **Endpoint:** `/users`
*   **Method:** `GET`
*   **Description:** Retrieves a list of all users in the system. Only accessible to Admin users.
*   **Request Body:** None
*   **Response (200 OK):**
    ```json
     [
       {
         "id": "user-123",
         "firstName": "John",
         "lastName": "Doe",
          "name": "John Doe",
          "email": "john@example.com",
          "phoneNumber": "+1234567890",
           "role": "customer",
           "isEmailVerified": true,
            "isPhoneVerified": false,
            "kycStatus": "PENDING_REVIEW",
            "onboardingStatus": "IN_PROGRESS",
           "avatarUrl": "https://example.com/avatar.jpg"
        },
       {
         "id": "user-456",
         "firstName": "Jane",
         "lastName": "Smith",
         "name": "Jane Smith",
          "email": "janesmith@example.com",
          "phoneNumber": "123-456-7891",
          "role": "admin",
          "isEmailVerified": true,
           "isPhoneVerified": true,
          "kycStatus": "APPROVED",
            "onboardingStatus": "COMPLETED",
            "avatarUrl": "https://example.com/avatar.jpg"
        }
     ]
    ```

    *   `id`: Unique identifier for the user (string).
    *   `firstName`: First name of the user (String).
    *  `lastName`: Last Name of the user (String).
    *   `name`: Full name of the user (String).
    *   `email`: Email address of the user (String).
    *   `phoneNumber`: Phone number of the user (String).
    *   `role`:  User's role (`admin`, `supplier`, `manager`, `customer`).
    *   `isEmailVerified`: Email verification status (boolean).
    *    `isPhoneVerified`: Phone verification status (boolean).
    *   `kycStatus`: KYC verification status (String from `KYCStatus` enum).
    *  `onboardingStatus`: Onboarding process status (String from `OnboardingStatus` enum).
     *  `avatarUrl`: URL of the user avatar (String, Optional).

*   **Error Responses:**
    *   **403 Forbidden:** If the user does not have admin access
    *   **404 Not Found:** If no users are found.
    *   **500 Internal Server Error:** For other server-related errors.

### 2. Add New User (Admin Only)

*   **Endpoint:** `/users`
*   **Method:** `POST`
*   **Description:** Creates a new user in the system. Only accessible to Admin users.
*   **Request Body:**
    ```json
    {
      "firstName": "New",
      "lastName": "User",
      "email": "newuser@example.com",
       "phoneNumber": "+1234567890",
        "role": "customer",
        "isEmailVerified": false,
        "isPhoneVerified": false,
        "kycStatus": "NOT_STARTED",
      "onboardingStatus": "NOT_STARTED",
       "avatarUrl": "https://example.com/newavatar.jpg"
    }
    ```
    *  All fields are required except for avatarUrl

*   **Response (201 Created):**
    ```json
     {
        "id": "user-new",
         "firstName": "New",
        "lastName": "User",
        "name": "New User",
       "email": "newuser@example.com",
        "phoneNumber": "+1234567890",
       "role": "customer",
       "isEmailVerified": false,
       "isPhoneVerified": false,
       "kycStatus": "NOT_STARTED",
       "onboardingStatus": "NOT_STARTED",
        "avatarUrl": "https://example.com/newavatar.jpg"
      }
    ```
    * Returns the newly created user with generated id

*   **Error Responses:**
    *  **403 Forbidden:** If the user does not have admin access
    *   **400 Bad Request:** If the request body is invalid or missing required fields.
    *   **500 Internal Server Error:** For other server-related errors.

### 3. Update Existing User (Admin Only)

*   **Endpoint:** `/users/:id`
*   **Method:** `PUT`
*   **Description:** Updates an existing user identified by `id`. Only accessible to Admin users.
*  **Request Body:**

    ```json
    {
      "id": "user-123",
       "firstName": "Updated",
       "lastName": "User",
        "name": "Updated User",
       "email": "updateduser@example.com",
       "phoneNumber": "+1234567890",
        "role": "customer",
        "isEmailVerified": false,
       "isPhoneVerified": false,
       "kycStatus": "NOT_STARTED",
        "onboardingStatus": "NOT_STARTED",
        "avatarUrl": "https://example.com/updatedavatar.jpg"
    }
    ```
    * All fields are required
    * `id` in the body should match with the `:id` path parameter
*   **Response (200 OK):**
    ```json
      {
        "id": "user-123",
        "firstName": "Updated",
        "lastName": "User",
        "name": "Updated User",
        "email": "updateduser@example.com",
        "phoneNumber": "+1234567890",
         "role": "customer",
        "isEmailVerified": false,
        "isPhoneVerified": false,
       "kycStatus": "NOT_STARTED",
        "onboardingStatus": "NOT_STARTED",
       "avatarUrl": "https://example.com/updatedavatar.jpg"
      }
    ```
 * Returns the updated user object.

*   **Error Responses:**
    *    **403 Forbidden:** If the user does not have admin access
    *   **400 Bad Request:** If the request body is invalid or missing required fields.
    *   **404 Not Found:** If no user is found with the provided `id`.
    *   **500 Internal Server Error:** For other server-related errors.

### 4. Remove User (Admin Only)

*   **Endpoint:** `/users/:id`
*   **Method:** `DELETE`
*   **Description:** Removes a user identified by `id`. Only accessible to Admin users.
*   **Request Body:** None
*   **Response (200 OK):**
    ```json
    {
        "success": true,
        "deletedId": "user-123"
    }
    ```

   * Returns the deletedId.

*   **Error Responses:**
    *   **403 Forbidden:** If the user does not have admin access
    *   **404 Not Found:** If no user is found with the provided `id`.
    *   **500 Internal Server Error:** For other server-related errors.

### 5. Change User Password
* **Endpoint:** `/auth/password/change`
* **Method:** `POST`
* **Description:** Allows a user to change their password
*  **Request Body**
    ```json
    {
        "currentPassword": "currentPassword",
        "newPassword": "newPassword",
       "confirmNewPassword": "confirmNewPassword"
    }
    ```
 *   `currentPassword`  Current Password of the user (string)
 * `newPassword`  New Password of the user (string)
 *   `confirmNewPassword`  Confirm New Password of the user (string)
*  **Response (200 OK):**
    ```json
    {
        "success": true
      }
    ```
 * Returns success status.
* **Error Responses:**
    *   **400 Bad Request:** if the `currentPassword` does not match existing password.
    *   **500 Internal Server Error:** For other server-related errors.

### 6. Reset User Password

*   **Endpoint:** `/auth/password/reset`
*   **Method:** `POST`
*   **Description:** Resets a user's password using a reset token.
*   **Request Body:**

    ```json
    {
      "code": "reset_code_123",
      "newPassword": "new_password_123"
    }
    ```

    *   `token`: The reset password token sent to the user's email(String)
    *   `newPassword`: New password to set (String).

*   **Response (200 OK):**
        ```json
         {
             "success": true
          }
       ```
    * Returns Success Status

*   **Error Responses:**
    *   **400 Bad Request:** if code is not valid or expired.
    *   **500 Internal Server Error:** For other server-related errors.

### 7. Send Password Reset Email
* **Endpoint:** `/auth/password/forgot`
* **Method:** `POST`
* **Description:** Send a password reset email to user
* **Request Body**
    ```json
     {
         "email": "user@email.com"
     }
    ```
  *  `email`: Email of the user wanting password reset

* **Response (200 OK):**
       ```json
        {
            "code" : "reset_code_123"
        }
       ```
 *  Return a reset code to be used later in the reset process.

*   **Error Responses:**
    *   **400 Bad Request:** If the request body is invalid or missing required fields.
    *    **500 Internal Server Error:** For other server-related errors.

## Data Types
### `User`
```typescript
export interface User {
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
}
```
### `PasswordChangeFormData`
```typescript
export interface PasswordChangeFormData {
	currentPassword: string;
	newPassword: string;
	confirmNewPassword: string;
}
```

## Notes
* All requests requiring authentication should include the JWT token in the `Authorization` header: `Bearer <your_token>`.
*  Error responses will include a `message` field describing the error.
*  The `:id` in endpoints indicates a variable path parameter representing the unique identifier of the user, where applicable.
* Only Admins have the permission to manage users.

```