// app/api/avatars/upload/route.ts

import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { withRateLimit } from "@/lib/utils";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import { connectToDatabase } from "../..";

// Create a GridFS bucket for file storage
let bucket: GridFSBucket | null = null;

// Initialize the GridFS bucket
async function initBucket() {
	try {
		if (!bucket) {
			await connectToDatabase();

			// Check if the connection has a database instance
			if (!mongoose.connection.db) {
				throw new Error("Database connection not established");
			}

			bucket = new GridFSBucket(mongoose.connection.db, {
				bucketName: "avatars",
			});
		}
		return bucket;
	} catch (error) {
		console.error("Error initializing GridFS bucket:", error);
		throw error;
	}
}

// Create Avatar model schema
const AvatarSchema = new mongoose.Schema({
	filename: String,
	contentType: String,
	length: Number,
	uploadDate: { type: Date, default: Date.now },
	fileId: mongoose.Schema.Types.ObjectId,
	userId: String,
});

// Get or create the Avatar model
let Avatar: mongoose.Model<any>;
try {
	Avatar = mongoose.model("Avatar");
} catch (e) {
	Avatar = mongoose.model("Avatar", AvatarSchema);
}

export async function POST(req: Request) {
	// Rate limit: 5 uploads per hour
	const { headers, limited } = await withRateLimit(
		req,
		"avatar_upload",
		5,
		60 * 60 * 1000
	);

	if (limited) {
		return NextResponse.json(
			{
				code: "RATE_LIMIT",
				message: "Too many avatar upload attempts. Please try again later.",
			},
			{ status: 429, headers }
		);
	}

	try {
		// Get and verify token
		const authorization = req.headers.get("Authorization");
		if (!authorization || !authorization.startsWith("Bearer ")) {
			return NextResponse.json(
				{
					code: "NO_TOKEN",
					message: "Authentication required",
				},
				{ status: 401, headers }
			);
		}

		const token = authorization.split(" ")[1];
		const decoded = verifyAccessToken(token);

		if (!decoded) {
			return NextResponse.json(
				{
					code: "INVALID_TOKEN",
					message: "Invalid or expired token",
				},
				{ status: 401, headers }
			);
		}

		const userId = decoded.userId;

		// Parse the multipart form data
		const formData = await req.formData();
		const avatarFile = formData.get("avatar") as File;

		if (!avatarFile) {
			return NextResponse.json(
				{
					code: "NO_FILE",
					message: "No avatar file provided",
				},
				{ status: 400, headers }
			);
		}

		// Validate file type
		const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
		if (!validTypes.includes(avatarFile.type)) {
			return NextResponse.json(
				{
					code: "INVALID_FILE_TYPE",
					message:
						"Invalid file type. Please upload a JPEG, PNG, GIF, or WEBP image.",
				},
				{ status: 400, headers }
			);
		}

		// Validate file size (max 5MB)
		if (avatarFile.size > 5 * 1024 * 1024) {
			return NextResponse.json(
				{
					code: "FILE_TOO_LARGE",
					message: "File too large. Maximum size is 5MB.",
				},
				{ status: 400, headers }
			);
		}

		// Initialize GridFS bucket
		const gridFSBucket = await initBucket();

		// Find previous avatar for this user
		const previousAvatar = await Avatar.findOne({ userId });

		// Delete previous avatar file if exists
		if (previousAvatar && previousAvatar.fileId) {
			try {
				await gridFSBucket.delete(previousAvatar.fileId);
			} catch (error) {
				console.error("Error deleting previous avatar:", error);
				// Continue even if deletion fails
			}
		}

		// Create a unique filename
		const filename = `${userId}-${Date.now()}-${avatarFile.name}`;

		// Convert File to Buffer
		const arrayBuffer = await avatarFile.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Use a different approach for uploading the file
		// Instead of using the stream API directly, we'll use a more reliable method
		let fileId: mongoose.Types.ObjectId;

		try {
			// Create upload stream
			const uploadStream = gridFSBucket.openUploadStream(filename, {
				contentType: avatarFile.type,
				metadata: {
					userId,
					uploadDate: new Date(),
				},
			});

			// Get the ID before writing to the stream
			fileId = uploadStream.id;

			// Write the buffer to the stream
			uploadStream.write(buffer);

			// End the stream and wait for it to finish
			await new Promise<void>((resolve, reject) => {
				uploadStream.end((error: any) => {
					if (error) {
						reject(error);
					} else {
						resolve();
					}
				});
			});
		} catch (error: any) {
			console.error("Error during file upload:", error);
			throw new Error(`File upload failed: ${error.message}`);
		}

		if (!fileId) {
			throw new Error("File upload failed. No file ID generated.");
		}

		// Create or update avatar record
		if (previousAvatar) {
			previousAvatar.filename = filename;
			previousAvatar.contentType = avatarFile.type;
			previousAvatar.length = avatarFile.size;
			previousAvatar.uploadDate = new Date();
			previousAvatar.fileId = fileId;
			await previousAvatar.save();
		} else {
			await Avatar.create({
				filename,
				contentType: avatarFile.type,
				length: avatarFile.size,
				uploadDate: new Date(),
				fileId,
				userId,
			});
		}

		// Generate avatar URL
		const avatarUrl = `/api/avatars/${fileId.toString()}`;

		return NextResponse.json(
			{
				code: "SUCCESS",
				message: "Avatar uploaded successfully",
				avatarUrl,
			},
			{ headers }
		);
	} catch (error: any) {
		console.error("Avatar Upload Error:", error);
		return NextResponse.json(
			{
				code: "SERVER_ERROR",
				message: error.message || "Failed to upload avatar",
			},
			{ status: 500, headers }
		);
	}
}
