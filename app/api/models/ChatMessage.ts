// app/api/models/ChatMessage.ts
import mongoose from "mongoose";
import { addIdSupport } from "@/lib/utils";

const chatMessageSchema = new mongoose.Schema(
	{
		supplierId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Supplier",
			required: true,
			index: true,
		},
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		senderName: {
			type: String,
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

// Add ID support to chat message schema
addIdSupport(chatMessageSchema);

// Create indexes for common queries
chatMessageSchema.index({ supplierId: 1, createdAt: -1 });
chatMessageSchema.index({ senderId: 1, createdAt: -1 });

export default mongoose.models.ChatMessage ||
	mongoose.model("ChatMessage", chatMessageSchema);
