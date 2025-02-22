import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RootState } from "@/lib/store";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export interface SidebarBadge {
	count: number;
	variant?: "default" | "secondary" | "destructive" | "warning";
}

export interface ServiceIcon {
	src: string;
	alt: string;
}

export interface SidebarItemMeta {
	badge?: SidebarBadge;
	serviceIcon?: ServiceIcon;
}

export const getSidebarItemMeta = (
	state: RootState,
	path: string
): SidebarItemMeta => {
	switch (path) {
		case "/inventory":
			const totalStock =
				state.inventory.items?.reduce((sum, item) => sum + item.quantity, 0) ||
				0;
			const lowStockItems =
				state.inventory.items?.filter((item) => item.quantity <= item.minAmount)
					.length || 0;
			return {
				badge:
					lowStockItems > 0
						? {
								count: lowStockItems,
								variant: "warning",
						  }
						: undefined,
				serviceIcon: state.auth.user?.integrations?.erp_crm?.enabled
					? {
							src: "/icons/sap.svg",
							alt: "ERP Integration",
					  }
					: undefined,
			};

		case "/orders":
			const pendingOrders = state.orders.items.filter(
				(order) => order.status === "PENDING"
			).length;
			return {
				badge:
					pendingOrders > 0
						? {
								count: pendingOrders,
								variant: "default",
						  }
						: undefined,
			};

		case "/logistics":
			const inTransitShipments = state.shipment.items.filter(
				(s) => s.status === "IN_TRANSIT"
			).length;
			return {
				badge:
					inTransitShipments > 0
						? {
								count: inTransitShipments,
								variant: "default",
						  }
						: undefined,
			};

		case "/suppliers":
			return {
				badge: {
					count: state.supplier.items.length,
					variant: "secondary",
				},
			};

		case "/users":
			return {
				badge: {
					count: state.user.items.length,
					variant: "secondary",
				},
				serviceIcon: state.auth.user?.integrations?.erp_crm?.enabled
					? {
							src: "/icons/sap.svg",
							alt: "CRM Integration",
					  }
					: undefined,
			};

		case "/apps":
			const ecommerceIntegration = state.auth.user?.integrations?.ecommerce;
			return ecommerceIntegration?.enabled
				? {
						serviceIcon: {
							src: "/icons/shopify.svg",
							alt: "Shopify Integration",
						},
				  }
				: {};

		default:
			return {};
	}
};
