// app/api/models/ReturnItem.ts
import { mongoose } from "..";
import { addIdSupport } from "@/lib/utils";
import { ItemCondition, ReturnDisposition } from "@/lib/types";
import type { ReturnItem as ReturnItemType } from "@/lib/types";

const returnItemSchema = new mongoose.Schema(
  {
    returnRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "ReturnRequest", required: true, index: true },
    // CRITICAL: Link to the specific sub-document ID within the Order's items array.
    // Mongoose doesn't directly support ref to sub-doc this way. Store the OrderItem's _id.
    orderItemId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory", required: true }, // Refers to your Inventory model
    quantityRequested: { type: Number, required: true, min: 1 },
    quantityReceived: { type: Number, min: 0 },
    receivedDate: { type: Date },
    itemCondition: { type: String, enum: Object.values(ItemCondition) },
    conditionAssessedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    conditionAssessmentDate: { type: Date },
    disposition: { type: String, enum: Object.values(ReturnDisposition), index: true }, // Index for querying by disposition
    dispositionSetBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    dispositionDate: { type: Date },
    returnTrackingNumber: { type: String },
    shippingLabelUrl: { type: String },
  },
  {
      timestamps: false, // Less relevant here, maybe add if needed
      toJSON: { virtuals: true },
      toObject: { virtuals: true }
  }
);

addIdSupport(returnItemSchema);

// Optional virtual for product details
returnItemSchema.virtual('product', {
  ref: 'Inventory', // Your Inventory model name
  localField: 'productId',
  foreignField: '_id',
  justOne: true
});


const ReturnItem = mongoose.models.ReturnItem || mongoose.model<ReturnItemType>("ReturnItem", returnItemSchema);
export default ReturnItem;
