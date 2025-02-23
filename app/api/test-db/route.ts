// app/api/test-db/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../index";

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({
      success: true,
      message: "MongoDB Connected Successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("API Route Error:", error);
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

