import { type NextRequest, NextResponse } from "next/server";
import { handleRequest } from "@/app/api";
import User from "@/app/api/models/User";

const SCHEDULER_RATE_LIMIT = 10;

// POST /api/scheduler/jobs - Create a new scheduled job
export async function POST(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Get request body
			const jobData = await req.json();

			// Validate required fields
			if (
				!jobData.jobType ||
				!jobData.category ||
				!jobData.service ||
				!jobData.syncType ||
				!jobData.frequency
			) {
				return NextResponse.json(
					{
						success: false,
						code: "INVALID_INPUT",
						message: "Missing required fields",
					},
					{ status: 400 }
				);
			}

			// Fetch user
			const user = await User.findById(userId);
			if (!user) {
				return NextResponse.json(
					{
						success: false,
						code: "USER_NOT_FOUND",
						message: "User not found",
					},
					{ status: 404 }
				);
			}

			// Create the scheduled job
			const job = {
				userId,
				jobType: jobData.jobType,
				category: jobData.category,
				service: jobData.service,
				syncType: jobData.syncType,
				frequency: jobData.frequency,
				startTime: jobData.startTime || new Date().toISOString(),
				status: jobData.status || "SCHEDULED",
				createdAt: new Date().toISOString(),
			};

			// In a real implementation, we would store this in a database
			// For now, we'll update the user's metadata
			if (!user.metadata) {
				user.metadata = {};
			}

			if (!user.metadata.scheduledJobs) {
				user.metadata.scheduledJobs = [];
			}

			user.metadata.scheduledJobs.push(job);
			await user.save();

			return NextResponse.json({
				success: true,
				job,
				message: "Scheduled job created successfully",
			});
		},
		"scheduler_create_job",
		SCHEDULER_RATE_LIMIT
	);
}

// GET /api/scheduler/jobs - Get all scheduled jobs for a user
export async function GET(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			// Fetch user
			const user = await User.findById(userId);
			if (!user) {
				return NextResponse.json(
					{
						success: false,
						code: "USER_NOT_FOUND",
						message: "User not found",
					},
					{ status: 404 }
				);
			}

			// Get scheduled jobs from user metadata
			const scheduledJobs = user.metadata?.scheduledJobs || [];

			return NextResponse.json({
				success: true,
				jobs: scheduledJobs,
			});
		},
		"scheduler_get_jobs",
		SCHEDULER_RATE_LIMIT
	);
}
