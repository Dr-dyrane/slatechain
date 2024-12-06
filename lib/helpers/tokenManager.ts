interface DecodedToken {
	exp?: number;
	[key: string]: any;
}

export const tokenManager = {
	getAccessToken: (): string | null => {
		try {
			return localStorage.getItem("accessToken");
		} catch (error) {
			console.error("Error getting access token:", error);
			return null;
		}
	},

	getRefreshToken: (): string | null => {
		try {
			return localStorage.getItem("refreshToken");
		} catch (error) {
			console.error("Error getting refresh token:", error);
			return null;
		}
	},

	setTokens: (accessToken: string, refreshToken: string): void => {
		try {
			localStorage.setItem("accessToken", accessToken);
			localStorage.setItem("refreshToken", refreshToken);
		} catch (error) {
			console.error("Error setting tokens:", error);
		}
	},

	clearTokens: (): void => {
		try {
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
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
