// app/api/test-db/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "..";


export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({ message: "✅ MongoDB Connected!" });
  } catch (error) {
    return NextResponse.json({ error: "❌ MongoDB Connection Failed" }, { status: 500 });
  }
}
