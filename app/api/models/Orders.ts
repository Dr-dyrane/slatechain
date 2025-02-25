// api/models/Orders.ts

import { mongoose } from ".."

// Order item schema
const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  name: { type: String },
  sku: { type: String },
  imageUrl: { type: String },
})

// Address schema
const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String },
})

// Payment details schema
const paymentDetailsSchema = new mongoose.Schema({
  method: { type: String, required: true },
  transactionId: { type: String },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, default: "completed" },
})

// Order schema
const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customerId: {
      type: String,
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [
        {
          validator: (items: any[]) => items.length > 0,
          message: "Order must have at least one item",
        },
      ],
    },
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
    shippingAddress: addressSchema,
    billingAddress: addressSchema,
    paymentDetails: paymentDetailsSchema,
    notes: { type: String },
    createdBy: { type: String, required: true },
    updatedBy: { type: String },
  },
  {
    timestamps: true,
  },
)

// Create indexes for common queries
orderSchema.index({ createdAt: -1 })
orderSchema.index({ customerId: 1, createdAt: -1 })
orderSchema.index({ status: 1, paid: 1 })

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema)

export default Order

