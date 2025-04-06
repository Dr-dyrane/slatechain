import type { AppDispatch } from "@/lib/store";
import { fetchInventory } from "@/lib/slices/inventorySlice";
import { fetchOrders } from "@/lib/slices/orderSlice";
import { fetchProgress } from "../slices/onboardingSlice";
import { fetchKYCStatusThunk } from "../slices/kycSlice";
import {
	fetchCarriers,
	fetchFreights,
	fetchRoutes,
	fetchShipments,
	fetchTransports,
} from "../slices/shipmentSlice";
import { fetchSuppliers } from "../slices/supplierSlice";
import { fetchUser } from "../slices/authSlice";
import { fetchUsers } from "../slices/user/user";
import { fetchNotifications } from "../slices/notificationSlice";
import { fetchShopifyOrders, fetchShopifyShop } from "../slices/shopifySlice";
import type { UserRole } from "@/lib/types";
import { getBaseNavItems } from "../config/navigation";
import { fetchReturns } from "../slices/returnSlice";
import { fetchContracts } from "../slices/contractSlice";

// Define initialization functions for each role
const adminInitializers = [
	fetchInventory,
	fetchOrders,
	fetchProgress,
	fetchKYCStatusThunk,
	fetchShipments,
	fetchSuppliers,
	fetchUsers,
	fetchNotifications,
	fetchTransports,
	fetchReturns,
	fetchCarriers,
	fetchFreights,
	fetchRoutes,
	fetchContracts,
];

const managerInitializers = [
	fetchInventory,
	fetchOrders,
	fetchProgress,
	fetchShipments,
	fetchSuppliers,
	fetchNotifications,
	fetchCarriers,
	fetchFreights,
	fetchRoutes,
	fetchContracts,
];

const supplierInitializers = [
	fetchInventory,
	fetchOrders,
	fetchProgress,
	fetchContracts,
	fetchShipments,
	fetchNotifications,
	fetchCarriers,
	fetchFreights,
];

const customerInitializers = [fetchOrders, fetchProgress, fetchNotifications];

// Map roles to their initializers
const roleInitializers: Record<UserRole, typeof adminInitializers> = {
	admin: adminInitializers,
	manager: managerInitializers,
	supplier: supplierInitializers,
	customer: customerInitializers,
};

// Helper to check if a feature is available for a role based on navigation
const isFeatureAvailable = (role: UserRole, feature: string) => {
	const navItems = getBaseNavItems(role);
	return navItems.some((item) => item.href.includes(feature));
};

// Initialize integration-specific features
const initializeIntegrations = async (
	dispatch: AppDispatch,
	role: UserRole,
	integrations: { shopify?: { enabled: boolean } } = {}
) => {
	try {
		// Only initialize Shopify if it's enabled and user has permission
		if (integrations.shopify?.enabled && isFeatureAvailable(role, "apps")) {
			await Promise.all([
				dispatch(fetchShopifyShop()),
				dispatch(fetchShopifyOrders()),
			]);
		}
	} catch (error) {
		console.error("Failed to initialize integrations:", error);
	}
};

export const initializeApp = async (
	dispatch: AppDispatch,
	role: UserRole,
	integrations?: { shopify?: { enabled: boolean } }
) => {
	try {
		// First fetch user data as it might be needed by other initializers
		await dispatch(fetchUser());

		// Get initializers for the user's role
		const initializers = roleInitializers[role] || [];

		// Execute all initializers in parallel
		await Promise.all(
			initializers.map((initializer) => dispatch(initializer()))
		);

		// Initialize integrations if any
		await initializeIntegrations(dispatch, role, integrations);

		console.log(`App Initialized for role: ${role}`);
	} catch (error) {
		console.error("Failed to initialize app:", error);
		throw error; // Re-throw to be handled by the caller
	}
};
