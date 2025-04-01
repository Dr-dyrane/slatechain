// app/api/models/Freight.ts

import mongoose from "mongoose";
import { FreightStatus, FreightTypes } from "@/lib/types";
import { addIdSupport } from "@/lib/utils";

// Create schema for stops
const stopSchema = new mongoose.Schema({
	location: String,
	scheduledTime: Date,
	actualTime: Date,
	type: String,
	notes: String,
});

// Add ID support to stop schema
addIdSupport(stopSchema);

// Create schema for documents
const freightDocumentSchema = new mongoose.Schema({
	type: String,
	number: String,
	url: String,
	issuedAt: Date,
});

// Add ID support to freight document schema
addIdSupport(freightDocumentSchema);

const freightSchema = new mongoose.Schema(
	{
		freightNumber: {
			type: String,
			required: false,
			unique: true,
			index: true,
		},
		type: {
			type: String,
			required: true,
			enum: Object.values(FreightTypes),
			index: true,
		},
		status: {
			type: String,
			enum: Object.values(FreightStatus),
			default: FreightStatus.PENDING,
			index: true,
		},
		shipmentIds: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Shipment",
			},
		],
		carrierId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Carrier",
			required: true,
			index: true,
		},
		routeId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Route",
			required: true,
			index: true,
		},
		vehicle: {
			type: {
				type: String,
				enum: ["TRUCK", "TRAIN", "PLANE", "SHIP", "OTHER"],
			},
			identifier: String,
			capacity: {
				weight: Number,
				volume: Number,
				units: Number,
			},
			driver: {
				name: String,
				phone: String,
				license: String,
			},
		},
		schedule: {
			departureDate: {
				type: Date,
				required: true,
			},
			arrivalDate: {
				type: Date,
				required: true,
			},
			actualDeparture: Date,
			actualArrival: Date,
			stops: [stopSchema],
		},
		cargo: {
			totalWeight: Number,
			totalVolume: Number,
			units: Number,
			hazmat: Boolean,
			temperature: {
				required: Boolean,
				min: Number,
				max: Number,
				unit: String,
			},
		},
		documents: [freightDocumentSchema],
		cost: {
			baseRate: Number,
			fuelSurcharge: Number,
			otherCharges: Number,
			currency: String,
			total: Number,
		},
		tracking: {
			number: String,
			url: String,
			lastUpdate: Date,
			location: String,
			status: String,
		},
		notes: String,
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		currentLocation: {
			latitude: Number,
			longitude: Number,
		},
	},
	{
		timestamps: true,
	}
);

// Add ID support to freight schema
addIdSupport(freightSchema);

// Create indexes for common queries
freightSchema.index({ createdAt: -1 });
freightSchema.index({ "schedule.departureDate": 1, status: 1 });
freightSchema.index({ shipmentIds: 1 });

// Auto-generate freight number before saving
freightSchema.pre("save", async function (next) {
	if (this.isNew) {
		const count = await mongoose.models.Freight.countDocuments();
		this.freightNumber = `FRT${String(count + 1).padStart(6, "0")}`;
	}
	next();
});

// Calculate totals before saving
freightSchema.pre("save", function (next) {
	if (this.cost) {
		this.cost.total =
			(this.cost.baseRate || 0) +
			(this.cost.fuelSurcharge || 0) +
			(this.cost.otherCharges || 0);
	}
	next();
});

export default mongoose.models.Freight ||
	mongoose.model("Freight", freightSchema);
