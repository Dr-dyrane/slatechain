import { setCookie, getCookie, deleteCookie } from "cookies-next"; // Use cookies-next to handle cookies
interface DecodedToken {
	exp?: number;
	[key: string]: any;
}

export const tokenManager = {
	getAccessToken: (): string | null => {
		try {
			// Get the access token from the cookie (use HTTP-only cookie for security)
			return getCookie("accessToken") as string | null;
		} catch (error) {
			console.error("Error getting access token:", error);
			return null;
		}
	},

	getRefreshToken: (): string | null => {
		try {
			// Get the refresh token from the cookie
			return getCookie("refreshToken") as string | null;
		} catch (error) {
			console.error("Error getting refresh token:", error);
			return null;
		}
	},

	setTokens: (accessToken: string, refreshToken: string): void => {
		try {
			// Store the tokens in HTTP-only cookies, ensuring secure transmission over HTTPS
			setCookie("accessToken", accessToken, {
				httpOnly: true, // Can't be accessed via JavaScript
				secure: process.env.NODE_ENV === "production", // Only set the secure flag in production
				sameSite: "strict", // Prevents the cookies from being sent in cross-site requests
				maxAge: 60 * 60 * 24, // Set expiration time (e.g., 1 day)
				path: "/", // Make the cookie accessible to the entire domain
			});
			setCookie("refreshToken", refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: 60 * 60 * 24 * 30, // Longer expiration for refresh token (e.g., 30 days)
				path: "/",
			});
		} catch (error) {
			console.error("Error setting tokens:", error);
		}
	},

	clearTokens: (): void => {
		try {
			// Delete the cookies securely
			deleteCookie("accessToken");
			deleteCookie("refreshToken");
		} catch (error) {
			console.error("Error clearing tokens:", error);
		}
	},

	decodeToken: (token: string): DecodedToken | null => {
		if (!token) return null;
		try {
			const base64Payload = token.split(".")[1]; // Get the payload part of the JWT
			const decodedPayload = atob(base64Payload); // Decode from base64
			return JSON.parse(decodedPayload) as DecodedToken; // Parse to JSON
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
			return Date.now() >= decoded.exp * 1000; // Check expiration
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
