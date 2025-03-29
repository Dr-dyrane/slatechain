import { mockWalletData } from "./mockBlockchainData"

// Mock API responses for blockchain endpoints
export const mockBlockchainApiResponses = {
  // Register wallet endpoint
  "/blockchain/register-wallet": (data: {
    walletAddress: string
    signature: string
    message: string
    userId: string
  }) => {
    return {
      success: true,
      message: "Wallet registered successfully",
      user: {
        id: data.userId,
        blockchain: {
          walletAddress: data.walletAddress,
          registeredAt: new Date().toISOString(),
        },
      },
    }
  },

  // Verify wallet endpoint
  "/blockchain/verify-wallet": (data: {
    walletAddress: string
    signature: string
    message: string
  }) => {
    return {
      success: true,
      message: "Wallet verified successfully",
      user: {
        id: "user-123",
        email: "john.doe@example.com",
        name: "John Doe",
        blockchain: {
          walletAddress: data.walletAddress,
          registeredAt: "2023-01-01T00:00:00Z",
        },
      },
    }
  },

  // Get wallet data endpoint
  "/blockchain/wallet-data": (params: any) => {
    const address = params?.address || mockWalletData.wallet.address
    return {
      success: true,
      data: {
        ...mockWalletData,
        wallet: {
          ...mockWalletData.wallet,
          address: address,
        },
      },
    }
  },

  // Login with wallet endpoint
  "/auth/wallet/login": (data: {
    address: string
    message: string
    signature: string
  }) => {
    return {
      user: {
        id: "user-123",
        firstName: "John",
        lastName: "Doe",
        name: "John Doe",
        email: "john.doe@example.com",
        phoneNumber: "+1234567890",
        role: "admin",
        isEmailVerified: true,
        isPhoneVerified: true,
        kycStatus: "APPROVED",
        onboardingStatus: "COMPLETED",
        avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg",
        blockchain: {
          walletAddress: data.address,
          registeredAt: "2023-01-01T00:00:00Z",
        },
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
        integrations: {
          ecommerce: {
            enabled: true,
            service: "shopify",
            apiKey: "shopify_admin_api_key",
            storeUrl: "johns-apparel.myshopify.com",
          },
        },
      },
      accessToken: "mock_access_token",
      refreshToken: "mock_refresh_token",
    }
  },

  // Register with wallet endpoint
  "/auth/wallet/register": (data: {
    address: string
    message: string
    signature: string
    email: string
    firstName: string
    lastName: string
  }) => {
    return {
      user: {
        id: "user-123",
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phoneNumber: "",
        role: "admin",
        isEmailVerified: false,
        isPhoneVerified: false,
        kycStatus: "NOT_STARTED",
        onboardingStatus: "NOT_STARTED",
        avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg",
        blockchain: {
          walletAddress: data.address,
          registeredAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        integrations: {
          ecommerce: {
            enabled: false,
            service: null,
          },
        },
      },
      accessToken: "mock_access_token",
      refreshToken: "mock_refresh_token",
    }
  },
}

