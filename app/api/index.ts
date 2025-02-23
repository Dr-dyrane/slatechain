import mongoose from "mongoose";

// Define the type for our cached mongoose instance
interface MongooseCache {
	conn: typeof mongoose | null;
	promise: Promise<typeof mongoose> | null;
}

// Declare the global type
declare global {
	var mongooseCache: MongooseCache;
}

// Initialize the global cache if it doesn't exist
if (!global.mongooseCache) {
	global.mongooseCache = {
		conn: null,
		promise: null,
	};
}

const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI as string;

if (!MONGODB_URI) {
	throw new Error(
		"Please define the MONGODB_URI environment variable inside .env.local"
	);
}

export async function connectToDatabase(): Promise<typeof mongoose> {
	// If we have a connection, return it
	if (global.mongooseCache.conn) {
		console.log("🟢 Using existing connection");
		return global.mongooseCache.conn;
	}

	// If we don't have a promise to connect, create one
	if (!global.mongooseCache.promise) {
		const opts = {
			bufferCommands: false,
			maxPoolSize: 10,
		};

		global.mongooseCache.promise = mongoose.connect(MONGODB_URI, opts);
	}

	try {
		// Await the connection
		const mongoose = await global.mongooseCache.promise;
		global.mongooseCache.conn = mongoose;
		console.log("🟢 New connection established");
		return mongoose;
	} catch (e) {
		// If connection fails, clear the promise so we can try again
		global.mongooseCache.promise = null;
		throw e;
	}
}

export async function disconnectFromDatabase(): Promise<void> {
	if (global.mongooseCache.conn) {
		await mongoose.disconnect();
		global.mongooseCache.conn = null;
		global.mongooseCache.promise = null;
		console.log("🟡 Disconnected from database");
	}
}

// Export mongoose for model definitions
export { mongoose };
