// app/api/orders/[id]/payment/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import Order from "../../../models/Order";
import { createNotification } from "@/app/actions/notifications"; // Assuming this is your notification function
import mongoose from "mongoose";
import Stripe from "stripe";
import { isLive, verifyTransaction } from "@/lib/blockchain/web3Provider"; // Assuming this handles blockchain verification

// --- STRIPE CONFIGURATION ---
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ""; // MUST be in .env.local for security
const stripe = new Stripe(STRIPE_SECRET_KEY, {
	apiVersion: "2025-02-24.acacia", // or the latest version
});

const PAYMENT_RATE_LIMIT = 10;

// Payment processor types
type PaymentMethod = "stripe" | "blockchain" | "manual";

interface PaymentData {
	method: PaymentMethod;
	//Only used for demo mode
	paymentDetails?: any;

	//Used for stripe payment to pass client secret to get payment status
	clientSecret?: string;
}

// POST /api/orders/[id]/payment - Process payment for an order
export async function POST(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;

	return handleRequest(
		req,
		async (req, userId) => {
			// Validate order ID
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid order ID" },
					{ status: 400 }
				);
			}

			const order = await Order.findById(id).populate(
				"customerId",
				"email blockchain"
			);
			if (!order) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Order not found" },
					{ status: 404 }
				);
			}

			// Check if order is already paid
			if (order.paid) {
				return NextResponse.json(
					{
						code: "INVALID_STATUS",
						message: "Order is already paid",
					},
					{ status: 400 }
				);
			}

			// Get payment data from request
			const paymentData: PaymentData = await req.json();

			if (!paymentData.method) {
				return NextResponse.json(
					{ code: "INVALID_REQUEST", message: "Payment method is required" },
					{ status: 400 }
				);
			}

			let paymentResult;

			try {
				// Process payment based on method
				switch (paymentData.method) {
					case "stripe":
						paymentResult = await processStripePayment(order, paymentData);
						break;
					case "blockchain":
						paymentResult = await processBlockchainPayment(order, paymentData);
						break;
					case "manual":
						paymentResult = {
							success: true,
							message: "Manual payment recorded",
						};
						break;
					default:
						return NextResponse.json(
							{ code: "INVALID_METHOD", message: "Invalid payment method" },
							{ status: 400 }
						);
				}

				if (!paymentResult.success) {
					return NextResponse.json(
						{ code: "PAYMENT_FAILED", message: paymentResult.message },
						{ status: 400 }
					);
				}

				// Update order status
				order.paid = true;
				order.status = "PROCESSING"; // Move to processing after payment
				order.paymentMethod = paymentData.method;
				order.paymentDetails = {
					...paymentResult.details,
					processedAt: new Date(),
				};
				await order.save();

				// Create notification for payment
				await createNotification(
					order.customerId._id,
					"ORDER_UPDATE",
					`Payment Received for Order ${order.orderNumber}`,
					`Payment has been processed for your order. Your order is now being processed.`,
					{
						orderId: order._id,
						orderNumber: order.orderNumber,
						amount: order.totalAmount,
						paymentMethod: paymentData.method,
					}
				);

				return NextResponse.json({
					success: true,
					order,
					paymentDetails: paymentResult.details,
				});
			} catch (error) {
				console.error("Payment processing error:", error);
				return NextResponse.json(
					{
						code: "PAYMENT_ERROR",
						message: "An error occurred while processing payment",
						details: error instanceof Error ? error.message : String(error),
					},
					{ status: 500 }
				);
			}
		},
		"order_payment",
		PAYMENT_RATE_LIMIT
	);
}

// Process Stripe payment
async function processStripePayment(order: any, paymentData: PaymentData) {
	// In a real implementation, you would use Stripe.js to collect payment details
	// and create a payment intent on the server

	if (isLive()) {
		if (!paymentData.clientSecret) {
			return {
				success: false,
				message: "Client Secret is required for Stripe Payments",
			};
		}
		// In live mode, verify the payment intent status
		try {
			// Extract the payment intent ID from the client secret
			const paymentIntentId = paymentData.clientSecret.split("_secret_")[0];

			// Retrieve the payment intent with expanded charges
			const paymentIntent: any = await stripe.paymentIntents.retrieve(
				paymentIntentId,
				{
					expand: ["charges.data.payment_method_details.card"],
				}
			);

			if (paymentIntent.status === "succeeded") {
				return {
					success: true,
					details: {
						provider: "stripe",
						transactionId: paymentIntent.id,
						status: paymentIntent.status,
						amount: order.totalAmount,
						cardDetails: {
							last4:
								paymentIntent.charges?.data[0]?.payment_method_details?.card
									?.last4 || "****",
							brand:
								paymentIntent.charges?.data[0]?.payment_method_details?.card
									?.brand || "unknown",
							expMonth:
								paymentIntent.charges?.data[0]?.payment_method_details?.card?.exp_month?.toString() ||
								"**",
							expYear:
								paymentIntent.charges?.data[0]?.payment_method_details?.card?.exp_year?.toString() ||
								"****",
						},
					},
				};
			} else {
				return {
					success: false,
					message: `Stripe payment failed with status: ${paymentIntent.status}`,
				};
			}
		} catch (error) {
			console.error("Stripe payment error:", error);
			return {
				success: false,
				message:
					error instanceof Error ? error.message : "Stripe payment failed",
			};
		}
	} else {
		// In demo mode, simulate a successful payment
		console.log("Demo mode: Simulating Stripe payment");

		// Simulate a delay for payment processing
		await new Promise((resolve) => setTimeout(resolve, 1000));

		return {
			success: true,
			details: {
				provider: "stripe",
				transactionId: `pi_${Math.random().toString(36).substring(2, 15)}`,
				status: "succeeded",
				amount: order.totalAmount,
				cardDetails: {
					last4: "4242",
					brand: "visa",
					expMonth: "12",
					expYear: "2025",
				},
			},
		};
	}
}

// Process blockchain payment
async function processBlockchainPayment(order: any, paymentData: PaymentData) {
	const transactionHash = paymentData.paymentDetails?.transactionHash;
	const walletAddress = paymentData.paymentDetails?.walletAddress;

	if (!transactionHash) {
		return { success: false, message: "Transaction hash is required" };
	}

	try {
		// If we're in live mode, verify the transaction on the blockchain
		if (isLive()) {
			const companyWalletAddress =
				process.env.COMPANY_WALLET_ADDRESS ||
				"";

			const verificationResult = await verifyTransaction(
				transactionHash,
				order.totalAmount,
				companyWalletAddress
			);

			if (!verificationResult.success) {
				return {
					success: false,
					message:
						verificationResult.error || "Transaction verification failed",
				};
			}

			return {
				success: true,
				details: {
					provider: "blockchain",
					transactionHash: transactionHash,
					walletAddress: walletAddress,
					status: "confirmed",
					amount: order.totalAmount,
					network: "mainnet",
				},
			};
		} else {
			// In demo mode, just simulate verification
			console.log("Demo mode: Simulating blockchain transaction verification");

			// Simulate a delay for transaction verification
			await new Promise((resolve) => setTimeout(resolve, 1000));

			return {
				success: true,
				details: {
					provider: "blockchain",
					transactionHash: transactionHash,
					walletAddress:
						walletAddress || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
					status: "confirmed",
					amount: order.totalAmount,
					network: "testnet",
				},
			};
		}
	} catch (error) {
		console.error("Blockchain payment error:", error);
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: "Blockchain payment verification failed",
		};
	}
}
