// lib/api/payment.ts
import { Order } from "../types";
import { apiClient } from "./apiClient/[...live]";

/**
 * Creates a payment intent on the server and returns the client secret
 * @param amount The amount to charge in dollars (will be converted to cents)
 * @param orderId The order ID associated with this payment
 * @param metadata Any additional metadata to store with the payment
 */
export async function createPaymentIntent(
	amount: number,
	orderId: string,
	metadata: Record<string, any> = {}
) {
	try {
		const response = await apiClient.post("/payments/create-intent", {
			amount: Math.round(amount * 100), // Convert to cents
			orderId,
			metadata,
		});

		return response;
	} catch (error) {
		console.error("Error creating payment intent:", error);
		throw error;
	}
}

/**
 * Processes a payment for an order
 * @param id Order ID
 * @param method Payment method (stripe, blockchain, manual)
 * @param paymentDetails Additional payment details
 * @param clientSecret Stripe client secret (required for Stripe payments)
 */
export async function processPayment(
	id: string,
	method: "stripe" | "blockchain" | "manual",
	paymentDetails?: any,
	clientSecret?: string
): Promise<PaymentResponse> {
	try {
		const response = await apiClient.post<PaymentResponse>(
			`/orders/${id}/payment`,
			{
				method,
				paymentDetails,
				clientSecret,
			}
		);

		return response;
	} catch (error) {
		console.error("Error processing payment:", error);
		throw error;
	}
}

interface PaymentResponse {
	success: boolean;
	order: Order; // Assuming 'Order' is defined elsewhere
	paymentDetails: {
		provider?: string;
		transactionId?: string;
		status?: string;
		amount?: number;
		cardDetails?: {
			last4?: string;
			brand?: string;
			expMonth?: string;
			expYear?: string;
		};
		processedAt?: Date;
	};
}
