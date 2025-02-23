import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
	throw new Error("Please define the MONGO_URI environment variable");
}

const connectDB = async () => {
	try {
		if (mongoose.connection.readyState >= 1) {
			console.log("Already connected to MongoDB");
			return;
		}

		await mongoose.connect(MONGO_URI);
		console.log("✅ MongoDB Connected Successfully");
	} catch (error) {
		console.error("❌ MongoDB Connection Error:", error);
		process.exit(1);
	}
};

export default connectDB;
