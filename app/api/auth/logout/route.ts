// app/api/auth/logout/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../index";
import User from "@/app/api/models/User";

export async function POST(req: Request) {
	try {
		await connectToDatabase();

		const { refreshToken } = await req.json();

		// Clear refresh token from user
		await User.updateOne({ refreshToken }, { $set: { refreshToken: null } });

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Logout Error:", error);
		return NextResponse.json({ error: "Logout failed" }, { status: 500 });
	}
}
