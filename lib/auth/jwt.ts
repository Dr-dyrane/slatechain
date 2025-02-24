import jwt from "jsonwebtoken";
import type { User } from "@/lib/types";

const JWT_SECRET = process.env.NEXT_JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.NEXT_JWT_REFRESH_SECRET!;

export const generateAccessToken = (user: User) => {
	return jwt.sign(
		{
			userId: user.id,
			role: user.role,
			email: user.email, // Added for API context
		},
		JWT_SECRET,
		{
			expiresIn: "15m",
		}
	);
};

export const generateRefreshToken = (user: User, tokenId: string) => {
	return jwt.sign(
		{
			userId: user.id,
			tokenId, // Unique per refresh session
		},
		JWT_REFRESH_SECRET,
		{
			expiresIn: "7d",
		}
	);
};

export const verifyAccessToken = (token: string) => {
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch {
		return null;
	}
};

export const verifyRefreshToken = (token: string) => {
	try {
		return jwt.verify(token, JWT_REFRESH_SECRET);
	} catch {
		return null;
	}
};
