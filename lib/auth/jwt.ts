import jwt, { JwtPayload } from "jsonwebtoken";
import type { User } from "@/lib/types";

const JWT_SECRET = process.env.NEXT_JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.NEXT_JWT_REFRESH_SECRET!;

export interface DecodedToken extends JwtPayload {
	userId: string;
}

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

export const verifyAccessToken = (token: string): DecodedToken | null => {
	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		if (
			typeof decoded === "object" &&
			decoded !== null &&
			"userId" in decoded
		) {
			return decoded as DecodedToken;
		}
		return null;
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
