// lib/blockchain/mockApiResponses.ts

import { mockWalletData } from "./mockBlockchainData";

// Mock API responses for blockchain endpoints
export const mockBlockchainApiResponses = {
	// Register wallet endpoint
	"/blockchain/register-wallet": (data: {
		walletAddress: string;
		signature: string;
		message: string;
		userId: string;
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
		};
	},

	// Verify wallet endpoint
	"/blockchain/verify-wallet": (data: {
		walletAddress: string;
		signature: string;
		message: string;
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
		};
	},

	// Get wallet data endpoint
	"/blockchain/wallet-data": (params: any) => {
		const address = params?.address || mockWalletData.wallet.address;
		return {
			success: true,
			data: {
				...mockWalletData,
				wallet: {
					...mockWalletData.wallet,
					address: address,
				},
			},
		};
	},

	// Login with wallet endpoint
	"/auth/wallet/login": (data: {
		address: string;
		message: string;
		signature: string;
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
		};
	},

	// Register with wallet endpoint
	"/auth/wallet/register": (data: {
		address: string;
		message: string;
		signature: string;
		email: string;
		firstName: string;
		lastName: string;
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
		};
	},
};

/**
 * Mock responses for payment-related API endpoints
 */
export const mockPaymentResponses = {
	// Create payment intent endpoint
	"/payments/create-intent": (data: {
		amount: number;
		orderId: string;
		metadata?: Record<string, any>;
	}) => {
		// Generate a mock client secret
		const clientSecret = `pi_${Math.random().toString(36).substring(2, 15)}_secret_${Math.random().toString(36).substring(2, 15)}`;
		const paymentIntentId = clientSecret.split("_secret_")[0];

		return {
			clientSecret,
			paymentIntentId,
			amount: data.amount,
			currency: "usd",
			status: "requires_payment_method",
		};
	},

	// Process payment endpoint
	"/orders/:id/payment": (data: {
		method: "stripe" | "blockchain" | "manual";
		paymentDetails?: any;
		clientSecret?: string;
	}) => {
		// Generate mock payment result based on payment method
		let paymentResult: any;

		switch (data.method) {
			case "stripe":
				paymentResult = {
					success: true,
					order: {
						id: "123",
						orderNumber: "ORD12345",
						paid: true,
						status: "PROCESSING",
						paymentMethod: "stripe",
						paymentDetails: {
							provider: "stripe",
							transactionId: data.clientSecret
								? data.clientSecret.split("_secret_")[0]
								: `pi_${Math.random().toString(36).substring(2, 15)}`,
							status: "succeeded",
							amount: 100.0,
							cardDetails: {
								last4: "4242",
								brand: "visa",
								expMonth: "12",
								expYear: "2025",
							},
							processedAt: new Date().toISOString(),
						},
					},
					paymentDetails: {
						provider: "stripe",
						transactionId: data.clientSecret
							? data.clientSecret.split("_secret_")[0]
							: `pi_${Math.random().toString(36).substring(2, 15)}`,
						status: "succeeded",
						amount: 100.0,
						cardDetails: {
							last4: "4242",
							brand: "visa",
							expMonth: "12",
							expYear: "2025",
						},
					},
				};
				break;

			case "blockchain":
				const transactionHash =
					data.paymentDetails?.transactionHash ||
					`0x${Array(64)
						.fill(0)
						.map(() => Math.floor(Math.random() * 16).toString(16))
						.join("")}`;
				const walletAddress =
					data.paymentDetails?.walletAddress ||
					"0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

				paymentResult = {
					success: true,
					order: {
						id: "123",
						orderNumber: "ORD12345",
						paid: true,
						status: "PROCESSING",
						paymentMethod: "blockchain",
						paymentDetails: {
							provider: "blockchain",
							transactionHash: transactionHash,
							walletAddress: walletAddress,
							status: "confirmed",
							amount: 100.0,
							network: "testnet",
							processedAt: new Date().toISOString(),
						},
					},
					paymentDetails: {
						provider: "blockchain",
						transactionHash: transactionHash,
						walletAddress: walletAddress,
						status: "confirmed",
						amount: 100.0,
						network: "testnet",
					},
				};
				break;

			case "manual":
				paymentResult = {
					success: true,
					order: {
						id: "123",
						orderNumber: "ORD12345",
						paid: true,
						status: "PROCESSING",
						paymentMethod: "manual",
						paymentDetails: {
							provider: "manual",
							status: "recorded",
							amount: 100.0,
							processedAt: new Date().toISOString(),
						},
					},
					paymentDetails: {
						provider: "manual",
						status: "recorded",
						amount: 100.0,
					},
				};
				break;

			default:
				return {
					success: false,
					message: "Invalid payment method",
				};
		}

		return paymentResult;
	},
};
