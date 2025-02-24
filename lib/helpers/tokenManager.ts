import { setCookie, getCookie, deleteCookie } from "cookies-next";

interface DecodedToken {
	exp?: number;
	[key: string]: any;
}

export const tokenManager = {
	getAccessToken: (): string | null => {
		try {
			const token = getCookie("accessToken") as string | null;
			return token;
		} catch (error) {
			console.error("Error getting access token:", error);
			return null;
		}
	},

	getRefreshToken: (): string | null => {
		try {
			const token = getCookie("refreshToken") as string | null;
			return token;
		} catch (error) {
			console.error("Error getting refresh token:", error);
			return null;
		}
	},

	setTokens: (accessToken: string, refreshToken: string): void => {
		try {
			setCookie("accessToken", accessToken, {
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: 60 * 60 * 24, // 1 day expiration
				path: "/",
			});
			setCookie("refreshToken", refreshToken, {
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: 60 * 60 * 24 * 30, // 30 days expiration
				path: "/",
			});
		} catch (error) {
			console.error("Error setting tokens:", error);
		}
	},

	clearTokens: (): void => {
		try {
			deleteCookie("accessToken", { path: "/" });
			deleteCookie("refreshToken", { path: "/" });
			console.log("Tokens cleared successfully");
		} catch (error) {
			console.error("Error clearing tokens:", error);
		}
	},

	decodeToken: (token: string): DecodedToken | null => {
		if (!token) return null;
		try {
			const base64Payload = token.split(".")[1]; // Get the payload part of the JWT
			const decodedPayload = atob(base64Payload); // Decode from base64
			return JSON.parse(decodedPayload) as DecodedToken;
		} catch (error) {
			console.error("Error decoding token:", error);
			return null;
		}
	},

	isTokenExpired: (token: string | null): boolean => {
		if (!token) return true;
		try {
			const decoded = tokenManager.decodeToken(token);
			if (!decoded || !decoded.exp) return true;
			return Date.now() >= decoded.exp * 1000; // Convert exp to milliseconds
		} catch (error) {
			console.error("Error checking token expiration:", error);
			return true;
		}
	},

	isAccessTokenExpired: (): boolean => {
		const token = tokenManager.getAccessToken();
		return tokenManager.isTokenExpired(token);
	},
};
