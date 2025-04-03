// src/lib/helpers/getRestrictedPages.ts
import { UserRole } from "@/lib/types";

// Define restricted pages per role
export const restrictedPages: { [key in UserRole]: string[] } = {
	[UserRole.ADMIN]: [],
	[UserRole.MANAGER]: ["/users"],
	[UserRole.SUPPLIER]: ["/users", "/suppliers"],
	[UserRole.CUSTOMER]: [
		"/users",
		"/suppliers",
		"/apps",
		"/logistics",
		"/settings",
		"/inventory",
	],
};
