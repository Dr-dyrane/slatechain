// lib/config/navigation.ts

import {
	BarChart2,
	Home,
	Package,
	ShoppingCart,
	Truck,
	Users,
	Settings,
	UserCog,
	LayoutGrid,
	User,
} from "lucide-react";
import { UserRole } from "@/lib/types";

export const icons = {
	dashboard: Home,
	inventory: Package,
	orders: ShoppingCart,
	logistics: Truck,
	suppliers: Users,
	users: UserCog,
	settings: Settings,
	apps: LayoutGrid,
	profile: User,
} as const;

// Define base navigation items
export const baseNavItems = [
	{
		href: "/dashboard",
		title: "Dashboard",
		icon: "dashboard",
		roles: [
			UserRole.ADMIN,
			UserRole.SUPPLIER,
			UserRole.MANAGER,
			UserRole.CUSTOMER,
		],
	},
	{
		href: "/inventory",
		title: "Inventory",
		icon: "inventory",
		roles: [UserRole.ADMIN, UserRole.SUPPLIER, UserRole.MANAGER],
	},
	{
		href: "/orders",
		title: "Orders",
		icon: "orders",
		roles: [
			UserRole.ADMIN,
			UserRole.SUPPLIER,
			UserRole.MANAGER,
			UserRole.CUSTOMER,
		],
	},
	{
		href: "/logistics",
		title: "Logistics",
		icon: "logistics",
		roles: [UserRole.ADMIN, UserRole.SUPPLIER, UserRole.MANAGER],
	},
	{
		href: "/suppliers",
		title: "Suppliers",
		icon: "suppliers",
		roles: [UserRole.ADMIN, UserRole.MANAGER],
	},
	{
		href: "/users",
		title: "Users",
		icon: "users",
		roles: [UserRole.ADMIN],
	},
	{
		href: "/profile",
		title: "Profile",
		icon: "profile",
		roles: [UserRole.SUPPLIER, UserRole.CUSTOMER],
	},
	{
		href: "/settings",
		title: "Settings",
		icon: "settings",
		roles: [UserRole.CUSTOMER],
	},
];

// Integration-specific items
export const integrationNavItems = {
	ecommerce: [
		{
			href: "/apps",
			title: "Apps",
			icon: "apps",
			roles: [UserRole.ADMIN, UserRole.MANAGER],
		},
	],
};

export type NavItem = {
	href: string;
	title: string;
	icon: keyof typeof icons;
	roles: UserRole[];
};

export function getNavItems(
	role: UserRole,
	integrations: {
		ecommerce?: { enabled: boolean };
	} = {}
) {
	// Start with base items filtered by role
	let items = baseNavItems.filter((item) => item.roles.includes(role));

	// Add integration-specific items if enabled
	if (integrations.ecommerce?.enabled) {
		const ecommerceItems = integrationNavItems.ecommerce.filter((item) =>
			item.roles.includes(role)
		);
		items = [...items, ...ecommerceItems];
	}

	return items;
}
export function getBaseNavItems(role: UserRole) {
	// Start with base items filtered by role
	let items = baseNavItems.filter((item) => item.roles.includes(role));

	return items;
}
