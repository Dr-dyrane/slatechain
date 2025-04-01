// app/api/returns/[id]/resolve/route.ts (Create this new file/route)
import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api"; // Your wrapper
import { mongoose } from "../../.."; // Adjust path
import ReturnRequest from "../../../models/ReturnRequest";
import ReturnResolution from "../../../models/ReturnResolution";
import Order, { PaymentMethod } from "../../../models/Order"; // Needed for creating replacement orders
import User from "../../../models/User";
import {
	UserRole,
	ReturnType,
	ReturnResolutionStatus,
	ReturnRequestStatus,
} from "@/lib/types";
import { createNotification } from "@/app/actions/notifications";
import { stripe } from "@/app/api/payments/route";
import { issueStoreCredit } from "@/lib/utils";
import { STORE_CREDIT_AMOUNT } from "@/lib/config";

const RESOLVE_RATE_LIMIT = 10;

export async function POST(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id: returnRequestId } = params;
	return handleRequest(
		req,
		async (req, userId) => {
			if (!mongoose.Types.ObjectId.isValid(returnRequestId)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid return request ID" },
					{ status: 400 }
				);
			}

			const user = (await User.findById(userId).lean()) as unknown as {
				role: UserRole;
			};
			// --- Authorization: Only Admin/Manager ---
			if (!user || ![UserRole.ADMIN, UserRole.MANAGER].includes(user.role)) {
				return NextResponse.json(
					{
						code: "FORBIDDEN",
						message: "Unauthorized to resolve return requests",
					},
					{ status: 403 }
				);
			}

			const body = await req.json();
			const {
				resolutionType,
				notes,
				refundAmount,
				replacementItems /*, storeCreditDetails, exchangeDetails */,
			} = body;

			// --- Validate Input ---
			if (
				!resolutionType ||
				!Object.values(ReturnType).includes(resolutionType)
			) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message: "Missing or invalid resolutionType",
					},
					{ status: 400 }
				);
			}
			if (
				resolutionType === ReturnType.REFUND &&
				(refundAmount === undefined ||
					typeof refundAmount !== "number" ||
					refundAmount < 0)
			) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message: "Valid refundAmount required for Refund resolution",
					},
					{ status: 400 }
				);
			}
			if (
				resolutionType === ReturnType.REPLACEMENT &&
				(!replacementItems ||
					!Array.isArray(replacementItems) ||
					replacementItems.length === 0)
			) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message:
							"replacementItems array required for Replacement resolution",
					},
					{ status: 400 }
				);
			}
			// Add validation for Store Credit / Exchange if implementing

			// --- Fetch Request & Check State ---
			const returnRequest = await ReturnRequest.findById(
				returnRequestId
			).populate("orderId", "customerId shippingAddress"); // Populate needed fields
			if (!returnRequest) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Return request not found" },
					{ status: 404 }
				);
			}
			// Can only resolve requests that are Approved or where Items have been Received/Processing
			if (
				![
					ReturnRequestStatus.APPROVED,
					ReturnRequestStatus.ITEMS_RECEIVED,
					ReturnRequestStatus.PROCESSING,
				].includes(returnRequest.status)
			) {
				return NextResponse.json(
					{
						code: "INVALID_STATE",
						message: `Cannot resolve return in status: ${returnRequest.status}`,
					},
					{ status: 400 }
				);
			}
			// Check if already resolved
			const existingResolution = await ReturnResolution.findOne({
				returnRequestId: returnRequest._id,
			});
			if (
				existingResolution &&
				existingResolution.status !== ReturnResolutionStatus.FAILED
			) {
				return NextResponse.json(
					{
						code: "ALREADY_RESOLVED",
						message: `Return request already has an active resolution (Status: ${existingResolution.status})`,
					},
					{ status: 400 }
				);
			}

			// --- Perform Resolution Actions & Create Resolution Record (Transaction) ---
			const session = await mongoose.startSession();
			session.startTransaction();
			let resolutionRecord = null;
			let finalReturnStatus = ReturnRequestStatus.COMPLETED; // Optimistic default

			try {
				const resolutionData: any = {
					returnRequestId: returnRequest._id,
					resolutionType,
					status: ReturnResolutionStatus.IN_PROGRESS, // Mark as in progress initially
					resolvedBy: userId,
					resolutionDate: new Date(),
					notes,
				};

				// --- Action based on Type ---
				if (resolutionType === ReturnType.REFUND) {
					resolutionData.refundAmount = refundAmount;
					// ** Integrate with Payment Gateway (e.g., Stripe) **
					const refund = await stripe.refunds.create({
						payment_intent: "pi_...",
						amount: refundAmount * 100,
					});
					if (refund.status === "succeeded") {
						resolutionData.refundTransactionId = refund.id;
						resolutionData.status = ReturnResolutionStatus.COMPLETED;
					} else {
						resolutionData.status = ReturnResolutionStatus.FAILED;
						finalReturnStatus = returnRequest.status; // Revert main status if failed
						throw new Error(`Stripe refund failed: ${refund.failure_reason}`);
					}
					// Placeholder for success:
					resolutionData.refundTransactionId = `SIMULATED_REFUND_${Date.now()}`;
					resolutionData.status = ReturnResolutionStatus.COMPLETED;
				} else if (resolutionType === ReturnType.REPLACEMENT) {
					// ** TODO: Create a new Order for the replacement items **
					// Calculate total amount for replacement order
					const replacementTotal = replacementItems.reduce(
						(sum: number, item: { price: number; quantity: number }) =>
							sum + item.price * item.quantity,
						0
					);
					const newOrderData = {
						customerId: returnRequest.orderId.customerId, // Customer from original order
						items: replacementItems, // Use provided replacementItems (ensure price, productId, quantity are present)
						totalAmount: replacementTotal, // Calculate total
						status: "PENDING", // New order starts as pending
						paid: true, // Assume replacement is 'paid' by the return process
						paymentMethod: PaymentMethod.MANUAL, // Or a specific 'REPLACEMENT' method
						paymentDetails: {
							provider: "slatechain_return",
							status: "replacement",
							amount: 0,
						},
						shippingAddress: returnRequest.orderId.shippingAddress, // Use original shipping address
						createdBy: userId, // Admin/Manager creating it
						// Add a note or custom field indicating it's a replacement for Return #...
					};
					// Create the new order using your existing POST /api/orders logic or directly
					const replacementOrder = await Order.create([newOrderData], {
						session,
					}); // Create within transaction
					resolutionData.replacementOrderId = replacementOrder[0]._id;
					resolutionData.status = ReturnResolutionStatus.COMPLETED; // Or maybe IN_PROGRESS until shipped? Let's say COMPLETED when order is created.
				} else if (resolutionType === ReturnType.STORE_CREDIT) {
					// ** TODO: Integrate with store credit system **
					// Example:
					const credit = await issueStoreCredit(
						returnRequest.customerId,
						STORE_CREDIT_AMOUNT
					);
					resolutionData.storeCreditCode = credit.code;
					resolutionData.storeCreditAmount = credit.amount;
					resolutionData.status = ReturnResolutionStatus.COMPLETED;
				} else if (resolutionType === ReturnType.EXCHANGE) {
					// Handle complex exchange logic if needed
					resolutionData.status = ReturnResolutionStatus.COMPLETED;
				}

				// Create or Update the resolution record
				if (existingResolution) {
					// If retrying a failed resolution
					resolutionRecord = await ReturnResolution.findByIdAndUpdate(
						existingResolution._id,
						resolutionData,
						{ new: true, session }
					);
				} else {
					resolutionRecord = await ReturnResolution.create([resolutionData], {
						session,
					});
					resolutionRecord = resolutionRecord[0]; // Get the document from the array
				}

				// Update the main Return Request status
				returnRequest.status = finalReturnStatus; // Set to COMPLETED (or original status if resolution failed)
				returnRequest.reviewedBy = userId; // Mark resolver
				returnRequest.reviewDate = new Date(); // Update review date
				await returnRequest.save({ session });

				await session.commitTransaction();

				// --- Notification ---
				await createNotification(
					returnRequest.customerId.toString(), // Notify customer
					"GENERAL", // Or 'RETURN_UPDATE'
					`Return Resolved (#${returnRequest.returnRequestNumber})`,
					`Your return request has been resolved via ${resolutionType}. ${notes ? "Notes: " + notes : ""}`,
					{
						returnRequestId: returnRequest._id,
						resolutionType: resolutionType,
						resolutionStatus: resolutionRecord.status,
					}
				);

				// Populate for response
				const finalReturnRequest = await ReturnRequest.findById(returnRequestId)
					.populate("resolution") // Ensure resolution is populated
					// Add other necessary populates
					.lean();

				return NextResponse.json(finalReturnRequest);
			} catch (error: any) {
				await session.abortTransaction();
				console.error(
					`Return resolution failed for ${returnRequestId}:`,
					error
				);
				// Update resolution status to FAILED if it exists but action failed
				if (resolutionRecord?._id) {
					await ReturnResolution.findByIdAndUpdate(resolutionRecord._id, {
						status: ReturnResolutionStatus.FAILED,
					});
				} else if (existingResolution?._id) {
					await ReturnResolution.findByIdAndUpdate(existingResolution._id, {
						status: ReturnResolutionStatus.FAILED,
					});
				}
				return NextResponse.json(
					{
						code: "RESOLVE_ERROR",
						message: error.message || "Failed to resolve return request",
					},
					{ status: 500 }
				);
			} finally {
				session.endSession();
			}
		},
		"return_resolve",
		RESOLVE_RATE_LIMIT
	);
}
