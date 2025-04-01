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
			const user = (await User.findById(userId)) as unknown as {
				role: UserRole;
			};
			if (!user || user.role !== UserRole.CUSTOMER) {
				// Only customers can initiate returns this way
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
				reasonDetails,
				preferredReturnType,
				proofImages,
			} = body;

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
			if (
				!Object.values(ReturnReason).includes(returnReason) ||
				!Object.values(ReturnType).includes(preferredReturnType)
			) {
				return NextResponse.json(
					{
						code: "INVALID_INPUT",
						message: "Invalid reason or return type value",
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
			if (order.customerId.toString() !== userId) {
				// Ensure customer owns the order
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
			const productIdsToFetch = items
				.map((item: { orderItemId: string }) => {
					const orderItem = order.items.find((oi) => {
						if (!oi._id) {
							return;
						}
						oi._id.toString() === item.orderItemId;
					});
					return orderItem?.productId;
				})
				.filter(Boolean);

			const [inventoryItems, previousReturnItems] = await Promise.all([
				Inventory.find({ _id: { $in: productIdsToFetch } })
					.select("sku category")
					.lean(), // Fetch SKU/category for returnable check
				ReturnItem.find({
					orderItemId: { $in: items.map((i: any) => i.orderItemId) },
				}) // Find any previous return attempts for these specific order items
					.populate({ path: "returnRequestId", select: "status" }) // Need parent request status
					.lean(),
			]);

			const inventoryMap = new Map(
				inventoryItems.map((inv) => [inv.id.toString(), inv])
			);

			for (const requestedItem of items) {
				const orderItem = order.items.find((oi) => {
					if (!oi._id) {
						return;
					}
					oi._id.toString() === requestedItem.orderItemId;
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

				// Dynamic Check: Item Type Returnability (using SKU or Category from Inventory)
				const inventoryInfo = inventoryMap.get(orderItem.productId.toString());
				if (inventoryInfo && NON_RETURNABLE_SKUS.includes(inventoryInfo.sku)) {
					return NextResponse.json(
						{
							code: "ITEM_NOT_RETURNABLE",
							message: `Item with SKU ${inventoryInfo.sku} cannot be returned.`,
						},
						{ status: 400 }
					);
				}
				// Add category check if needed:
				// if (inventoryInfo && !RETURNABLE_PRODUCT_CATEGORIES.includes(inventoryInfo.category)) { ... }

				// Dynamic Check: Calculate previously returned/requested quantity for THIS OrderItem
				let alreadyReturnedOrApproved = 0;
				previousReturnItems.forEach((prevItem) => {
					// Check if it's the same OrderItem and the request wasn't rejected
					if (prevItem.orderItemId.toString() === requestedItem.orderItemId) {
						// @ts-ignore // Handle potential TS issue with populated field access
						const parentStatus = prevItem.returnRequestId?.status;
						if (parentStatus && parentStatus !== ReturnRequestStatus.REJECTED) {
							// Count quantity already received OR quantity requested in pending/approved requests
							alreadyReturnedOrApproved +=
								prevItem.quantityReceived ?? prevItem.quantityRequested;
						}
					}
				});

				const availableToReturn =
					orderItem.quantity - alreadyReturnedOrApproved;
				if (requestedItem.quantity > availableToReturn) {
					return NextResponse.json(
						{
							code: "QUANTITY_EXCEEDS_LIMIT",
							message: `Cannot return ${requestedItem.quantity} of item ${orderItem.productId}. Only ${availableToReturn} available (Original: ${orderItem.quantity}, Previously Returned/Requested: ${alreadyReturnedOrApproved}).`,
						},
						{ status: 400 }
					);
				}
			}

			// --- 3. Create Return Request & Items (Transaction) ---
			const session = await mongoose.startSession();
			session.startTransaction();
			try {
				const newReturnRequest = new ReturnRequest({
					orderId: order.id,
					customerId: userId,
					status: ReturnRequestStatus.PENDING_APPROVAL,
					returnReason,
					reasonDetails,
					preferredReturnType,
					proofImages: proofImages || [], // Handle optional images
				});
				await newReturnRequest.save({ session });

				const returnItemsData = items.map(
					(item: { orderItemId: string; quantity: number }) => {
						const orderItem = order.items.find((oi) => {
							if (!oi._id) {
								return;
							}
							oi._id.toString() === item.orderItemId;
						})!; // We validated it exists
						return {
							returnRequestId: newReturnRequest._id,
							orderItemId: orderItem._id, // The ID of the sub-document from Order.items
							productId: orderItem.productId,
							quantityRequested: item.quantity,
						};
					}
				);
				await ReturnItem.insertMany(returnItemsData, { session });

				await session.commitTransaction();

				// --- 4. Notification ---
				await createNotification(
					userId, // Notify customer
					"GENERAL", // Or a new 'RETURN_UPDATE' type
					`Return Request Submitted (#${newReturnRequest.returnRequestNumber})`,
					`Your return request for order #${order.orderNumber} has been submitted and is pending review.`,
					{ returnRequestId: newReturnRequest._id, orderId: order.id }
				);
				// Optional: Notify Admin/Manager
				// Find Admins/Managers and call createNotification for them

				// Populate for response
				const createdRequest = await ReturnRequest.findById(
					newReturnRequest._id
				)
					.populate({
						path: "returnItems",
						populate: { path: "product", select: "name sku" },
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
