// app/api/test-db/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../index";

export async function GET() {
	try {
		await connectToDatabase();
		console.log(`
        😀😀😀😀😀😀😀😀😀😀
        😀 MongoDB Connected 😀
        😀 Successfully! 🚀 😀
        😀😀😀😀😀😀😀😀😀😀
      `);
		return NextResponse.json({
			success: true,
			message: `MongoDB Connected Successfully 🚀`,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error(
			`
        ❌❌❌❌❌❌❌❌❌❌
        ❌ MongoDB Connection ❌
        ❌ Failed! 💀🔥 ❌
        ❌❌❌❌❌❌❌❌❌❌
      `,
			error
		);
		return NextResponse.json(
			{
				success: false,
				error: "MongoDB Connection Failed",
				timestamp: new Date().toISOString(),
			},
			{ status: 500 }
		);
	}
}
