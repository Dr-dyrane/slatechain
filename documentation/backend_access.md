# Redefining Backend Access for Frontend Developers

## Introduction
This guide explains how frontend developers can seamlessly integrate backend logic within a Next.js app, eliminating the need for a separate backend server. It covers authentication, database interactions, and state management using slices.

## Technology Stack
- **Next.js (App Router)** – Handles both frontend and API logic
- **MongoDB** – Database for storing user data
- **Vercel** – Deployment platform
- **Redux Toolkit (Slices & Thunks)** – Manages state and API calls

## Architecture Overview
### Flow for Register/Login
1. **Frontend Page (app/login.tsx)** → Calls Redux slice.
2. **Redux Slice (lib/slices/auth.ts)** → Dispatches thunk for authentication.
3. **API Client (lib/api/apiClient.ts)** → Sends request to Next.js API route.
4. **API Route (app/api/auth/register.ts & login.ts)** → Handles database interactions.
5. **Database Logic (app/api/index.ts)** → Connects to MongoDB.
6. **Response** → Returns user session and token to Redux slice for state updates.

## Setting Up MongoDB
### Requirements:
- **MongoDB Connection URL** (Use MongoDB Atlas for free hosting)
- Store credentials in `.env.local`:
  ```env
  MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/myDatabase
  JWT_SECRET=your-secret-key
  ```

## Implementing API Routes
### Database Connection (app/api/index.ts)
```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

export const connectToDatabase = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
};
```

### Register API (app/api/auth/register.ts)
```typescript
import { connectToDatabase } from '../index';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  await connectToDatabase();
  const { email, password } = await req.json();
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashedPassword });
  return NextResponse.json({ user, token: 'mocked-jwt-token' });
}
```

### Login API (app/api/auth/login.ts)
```typescript
import { connectToDatabase } from '../index';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  await connectToDatabase();
  const { email, password } = await req.json();
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  return NextResponse.json({ user, token: 'mocked-jwt-token' });
}
```

## Optimizing for Vercel
1. **Use Edge-friendly API routes** → Prefer **serverless functions** over long-running connections.
2. **Persistent MongoDB connections** → Avoid reconnecting on every request.
3. **Environment Variables** → Use `process.env.MONGODB_URI` securely.
4. **Stateless Authentication** → JWT-based authentication is best suited for serverless environments.

## Conclusion
With this setup, frontend developers can access the database directly via Next.js API routes, leveraging Redux slices for state management. This approach eliminates the need for a separate backend while ensuring compatibility with Vercel’s serverless environment.

