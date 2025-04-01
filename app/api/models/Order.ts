// app/api/models/Order.ts

import { addIdSupport } from "@/lib/utils";
import { mongoose } from "..";
import type { Order } from "@/lib/types";

const orderItemSchema = new mongoose.Schema({
	productId: {
		type: String,
		required: true,
	},
	quantity: {
		type: Number,
		required: true,
		min: 1,
	},
	price: {
		type: Number,
		required: true,
		min: 0,
	},
});

addIdSupport(orderItemSchema); 

// Define shipping address schema
const shippingAddressSchema = new mongoose.Schema({
	address1: { type: String },
	address2: { type: String },
	city: { type: String },
	state: { type: String },
	country: { type: String },
	postalCode: { type: String },
	phone: { type: String },
});

// Define payment method types
export enum PaymentMethod {
	STRIPE = "stripe",
	BLOCKCHAIN = "blockchain",
	MANUAL = "manual",
}

// Add ID support to order item schema
addIdSupport(orderItemSchema);

const orderSchema = new mongoose.Schema(
	{
		orderNumber: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		customerId: {
			type: String,
			required: true,
			index: true,
		},
		items: [orderItemSchema],
		totalAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		status: {
			type: String,
			enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
			default: "PENDING",
			index: true,
		},
		paid: {
			type: Boolean,
			default: false,
			index: true,
		},
		paymentMethod: {
			type: String,
			enum: Object.values(PaymentMethod),
			default: PaymentMethod.STRIPE,
			required: false,
		},
		paymentDetails: {
			provider: { type: String, required: false, default: "stripe" },
			transactionId: {
				type: String,
				required: false,
				default: null,
			},
			transactionHash: {
				type: String,
				required: false,
				default: null,
			},
			walletAddress: {
				type: String,
				required: false,
				default: null,
			},
			status: {
				type: String,
				required: false,
				default: null,
			},
			amount: Number,
			cardDetails: {
				last4: {
					type: String,
					default: "4242",
				},
				brand: {
					type: String,
					default: "visa",
				},
				expMonth: {
					type: String,
					default: "12",
				},
				expYear: {
					type: String,
					default: "2025",
				},
			},
			processedAt: Date,
		},
		shippingAddress: {
			type: shippingAddressSchema,
			required: false,
		},
		createdBy: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

// Add ID support to order schema
addIdSupport(orderSchema);

// Create indexes for common queries
orderSchema.index({ createdAt: -1 });
orderSchema.index({ customerId: 1, status: 1 });
orderSchema.index({ paid: 1, status: 1 });

// Auto-generate order number before saving
orderSchema.pre("save", async function (next) {
	if (this.isNew) {
		const count = await mongoose.models.Order.countDocuments();
		this.orderNumber = `ORD${String(count + 1).padStart(5, "0")}`;
	}
	next();
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
