// app/api/index.ts

import mongoose from "mongoose";

interface GlobalMongoose {
	conn: typeof mongoose | null;
	promise: Promise<typeof mongoose> | null;
}

// Declare global mongoose type
declare global {
	var mongooseInstance: GlobalMongoose | undefined;
}

const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI;

if (!MONGODB_URI) {
	throw new Error(
		"Please define the MONGODB_URI environment variable inside .env.local"
	);
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongooseInstance;

if (!cached) {
	cached = global.mongooseInstance = { conn: null, promise: null };
}

export async function connectToDatabase() {
	if (cached?.conn) {
		console.log("🟢 Using existing connection");
		return cached.conn;
	}

	if (!cached?.promise) {
		const opts = {
			bufferCommands: false,
			maxPoolSize: 10,
		};

		cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
			return mongoose;
		});
	}

	try {
		cached!.conn = await cached?.promise;
		console.log("🟢 New connection established");
		return cached!.conn;
	} catch (e) {
		cached!.promise = null;
		throw e;
	}
}

export async function disconnectFromDatabase() {
	if (cached?.conn) {
		await mongoose.disconnect();
		cached.conn = null;
		cached.promise = null;
		console.log("🟡 Disconnected from database");
	}
}

// Export mongoose for model definitions
export { mongoose };
