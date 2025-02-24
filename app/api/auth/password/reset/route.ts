// app/api/auth/password/reset/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../index";
import User from "@/app/api/models/User";
import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = Redis.fromEnv();

export async function POST(req: Request) {
	try {
		await connectToDatabase();

		const { code, newPassword } = await req.json();

		// Verify reset code from Redis
		const userId = await redis.get(`pwd_reset:${code}`);
		if (!userId) {
			return NextResponse.json(
				{ error: "Invalid or expired reset code" },
				{ status: 400 }
			);
		}

		// Find user
		const user = await User.findById(userId);
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Update password
		user.password = newPassword;
		await user.save();

		// Delete used reset code
		await redis.del(`pwd_reset:${code}`);

		return NextResponse.json({ message: "Password reset successful" });
	} catch (error) {
		console.error("Password Reset Error:", error);
		return NextResponse.json(
			{ error: "Failed to reset password" },
			{ status: 500 }
		);
	}
}
