// app/api/index.ts

import mongoose from "mongoose";

// Type declaration for global mongoose instance
declare global {
	var mongoose: {
		conn: typeof mongoose | null;
		promise: Promise<typeof mongoose> | null;
	};
}

// Initialize global mongoose object if it doesn't exist
if (!global.mongoose) {
	global.mongoose = {
		conn: null,
		promise: null,
	};
}

const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI;

if (!MONGODB_URI) {
	throw new Error(
		"Please define the NEXT_PUBLIC_MONGODB_URI environment variable inside .env.local"
	);
}

/**
 * Global connection handler for MongoDB
 * Implements connection caching to prevent multiple connections
 */
export async function connectToDatabase() {
	try {
		if (global.mongoose.conn) {
			console.log("🟢 Using existing MongoDB connection");
			return global.mongoose.conn;
		}

		if (!global.mongoose.promise) {
			const opts = {
				bufferCommands: false,
				maxPoolSize: 10,
				serverSelectionTimeoutMS: 5000,
				socketTimeoutMS: 45000,
			};

			global.mongoose.promise = mongoose.connect(MONGODB_URI, opts);
		}

		global.mongoose.conn = await global.mongoose.promise;
		console.log("🟢 New MongoDB connection established");
		return global.mongoose.conn;
	} catch (error) {
		console.error("🔴 MongoDB Connection Error:", error);
		global.mongoose.promise = null;
		throw error;
	}
}

/**
 * Disconnect from MongoDB
 * Useful for testing and cleanup
 */
export async function disconnectFromDatabase() {
	try {
		if (global.mongoose.conn) {
			await global.mongoose.conn.disconnect();
			global.mongoose.conn = null;
			global.mongoose.promise = null;
			console.log("🟡 Disconnected from MongoDB");
		}
	} catch (error) {
		console.error("🔴 MongoDB Disconnection Error:", error);
		throw error;
	}
}

// Export mongoose instance for model definitions
export { mongoose };
