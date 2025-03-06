// app/api/models/Route.ts

import mongoose from "mongoose";
import { RouteStatus, RouteType } from "@/lib/types";
import { addIdSupport } from "@/lib/utils";

const waypointSchema = new mongoose.Schema({
	type: {
		type: String,
		enum: ["PICKUP", "DELIVERY", "STOP"],
		required: true,
	},
	location: {
		address: String,
		city: String,
		state: String,
		country: String,
		postalCode: String,
		coordinates: {
			latitude: Number,
			longitude: Number,
		},
	},
	scheduledTime: Date,
	estimatedTime: Date,
	actualTime: Date,
	notes: String,
});

const routeSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			index: true,
		},
		startLocation: {
			type: String,
			required: true,
		},
		endLocation: {
			type: String,
			required: true,
		},
		distance: {
			type: Number,
			required: true,
			min: 0,
		},
		estimatedDuration: {
			type: Number,
			required: true,
			min: 0,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		routeNumber: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		type: {
			type: String,
			enum: Object.values(RouteType),
			required: true,
			index: true,
		},
		status: {
			type: String,
			enum: Object.values(RouteStatus),
			default: RouteStatus.PLANNED,
			index: true,
		},
		origin: {
			type: waypointSchema,
			required: true,
		},
		destination: {
			type: waypointSchema,
			required: true,
		},
		waypoints: [waypointSchema],
		distanceOld: {
			value: Number,
			unit: String,
		},
		durationOld: {
			value: Number,
			unit: String,
		},
		restrictions: {
			weight: {
				max: Number,
				unit: String,
			},
			height: {
				max: Number,
				unit: String,
			},
			width: {
				max: Number,
				unit: String,
			},
			length: {
				max: Number,
				unit: String,
			},
			hazmat: Boolean,
			temperature: {
				min: Number,
				max: Number,
				unit: String,
			},
		},
		schedule: {
			startDate: {
				type: Date,
				required: true,
			},
			endDate: {
				type: Date,
				required: true,
			},
			frequency: String,
			days: [Number],
		},
		carriers: [
			{
				carrierId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Carrier",
				},
				priority: Number,
			},
		],
		cost: {
			baseRate: Number,
			additionalCharges: Number,
			currency: String,
			total: Number,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

// Add ID support to route schema
addIdSupport(routeSchema);

// Create indexes for common queries
routeSchema.index({ startLocation: 1, endLocation: 1 });
routeSchema.index({
	"origin.location.city": 1,
	"destination.location.city": 1,
});
routeSchema.index({ "schedule.startDate": 1, status: 1 });
routeSchema.index({ "carriers.carrierId": 1 });

// Auto-generate route number before saving
routeSchema.pre("save", async function (next) {
	if (this.isNew) {
		const count = await mongoose.models.Route.countDocuments();
		this.routeNumber = `RTE${String(count + 1).padStart(6, "0")}`;
	}
	next();
});

// Calculate total cost before saving
routeSchema.pre("save", function (next) {
	if (this.cost) {
		this.cost.total =
			(this.cost.baseRate || 0) + (this.cost.additionalCharges || 0);
	}
	next();
});

export default mongoose.models.Route || mongoose.model("Route", routeSchema);
