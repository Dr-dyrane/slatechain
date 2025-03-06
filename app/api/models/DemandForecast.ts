// app/api/models/DemandForecast.ts

import mongoose from "mongoose";
import { addIdSupport } from "@/lib/utils";

const forecastParameterSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	value: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
	},
	description: String,
});

// Add ID support to forecast parameter schema
addIdSupport(forecastParameterSchema);

const demandForecastSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			index: true,
		},
		inventoryItemId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Inventory",
			required: true,
			index: true,
		},
		forecastDate: {
			type: Date,
			required: true,
			index: true,
		},
		quantity: {
			type: Number,
			required: true,
			min: 0,
		},
		confidenceIntervalUpper: {
			type: Number,
			required: true,
			min: 0,
		},
		confidenceIntervalLower: {
			type: Number,
			required: true,
			min: 0,
		},
		algorithmUsed: {
			type: String,
			required: true,
			enum: [
				"ARIMA",
				"Exponential Smoothing",
				"Moving Average",
				"Linear Regression",
				"Machine Learning",
			],
		},
		parameters: [forecastParameterSchema],
		notes: String,
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			index: true,
		},
	},
	{
		timestamps: true,
	}
);

// Add ID support to demand forecast schema
addIdSupport(demandForecastSchema);

// Create indexes for common queries
demandForecastSchema.index({ forecastDate: 1, inventoryItemId: 1 });
demandForecastSchema.index({ createdAt: -1 });

export default mongoose.models.DemandForecast ||
	mongoose.model("DemandForecast", demandForecastSchema);
