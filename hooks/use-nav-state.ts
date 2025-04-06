import { useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store";

/**
 * Custom hook that selects only the parts of Redux state needed for navigation components
 * Returns a minimal state object that can be passed to getSidebarItemMeta
 */
export function useNavState() {
	// Select only the specific parts of state needed for navigation
	const inventory = useSelector((state: RootState) => state.inventory);
	const orders = useSelector((state: RootState) => state.orders);
	const shipment = useSelector((state: RootState) => state.shipment);
	const supplier = useSelector((state: RootState) => state.supplier);
	const user = useSelector((state: RootState) => state.user);
	const authUser = useSelector((state: RootState) => state.auth.user);
	const contracts = useSelector((state: RootState) => state.contracts);

	// Create a minimal state object with only what's needed
	const minimalState = useMemo(
		() => ({
			inventory,
			orders,
			shipment,
			supplier,
			user,
			auth: { user: authUser },
			contracts,
		}),
		[inventory, orders, shipment, supplier, user, authUser, contracts]
	);

	return minimalState as Partial<RootState>;
}
