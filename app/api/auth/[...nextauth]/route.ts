import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { loginUser } from "@/lib/api/auth";
import { tokenManager } from "@/lib/helpers/tokenManager";

export const authOptions: NextAuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) return null;
				try {
					const response = await loginUser({
						email: credentials.email,
						password: credentials.password,
					});
					return {
						id: response.user.id,
						name: response.user.name,
						email: response.user.email,
						accessToken: response.accessToken,
						refreshToken: response.refreshToken,
					};
				} catch (error) {
					return null;
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.accessToken = user.accessToken;
				token.refreshToken = user.refreshToken;

				// Store tokens in localStorage via tokenManager if both are available
				if (user.accessToken && user.refreshToken) {
					tokenManager.setTokens(user.accessToken, user.refreshToken);
				}
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id;
				session.user.accessToken = token.accessToken ?? "";  // Fallback to empty string if undefined
				session.user.refreshToken = token.refreshToken ?? "";  // Fallback to empty string if undefined
			}
			return session;
		},
	},
	pages: {
		signIn: "/login",
	},
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
