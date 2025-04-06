// app/api/avatars/[id]/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../..";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

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

export async function GET(
	req: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = await params;
		const fileId = id;

		if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
			return NextResponse.json(
				{
					code: "INVALID_ID",
					message: "Invalid file ID",
				},
				{ status: 400 }
			);
		}

		// Initialize GridFS bucket
		const gridFSBucket = await initBucket();

		// Ensure mongoose is defined and the connection is established
		if (!mongoose || !mongoose.connection || !mongoose.connection.db) {
			return NextResponse.json(
				{
					code: "DB_CONNECTION_ERROR",
					message: "Database connection not established or unavailable.",
				},
				{ status: 500 }
			);
		}

		// Find the file by ID
		const files = await mongoose?.connection?.db
			.collection("avatars.files")
			.find({ _id: new mongoose.Types.ObjectId(fileId) })
			.toArray();

		if (!files || files.length === 0) {
			return NextResponse.json(
				{
					code: "FILE_NOT_FOUND",
					message: "File not found",
				},
				{ status: 404 }
			);
		}

		const file = files[0];

		// Create a download stream
		const downloadStream = gridFSBucket.openDownloadStream(
			new mongoose.Types.ObjectId(fileId)
		);

		// Collect the file data
		const chunks: Buffer[] = [];

		// Create a promise to handle the download
		const downloadPromise = new Promise<Buffer>((resolve, reject) => {
			downloadStream.on("error", (error) => {
				reject(error);
			});

			downloadStream.on("data", (chunk) => {
				chunks.push(chunk);
			});

			downloadStream.on("end", () => {
				const buffer = Buffer.concat(chunks);
				resolve(buffer);
			});
		});

		// Wait for the download to complete
		const buffer = await downloadPromise;

		// Create a response with the appropriate content type
		const response = new NextResponse(buffer, {
			status: 200,
			headers: {
				"Content-Type": file.contentType || "application/octet-stream",
				"Content-Length": buffer.length.toString(),
				"Cache-Control": "public, max-age=31536000", // Cache for 1 year
			},
		});

		return response;
	} catch (error) {
		console.error("Avatar Fetch Error:", error);
		return NextResponse.json(
			{
				code: "SERVER_ERROR",
				message: "Failed to fetch avatar",
			},
			{ status: 500 }
		);
	}
}
