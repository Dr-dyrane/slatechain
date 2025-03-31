// app/api/models/Transport.ts

import { addIdSupport } from "@/lib/utils";
import mongoose from "mongoose";

const transportSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			index: true,
		},
		type: {
			type: String,
			enum: ["TRUCK", "SHIP", "PLANE"],
			required: true,
			index: true,
		},
		capacity: {
			type: Number,
			required: true,
			min: 0,
		},
		currentLocation: {
			latitude: {
				type: Number,
				required: true,
			},
			longitude: {
				type: Number,
				required: true,
			},
		},
		status: {
			type: String,
			enum: ["AVAILABLE", "IN_TRANSIT", "MAINTENANCE"],
			default: "AVAILABLE",
			index: true,
		},
		carrierId: {
			type: String,
			required: true,
			index: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
	},
	{
		timestamps: true,
	}
);

addIdSupport(transportSchema);

export default mongoose.models.Transport ||
	mongoose.model("Transport", transportSchema);
