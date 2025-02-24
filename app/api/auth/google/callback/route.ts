// app/api/auth/google/callback/route.ts

import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(
  process.env.NEXT_GOOGLE_CLIENT_ID,
  process.env.NEXT_GOOGLE_CLIENT_SECRET,
  process.env.NEXT_GOOGLE_CALLBACK_URL
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    // Exchange the code for access and ID tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Fetch user info
    const userInfo = await client.request({
      url: "https://www.googleapis.com/oauth2/v2/userinfo",
    });

    return NextResponse.json({ user: userInfo.data, tokens }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
