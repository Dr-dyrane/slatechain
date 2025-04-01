// app/api/returns/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import { mongoose } from "../..";
import ReturnRequest from "../../models/ReturnRequest";
import User from "../../models/User";
import { ReturnRequest as ReturnRequestType, UserRole } from "@/lib/types";
import {
	ReturnRequestStatus,
	ItemCondition,
	ReturnDisposition,
} from "@/lib/types";
import Inventory from "../../models/Inventory";
import ReturnItem from "../../models/ReturnItem";
import { createNotification } from "@/app/actions/notifications";

const GET_DETAILS_RATE_LIMIT = 30;

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;
	return handleRequest(
		req,
		async (req, userId) => {
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid return request ID" },
					{ status: 400 }
				);
			}

			const user = (await User.findById(userId).lean()) as unknown as {
				role: UserRole;
			};
			if (!user) {
				return NextResponse.json(
					{ code: "USER_NOT_FOUND", message: "User not found" },
					{ status: 404 }
				);
			}

			// Fetch the full return request with populated details
			const returnRequest = (await ReturnRequest.findById(id)
				.populate("customerId", "name email role")
				.populate({
					path: "orderId",
					select: "orderNumber customerId items",
					populate: {
						path: "items.productId",
						model: "Inventory",
						select: "name sku",
					},
				}) // Populate deeply
				.populate({
					path: "returnItems",
					populate: {
						path: "productId",
						model: "Inventory",
						select: "name sku supplierId",
					},
				}) // Populate product details in items
				.populate("reviewedBy", "name")
				.populate("resolution") // Populate the resolution sub-document
				.populate({
					path: "resolution",
					populate: [
						// Deep populate resolution fields
						{ path: "resolvedBy", model: "User", select: "name" },
						{
							path: "replacementOrderId",
							model: "Order",
							select: "orderNumber",
						},
					],
				})
				.lean()) as unknown as ReturnRequestType;
			if (!returnRequest) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Return request not found" },
					{ status: 404 }
				);
			}

			// --- Authorization Check ---
			let canView = false;
			if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
				canView = true;
			} else if (
				user.role === UserRole.CUSTOMER &&
				returnRequest.customerId.toString() === userId
			) {
				canView = true;
			} else if (user.role === UserRole.SUPPLIER) {
				// Check if any return item product belongs to this supplier
				// @ts-ignore // Handle TS issues with populated types if necessary
				canView = returnRequest.returnItems?.some(
					(item) => item.productId?.toString() === userId
				);
			}

			if (!canView) {
				return NextResponse.json(
					{
						code: "FORBIDDEN",
						message: "Unauthorized to view this return request",
					},
					{ status: 403 }
				);
			}

			return NextResponse.json(returnRequest);
		},
		"return_get_details",
		GET_DETAILS_RATE_LIMIT
	);
}

const UPDATE_RATE_LIMIT = 20;

export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;
	return handleRequest(
		req,
		async (req, userId) => {
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return NextResponse.json(
					{ code: "INVALID_ID", message: "Invalid return request ID" },
					{ status: 400 }
				);
			}

			const user = (await User.findById(userId).lean()) as unknown as {
				role: UserRole;
			};
			// --- Authorization: Only Admin/Manager can process ---
			if (!user || ![UserRole.ADMIN, UserRole.MANAGER].includes(user.role)) {
				return NextResponse.json(
					{
						code: "FORBIDDEN",
						message: "Unauthorized to update return requests",
					},
					{ status: 403 }
				);
			}

			const body = await req.json();
			const { status, staffComments, itemsToUpdate } = body;

			const returnRequest = await ReturnRequest.findById(id);
			if (!returnRequest) {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Return request not found" },
					{ status: 404 }
				);
			}

			// Prevent updates if already Completed or Rejected?
			if (
				[ReturnRequestStatus.COMPLETED, ReturnRequestStatus.REJECTED].includes(
					returnRequest.status
				)
			) {
				return NextResponse.json(
					{
						code: "INVALID_STATE",
						message: "Cannot update a completed or rejected return request",
					},
					{ status: 400 }
				);
			}

			let needsSave = false;
			let notificationDetails: any = null;

			// --- Update Overall Status & Comments ---
			if (status && status !== returnRequest.status) {
				if (!Object.values(ReturnRequestStatus).includes(status)) {
					return NextResponse.json(
						{ code: "INVALID_INPUT", message: "Invalid status value" },
						{ status: 400 }
					);
				}
				// Optional: Add logic for allowed status transitions here if needed
				returnRequest.status = status;
				returnRequest.reviewedBy = userId; // Track who made the change
				returnRequest.reviewDate = new Date();
				needsSave = true;
				notificationDetails = {
					newStatus: status,
					previousStatus: returnRequest.status,
				}; // For notification later
			}
			if (
				staffComments !== undefined &&
				staffComments !== returnRequest.staffComments
			) {
				returnRequest.staffComments = staffComments;
				needsSave = true;
			}

			// --- Update Individual Return Items (Transaction Recommended) ---
			if (
				itemsToUpdate &&
				Array.isArray(itemsToUpdate) &&
				itemsToUpdate.length > 0
			) {
				const session = await mongoose.startSession();
				session.startTransaction();
				try {
					for (const itemUpdate of itemsToUpdate) {
						const {
							returnItemId,
							quantityReceived,
							itemCondition,
							disposition,
							returnTrackingNumber,
							shippingLabelUrl,
						} = itemUpdate;
						if (!returnItemId || !mongoose.Types.ObjectId.isValid(returnItemId))
							continue;

						const returnItem = await ReturnItem.findOne({
							_id: returnItemId,
							returnRequestId: id,
						}).session(session);
						if (!returnItem) {
							throw new Error(
								`Return item ${returnItemId} not found or does not belong to request ${id}.`
							);
						}

						let itemChanged = false;
						let inventoryUpdateRequired = false;
						let inventoryDispositionAction: "increment" | "none" = "none";
						let quantityToUpdateInventory = 0;

						// Update fields if provided and changed
						if (
							quantityReceived !== undefined &&
							quantityReceived !== returnItem.quantityReceived
						) {
							if (
								quantityReceived < 0 ||
								quantityReceived > returnItem.quantityRequested
							) {
								throw new Error(
									`Invalid quantity received (${quantityReceived}) for item ${returnItemId}. Requested: ${returnItem.quantityRequested}.`
								);
							}
							returnItem.quantityReceived = quantityReceived;
							returnItem.receivedDate = new Date();
							itemChanged = true;
							// If quantity received, mark main request as ITEMS_RECEIVED if not already further along
							if (
								![
									ReturnRequestStatus.PROCESSING,
									ReturnRequestStatus.RESOLUTION_PENDING,
									ReturnRequestStatus.COMPLETED,
								].includes(returnRequest.status)
							) {
								returnRequest.status = ReturnRequestStatus.ITEMS_RECEIVED;
								needsSave = true; // Mark parent for saving
							}
						}
						if (itemCondition && itemCondition !== returnItem.itemCondition) {
							if (!Object.values(ItemCondition).includes(itemCondition))
								throw new Error(`Invalid item condition: ${itemCondition}`);
							returnItem.itemCondition = itemCondition;
							returnItem.conditionAssessedBy = userId;
							returnItem.conditionAssessmentDate = new Date();
							itemChanged = true;
						}
						if (disposition && disposition !== returnItem.disposition) {
							if (!Object.values(ReturnDisposition).includes(disposition))
								throw new Error(`Invalid disposition: ${disposition}`);
							returnItem.disposition = disposition;
							returnItem.dispositionSetBy = userId;
							returnItem.dispositionDate = new Date();
							itemChanged = true;
							inventoryUpdateRequired = true; // Disposition potentially affects inventory

							if (disposition === ReturnDisposition.RESTOCK) {
								// Condition check for restocking
								if (
									![
										ItemCondition.NEW_IN_BOX,
										ItemCondition.LIKE_NEW_OPEN_BOX,
									].includes(returnItem.itemCondition as ItemCondition)
								) {
									console.warn(
										`Attempted to restock item ${returnItem.productId} (condition: ${returnItem.itemCondition}). Setting disposition to Quarantine instead.`
									);
									returnItem.disposition = ReturnDisposition.QUARANTINE; // Override if condition unsuitable
								} else {
									inventoryDispositionAction = "increment";
									quantityToUpdateInventory = returnItem.quantityReceived ?? 0; // Use received quantity
								}
							}
							// Add logic for other dispositions if they affect different stock counts (e.g., quarantine stock)
						}
						if (
							returnTrackingNumber !== undefined &&
							returnTrackingNumber !== returnItem.returnTrackingNumber
						) {
							returnItem.returnTrackingNumber = returnTrackingNumber;
							itemChanged = true;
						}
						if (
							shippingLabelUrl !== undefined &&
							shippingLabelUrl !== returnItem.shippingLabelUrl
						) {
							returnItem.shippingLabelUrl = shippingLabelUrl;
							itemChanged = true;
						}

						// --- Inventory Update Logic ---
						if (
							inventoryUpdateRequired &&
							inventoryDispositionAction === "increment" &&
							quantityToUpdateInventory > 0
						) {
							const inventoryItem = await Inventory.findById(
								returnItem.productId
							).session(session);
							if (!inventoryItem)
								throw new Error(
									`Inventory item ${returnItem.productId} not found for stock update.`
								);

							// Increment the main quantity field
							inventoryItem.quantity += quantityToUpdateInventory;
							await inventoryItem.save({ session });

							// Optionally: Notify supplier about restock?
							// await createNotification(...)
						}
						// --- End Inventory Update ---

						if (itemChanged) {
							await returnItem.save({ session });
						}
					} // End loop through itemsToUpdate

					await session.commitTransaction();
					needsSave = true; // Mark parent needs saving due to potential status change from item receipt
				} catch (error: any) {
					await session.abortTransaction();
					console.error("Return item update failed:", error);
					return NextResponse.json(
						{
							code: "UPDATE_ERROR",
							message: error.message || "Failed to update return items",
						},
						{ status: 500 }
					);
				} finally {
					session.endSession();
				}
			} // End if itemsToUpdate

			// --- Save Parent Request if Changed ---
			if (needsSave) {
				await returnRequest.save();
			}

			// --- Notification ---
			if (notificationDetails) {
				await createNotification(
					returnRequest.customerId.toString(), // Notify customer
					"GENERAL", // Or 'RETURN_UPDATE'
					`Return Request Updated (#${returnRequest.returnRequestNumber})`,
					`Status changed from ${notificationDetails.previousStatus} to ${notificationDetails.newStatus}. ${staffComments ? "Comments: " + staffComments : ""}`,
					{
						returnRequestId: returnRequest._id,
						newStatus: notificationDetails.newStatus,
					}
				);
			}

			// Refetch the fully updated request for the response
			const updatedReturnRequest = await ReturnRequest.findById(id)
				.populate("customerId", "name email")
				.populate({ path: "orderId", select: "orderNumber" })
				.populate({
					path: "returnItems",
					populate: {
						path: "productId",
						model: "Inventory",
						select: "name sku",
					},
				})
				.populate("reviewedBy", "name")
				.populate({
					path: "resolution",
					populate: { path: "resolvedBy", select: "name" },
				})
				.lean();

			return NextResponse.json(updatedReturnRequest);
		},
		"return_update",
		UPDATE_RATE_LIMIT
	);
}
