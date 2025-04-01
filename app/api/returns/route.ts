// app/api/returns/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api"; // Your wrapper
import { mongoose } from ".."; // Adjust path if needed
import Order from "../models/Order";
import Inventory from "../models/Inventory";
import ReturnRequest from "../models/ReturnRequest";
import ReturnItem from "../models/ReturnItem";
import User from "../models/User";
import {
	UserRole,
	ReturnReason,
	ReturnType,
	ReturnRequestStatus,
	Order as OrderType,
} from "@/lib/types";
import { createNotification } from "@/app/actions/notifications";
import {
	RETURN_WINDOW_DAYS,
	NON_RETURNABLE_SKUS /* , RETURNABLE_PRODUCT_CATEGORIES */,
} from "@/lib/config"; // Import your config

const CREATE_RATE_LIMIT = 30;

export async function POST(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			try {
				const user = (await User.findById(userId)) as unknown as {
					role: UserRole;
				};
				if (!user) {
					// Only authenticated users can initiate returns
					return NextResponse.json(
						{ code: "UNAUTHORIZED", message: "Unauthorized" },
						{ status: 403 }
					);
				}

				const body = await req.json();
				const {
					orderId,
					items,
					returnReason,
					customerId,
					reasonDetails,
					preferredReturnType,
					proofImages,
					returnRequestNumber,
					requestDate
				} = body;

				console.log("Return request payload:", JSON.stringify(body, null, 2));

				// --- 1. Input Validation ---
				if (
					!mongoose.Types.ObjectId.isValid(orderId) ||
					!items ||
					!Array.isArray(items) ||
					items.length === 0 ||
					!returnReason ||
					!preferredReturnType
				) {
					return NextResponse.json(
						{
							code: "INVALID_INPUT",
							message:
								"Missing required fields: orderId, items, returnReason, preferredReturnType",
						},
						{ status: 400 }
					);
				}

				// --- 2. Fetch Order & Perform Eligibility Checks ---
				const order = (await Order.findById(
					orderId
				).lean()) as unknown as OrderType;
				if (!order) {
					return NextResponse.json(
						{ code: "ORDER_NOT_FOUND", message: "Order not found" },
						{ status: 404 }
					);
				}

				// Allow any authenticated user to create a return request
				// Only check if the user is the customer if they're a customer role
				if (
					user.role === UserRole.CUSTOMER &&
					order.customerId.toString() !== userId
				) {
					// Ensure customer owns the order if they're a customer
					return NextResponse.json(
						{ code: "FORBIDDEN", message: "You do not own this order" },
						{ status: 403 }
					);
				}

				// --- Dynamic Check: Return Window ---
				// Base window on order creation date. Could refine to use shipment delivered date if tracked.
				const orderDate = new Date(order.createdAt);
				const expiryDate = new Date(
					orderDate.setDate(orderDate.getDate() + RETURN_WINDOW_DAYS)
				);
				if (new Date() > expiryDate) {
					return NextResponse.json(
						{
							code: "RETURN_WINDOW_EXPIRED",
							message: `Return window closed on ${expiryDate.toLocaleDateString()}`,
						},
						{ status: 400 }
					);
				}

				// --- Dynamic Checks: Item Returnability & Previously Returned Quantity ---
				for (const requestedItem of items) {
					// Find the order item in the order
					const orderItem = order.items.find((oi) => {
						// Ensure we're comparing strings to strings
						const orderItemId = oi._id?.toString() || oi.id?.toString();
						const requestItemId = requestedItem.orderItemId?.toString();
						return orderItemId === requestItemId;
					});

					if (!orderItem) {
						return NextResponse.json(
							{
								code: "INVALID_INPUT",
								message: `OrderItem ID ${requestedItem.orderItemId} not found in the specified order.`,
							},
							{ status: 400 }
						);
					}

					// Check requested quantity validity
					if (requestedItem.quantity <= 0) {
						return NextResponse.json(
							{
								code: "INVALID_INPUT",
								message: `Invalid quantity requested for item ${orderItem.productId}.`,
							},
							{ status: 400 }
						);
					}

					// Check if quantity exceeds original order quantity
					if (requestedItem.quantity > orderItem.quantity) {
						return NextResponse.json(
							{
								code: "QUANTITY_EXCEEDS_LIMIT",
								message: `Cannot return ${requestedItem.quantity} of item ${orderItem.productId}. Original order quantity: ${orderItem.quantity}.`,
							},
							{ status: 400 }
						);
					}
				}

				// --- 3. Create Return Request & Items (Transaction) ---
				const session = await mongoose.startSession();
				session.startTransaction();
				try {
					// Create the return request
					const newReturnRequest = new ReturnRequest({
						orderId,
						customerId: customerId || userId,
						status: ReturnRequestStatus.PENDING_APPROVAL,
						returnReason,
						reasonDetails,
						returnRequestNumber,
						preferredReturnType,
						proofImages,
						requestDate
					});

					await newReturnRequest.save({ session });

					// Create return items
					const returnItemsData = items.map((item) => {
						const orderItem = order.items.find((oi) => {
							const orderItemId = oi._id?.toString() || oi.id?.toString();
							const requestItemId = item.orderItemId?.toString();
							return orderItemId === requestItemId;
						});

						return {
							returnRequestId: newReturnRequest._id,
							orderItemId: item.orderItemId,
							productId: item.productId || orderItem?.productId,
							quantityRequested: item.quantity,
						};
					});

					await ReturnItem.insertMany(returnItemsData, { session });
					await session.commitTransaction();

					// --- 4. Notification ---
					try {
						await createNotification(
							userId, // Notify customer
							"GENERAL", // Or a new 'RETURN_UPDATE' type
							`Return Request Submitted (#${newReturnRequest.returnRequestNumber})`,
							`Your return request for order #${order.orderNumber} has been submitted and is pending review.`,
							{
								returnRequestId: newReturnRequest._id,
								orderId: order.id,
							}
						);
					} catch (notificationError) {
						console.error("Failed to create notification:", notificationError);
						// Don't fail the request if notification fails
					}

					// Populate for response
					const createdRequest = await ReturnRequest.findById(
						newReturnRequest._id
					)
						.populate({
							path: "returnItems",
							populate: { path: "productId", select: "name sku" },
						})
						.lean();

					return NextResponse.json(createdRequest, { status: 201 });
				} catch (error: any) {
					await session.abortTransaction();
					console.error("Return creation failed:", error);
					return NextResponse.json(
						{
							code: "CREATE_ERROR",
							message: error.message || "Failed to create return request",
						},
						{ status: 500 }
					);
				} finally {
					session.endSession();
				}
			} catch (error) {
				console.error("Unexpected error in return request creation:", error);
				return NextResponse.json(
					{
						code: "SERVER_ERROR",
						message: "An unexpected error occurred. Please try again later.",
					},
					{ status: 500 }
				);
			}
		},
		"return_create", // Rate limit key
		CREATE_RATE_LIMIT
	);
}

const LIST_RATE_LIMIT = 50; // Adjust as needed

export async function GET(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			const user = (await User.findById(userId).lean()) as unknown as {
				role: UserRole;
			};
			if (!user) {
				return NextResponse.json(
					{ code: "USER_NOT_FOUND", message: "User not found" },
					{ status: 404 }
				);
			}

			const { searchParams } = new URL(req.url);
			const statusFilter = searchParams.get("status");
			const orderIdFilter = searchParams.get("orderId");
			const customerIdFilter = searchParams.get("customerId"); // For admin/manager filtering

			let query: mongoose.FilterQuery<typeof ReturnRequest> = {};

			// --- Role-Based Query Construction ---
			if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
				// Admin/Manager can see all, potentially filtered
				if (
					customerIdFilter &&
					mongoose.Types.ObjectId.isValid(customerIdFilter)
				) {
					query.customerId = customerIdFilter;
				}
			} else if (user.role === UserRole.CUSTOMER) {
				// Customer sees only their own requests
				query.customerId = userId;
			} else if (user.role === UserRole.SUPPLIER) {
				// Supplier sees requests containing their products
				const supplierProducts = await Inventory.find({ supplierId: userId })
					.select("_id")
					.lean();
				const supplierProductIds = supplierProducts.map((p) => p._id);

				// Find ReturnItems linked to these products
				const relevantReturnItems = await ReturnItem.find({
					productId: { $in: supplierProductIds },
				})
					.select("returnRequestId")
					.lean();
				const relevantReturnRequestIds = [
					...new Set(relevantReturnItems.map((ri) => ri.returnRequestId)),
				]; // Unique request IDs

				query._id = { $in: relevantReturnRequestIds };
			} else {
				return NextResponse.json(
					{
						code: "UNAUTHORIZED",
						message: "Unauthorized to view return requests",
					},
					{ status: 403 }
				);
			}

			// --- Apply General Filters ---
			if (
				statusFilter &&
				Object.values(ReturnRequestStatus).includes(
					statusFilter as ReturnRequestStatus
				)
			) {
				query.status = statusFilter;
			}
			if (orderIdFilter && mongoose.Types.ObjectId.isValid(orderIdFilter)) {
				query.orderId = orderIdFilter;
			}

			// --- Execute Query ---
			const returns = await ReturnRequest.find(query)
				// Populate essential details for the list view
				.populate("customerId", "name email")
				.populate("orderId", "orderNumber")
				.select("-proofImages -reasonDetails -staffComments")
				.sort({ createdAt: -1 })
				.lean();

			return NextResponse.json(returns);
		},
		"returns_list",
		LIST_RATE_LIMIT
	);
}
