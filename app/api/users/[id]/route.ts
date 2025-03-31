// app/api/users/[id]/route.ts

import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "../../index";
import { withRateLimit } from "@/lib/utils";
import User from "../../models/User";
import { UserRole } from "@/lib/types";
import bcrypt from "bcryptjs";

// PUT /api/users/[id] - Update a user
export async function PUT(
	req: Request,
	{ params }: { params: { id: string } }
) {
	const { headers, limited } = await withRateLimit(req, "update_user", 20);
	const { id } = await params;

	if (limited) {
		return NextResponse.json(
			{
				code: "RATE_LIMIT",
				message: "Too many requests. Please try again later.",
			},
			{ status: 429, headers }
		);
	}

	try {
		await connectToDatabase();

		// Verify authentication token
		const authorization = req.headers.get("Authorization");
		if (!authorization?.startsWith("Bearer ")) {
			return NextResponse.json(
				{ code: "NO_TOKEN", message: "Authentication required" },
				{ status: 401, headers }
			);
		}

		const token = authorization.split(" ")[1];
		const decoded = verifyAccessToken(token);

		if (!decoded) {
			return NextResponse.json(
				{ code: "INVALID_TOKEN", message: "Invalid or expired token" },
				{ status: 401, headers }
			);
		}

		// Verify admin role or self-update
		const admin = await User.findById(decoded.userId);
		if (!admin || (admin.role !== UserRole.ADMIN && decoded.userId !== id)) {
			return NextResponse.json(
				{ code: "FORBIDDEN", message: "Unauthorized access" },
				{ status: 403, headers }
			);
		}

		const body = await req.json();
		const { password, email, role, address, ...updateData } = body;

		// Find user to update
		const user = await User.findById(id);
		if (!user) {
			return NextResponse.json(
				{ code: "NOT_FOUND", message: "User not found" },
				{ status: 404, headers }
			);
		}

		// Only admins can update role
		if (role && admin.role === UserRole.ADMIN) {
			user.role = role;
		}

		// Update email if provided and different
		if (email && email !== user.email) {
			const existingUser = await User.findOne({ email });
			if (existingUser) {
				return NextResponse.json(
					{ code: "EMAIL_EXISTS", message: "Email already in use" },
					{ status: 400, headers }
				);
			}
			user.email = email;
			user.isEmailVerified = false; // Reset email verification
		}

		// Update password if provided
		if (password) {
			user.password = await bcrypt.hash(password, 10);
		}

		// Update address if provided
		if (address) {
			user.address = address;
		}

		// Update other fields
		Object.assign(user, updateData);

		await user.save();

		return NextResponse.json({ user: user.toAuthJSON() }, { headers });
	} catch (error) {
		console.error("Update User Error:", error);
		return NextResponse.json(
			{ code: "SERVER_ERROR", message: "Failed to update user" },
			{ status: 500, headers }
		);
	}
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(
	req: Request,
	{ params }: { params: { id: string } }
) {
	const { headers, limited } = await withRateLimit(req, "delete_user", 10);
	const { id } = await params;

	if (limited) {
		return NextResponse.json(
			{
				code: "RATE_LIMIT",
				message: "Too many requests. Please try again later.",
			},
			{ status: 429, headers }
		);
	}

	try {
		await connectToDatabase();

		// Verify authentication token
		const authorization = req.headers.get("Authorization");
		if (!authorization?.startsWith("Bearer ")) {
			return NextResponse.json(
				{ code: "NO_TOKEN", message: "Authentication required" },
				{ status: 401, headers }
			);
		}

		const token = authorization.split(" ")[1];
		const decoded = verifyAccessToken(token);

		if (!decoded) {
			return NextResponse.json(
				{ code: "INVALID_TOKEN", message: "Invalid or expired token" },
				{ status: 401, headers }
			);
		}

		// Verify admin role
		const admin = await User.findById(decoded.userId);
		if (!admin || admin.role !== UserRole.ADMIN) {
			return NextResponse.json(
				{ code: "FORBIDDEN", message: "Admin access required" },
				{ status: 403, headers }
			);
		}

		// Prevent self-deletion
		if (decoded.userId === id) {
			return NextResponse.json(
				{
					code: "INVALID_OPERATION",
					message: "Cannot delete your own account",
				},
				{ status: 400, headers }
			);
		}

		// Find and delete user
		const user = await User.findByIdAndDelete(id);
		if (!user) {
			return NextResponse.json(
				{ code: "NOT_FOUND", message: "User not found" },
				{ status: 404, headers }
			);
		}

		return NextResponse.json(
			{ success: true, message: "User deleted successfully" },
			{ headers }
		);
	} catch (error) {
		console.error("Delete User Error:", error);
		return NextResponse.json(
			{ code: "SERVER_ERROR", message: "Failed to delete user" },
			{ status: 500, headers }
		);
	}
}
