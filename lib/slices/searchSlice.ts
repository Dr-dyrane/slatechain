import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";
import {
	type InventoryItem,
	type Order,
	type Supplier,
	type Transport,
	type Shipment,
	type Freight,
	type ReturnRequest,
	UserRole,
	type Carrier,
	type Route,
} from "@/lib/types";

// Define the types for search results from different stores
export interface SearchResult {
	id: string;
	type:
		| "inventory"
		| "order"
		| "supplier"
		| "customer"
		| "shipment"
		| "return"
		| "invoice"
		| "transport"
		| "carrier"
		| "route"
		| "freight";
	title: string;
	subtitle: string;
	description?: string;
	image?: string;
	url: string;
	data: any; // The original data object
}

interface SearchState {
	query: string;
	results: SearchResult[];
	isSearching: boolean;
	error: string | null;
	selectedFilters: string[];
	recentSearches: string[];
	isSearchDrawerOpen: boolean;
}

const initialState: SearchState = {
	query: "",
	results: [],
	isSearching: false,
	error: null,
	selectedFilters: [
		"inventory",
		"order",
		"supplier",
		"customer",
		"shipment",
		"return",
		"invoice",
		"transport",
		"carrier",
		"route",
		"freight",
	],
	recentSearches: [],
	isSearchDrawerOpen: false,
};

// Helper function to get available filters based on user role
export const getAvailableFiltersForRole = (role?: UserRole): string[] => {
	switch (role) {
		case UserRole.ADMIN:
			return [
				"inventory",
				"order",
				"supplier",
				"customer",
				"shipment",
				"return",
				"invoice",
				"transport",
				"carrier",
				"route",
				"freight",
			];
		case UserRole.MANAGER:
			return [
				"inventory",
				"order",
				"supplier",
				"customer",
				"shipment",
				"return",
				"invoice",
				"transport",
				"carrier",
				"route",
				"freight",
			];
		case UserRole.SUPPLIER:
			return ["inventory", "order", "shipment", "transport", "freight"];
		case UserRole.CUSTOMER:
			return ["order", "return", "invoice"];
		default:
			return ["order"];
	}
};

// Create the search thunk
export const searchAllStores = createAsyncThunk(
	"search/searchAllStores",
	async (query: string, { getState }) => {
		const state = getState() as RootState;
		const { selectedFilters } = state.search;
		const userRole = state.auth.user?.role;

		// Get available filters based on user role
		const availableFilters = getAvailableFiltersForRole(userRole);

		// Only search with filters that are both selected and available to the user
		const effectiveFilters =
			selectedFilters.length > 0
				? selectedFilters.filter((filter) => availableFilters.includes(filter))
				: availableFilters;

		// Array to hold all search results
		const results: SearchResult[] = [];

		// Only search if query is at least 2 characters
		if (query.length < 2) {
			return results;
		}

		const searchTerm = query.toLowerCase();

		try {
			// Search inventory items
			if (
				effectiveFilters.includes("inventory") &&
				Array.isArray(state.inventory?.items)
			) {
				const inventoryItems = state.inventory.items || [];
				const inventoryResults = inventoryItems
					.filter(
						(item: InventoryItem) =>
							item?.name?.toLowerCase()?.includes(searchTerm) ||
							false ||
							item?.sku?.toLowerCase()?.includes(searchTerm) ||
							false ||
							item?.description?.toLowerCase()?.includes(searchTerm) ||
							false ||
							item?.category?.toLowerCase()?.includes(searchTerm) ||
							false
					)
					.map((item) => ({
						id: `inventory-${item.id}`,
						type: "inventory" as const,
						title: item.name || "Unnamed Item",
						subtitle: `SKU: ${item.sku || "N/A"} - ${item.category || "Uncategorized"}`,
						description: `${item.description || ""} - Quantity: ${item.quantity}, Price: $${item.price}`,
						url: `/inventory/${item.id}`,
						data: item,
					}));

				results.push(...inventoryResults);
			}

			// Search orders
			if (
				effectiveFilters.includes("order") &&
				Array.isArray(state.orders?.items)
			) {
				const orders = state.orders.items || [];

				// For customers, only show their own orders
				const filteredOrders =
					userRole === UserRole.CUSTOMER && state.auth.user?.id
						? orders.filter((order) => order.customerId === state.auth.user?.id)
						: orders;

				const orderResults = filteredOrders
					.filter(
						(order: Order) =>
							order?.orderNumber?.toLowerCase()?.includes(searchTerm) ||
							false ||
							order?.customerId?.toLowerCase()?.includes(searchTerm) ||
							false ||
							order?.status?.toLowerCase()?.includes(searchTerm) ||
							false
					)
					.map((order) => ({
						id: `order-${order.id}`,
						type: "order" as const,
						title: `Order #${order.orderNumber || "Unknown"}`,
						subtitle: `${order.customerId || "Unknown Customer"} - ${order.status || "Unknown Status"}`,
						description: `${order.items?.length || 0} items - $${order.totalAmount?.toFixed(2) || "0.00"} - ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Unknown date"}`,
						url: `/orders?id=${order.id}`,
						data: order,
					}));

				results.push(...orderResults);
			}

			// Search invoices
			if (
				effectiveFilters.includes("invoice") &&
				Array.isArray(state.orders?.items)
			) {
				const orders = state.orders.items || [];

				// For customers, only show their own invoices
				const filteredOrders =
					userRole === UserRole.CUSTOMER && state.auth.user?.id
						? orders.filter(
								(order) =>
									order.customerId === state.auth.user?.id && order.paid
							)
						: orders.filter((order) => order.paid);

				const invoiceResults = filteredOrders
					.filter(
						(order) =>
							(order?.orderNumber &&
								`INV-${order.orderNumber.replace("ORD", "")}`
									.toLowerCase()
									.includes(searchTerm)) ||
							order?.customerId?.toLowerCase()?.includes(searchTerm) ||
							false
					)
					.map((order) => ({
						id: `invoice-${order.id}`,
						type: "invoice" as const,
						title: `Invoice #INV-${order.orderNumber ? order.orderNumber.replace("ORD", "") : "Unknown"}`,
						subtitle: `${order.customerId || "Unknown Customer"} - ${order.paid ? "Paid" : "Unpaid"}`,
						description: `$${order.totalAmount?.toFixed(2) || "0.00"} - ${order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : "Unknown date"}`,
						url: `/orders?tab=invoices&id=${order.id}`,
						data: order,
					}));

				results.push(...invoiceResults);
			}

			// Search suppliers
			if (
				effectiveFilters.includes("supplier") &&
				Array.isArray(state.supplier?.items)
			) {
				const suppliers = state.supplier.items || [];
				const supplierResults = suppliers
					.filter(
						(supplier: Supplier) =>
							supplier?.name?.toLowerCase()?.includes(searchTerm) ||
							false ||
							supplier?.email?.toLowerCase()?.includes(searchTerm) ||
							false ||
							supplier?.phoneNumber?.toLowerCase()?.includes(searchTerm) ||
							false ||
							supplier?.contactPerson?.toLowerCase()?.includes(searchTerm) ||
							false
					)
					.map((supplier) => ({
						id: `supplier-${supplier.id}`,
						type: "supplier" as const,
						title: supplier.name || "Unnamed Supplier",
						subtitle: `Contact: ${supplier.contactPerson || "No Contact"} - ${supplier.email || "No Email"}`,
						description: `Phone: ${supplier.phoneNumber || "N/A"} - ${supplier.address || ""}`,
						url: `/suppliers/${supplier.id}`,
						data: supplier,
					}));

				results.push(...supplierResults);
			}

			// Search customers
			if (
				effectiveFilters.includes("customer") &&
				Array.isArray(state.customer?.items)
			) {
				const customers = state.customer.items || [];
				const customerResults = customers
					.filter(
						(customer: any) =>
							customer?.name?.toLowerCase()?.includes(searchTerm) ||
							false ||
							customer?.email?.toLowerCase()?.includes(searchTerm) ||
							false ||
							customer?.phoneNumber?.toLowerCase()?.includes(searchTerm) ||
							false ||
							(customer?.firstName + " " + customer?.lastName)
								?.toLowerCase()
								?.includes(searchTerm) ||
							false
					)
					.map((customer: any) => ({
						id: `customer-${customer.id || customer._id || "unknown"}`,
						type: "customer" as const,
						title:
							customer.name ||
							`${customer.firstName || ""} ${customer.lastName || ""}`,
						subtitle: customer.email || "No Email",
						description: `Phone: ${customer.phoneNumber || "N/A"} - ${customer.address?.city || ""}, ${customer.address?.country || ""}`,
						url: `/customers/${customer.id || customer._id || "unknown"}`,
						data: customer,
					}));

				results.push(...customerResults);
			}

			// Search shipments
			if (
				effectiveFilters.includes("shipment") &&
				Array.isArray(state.shipment?.items)
			) {
				const shipments = state.shipment.items || [];

				// For customers, only show shipments related to their orders
				const filteredShipments =
					userRole === UserRole.CUSTOMER &&
					state.auth.user?.id &&
					Array.isArray(state.orders?.items)
						? shipments.filter((shipment) => {
								const order = state.orders.items.find(
									(order) => order.id.toString() === shipment.orderId
								);
								return order && order.customerId === state.auth.user?.id;
							})
						: shipments;

				const shipmentResults = filteredShipments
					.filter(
						(shipment: Shipment) =>
							shipment?.trackingNumber?.toLowerCase()?.includes(searchTerm) ||
							false ||
							shipment?.carrier?.toLowerCase()?.includes(searchTerm) ||
							false ||
							shipment?.status?.toLowerCase()?.includes(searchTerm) ||
							false ||
							shipment?.name?.toLowerCase()?.includes(searchTerm) ||
							false
					)
					.map((shipment) => ({
						id: `shipment-${shipment.id}`,
						type: "shipment" as const,
						title: `Shipment #${shipment.trackingNumber || "No Tracking"}`,
						subtitle: `${shipment.carrier || "Unknown Carrier"} - ${shipment.status || "Unknown Status"}`,
						description: `Order: ${shipment.orderId} - Delivery: ${shipment.estimatedDeliveryDate ? new Date(shipment.estimatedDeliveryDate).toLocaleDateString() : "Unknown"}`,
						url: `/shipments/${shipment.id}`,
						data: shipment,
					}));

				results.push(...shipmentResults);
			}

			// Search returns
			if (
				effectiveFilters.includes("return") &&
				Array.isArray(state.returns?.items)
			) {
				const returns = state.returns.items || [];

				// For customers, only show their own returns
				const filteredReturns =
					userRole === UserRole.CUSTOMER && state.auth.user?.id
						? returns.filter(
								(returnItem: ReturnRequest) =>
									returnItem.customerId?._id === state.auth.user?.id ||
									returnItem.customerId === state.auth.user?.id
							)
						: returns;

				const returnResults = filteredReturns
					.filter(
						(returnItem: ReturnRequest) =>
							returnItem?.returnRequestNumber
								?.toLowerCase()
								?.includes(searchTerm) ||
							false ||
							returnItem?.status?.toLowerCase()?.includes(searchTerm) ||
							false ||
							returnItem?.returnReason?.toLowerCase()?.includes(searchTerm) ||
							false ||
							returnItem?.preferredReturnType
								?.toLowerCase()
								?.includes(searchTerm) ||
							false
					)
					.map((returnItem) => ({
						id: `return-${returnItem.id}`,
						type: "return" as const,
						title: `Return #${returnItem.returnRequestNumber || "No Number"}`,
						subtitle: `Order: ${returnItem.orderId?.orderNumber || "Unknown"} - ${returnItem.status || "Unknown Status"}`,
						description: `Reason: ${returnItem.returnReason || "Unknown"} - Type: ${returnItem.preferredReturnType || "Unknown"}`,
						url: `/orders?tab=returns&id=${returnItem.id}`,
						data: returnItem,
					}));

				results.push(...returnResults);
			}

			// Search transports
			if (
				effectiveFilters.includes("transport") &&
				Array.isArray(state.shipment?.transports)
			) {
				const transports = state.shipment.transports || [];
				const transportResults = transports
					.filter(
						(transport: Transport) =>
							transport?.name?.toLowerCase()?.includes(searchTerm) ||
							false ||
							transport?.type?.toLowerCase()?.includes(searchTerm) ||
							false ||
							transport?.status?.toLowerCase()?.includes(searchTerm) ||
							false
					)
					.map((transport) => ({
						id: `transport-${transport.id}`,
						type: "transport" as const,
						title: transport.name || "Unnamed Transport",
						subtitle: `Type: ${transport.type} - Status: ${transport.status}`,
						description: `Capacity: ${transport.capacity} - Location: ${transport.currentLocation?.latitude?.toFixed(2) || "?"}, ${transport.currentLocation?.longitude?.toFixed(2) || "?"}`,
						url: `/transports/${transport.id}`,
						data: transport,
					}));

				results.push(...transportResults);
			}

			// Search carriers
			if (
				effectiveFilters.includes("carrier") &&
				Array.isArray(state.shipment?.carriers)
			) {
				const carriers = state.shipment.carriers || [];
				const carrierResults = carriers
					.filter(
						(carrier: Carrier) =>
							carrier?.name?.toLowerCase()?.includes(searchTerm) ||
							false ||
							carrier?.contactPerson?.toLowerCase()?.includes(searchTerm) ||
							false ||
							carrier?.email?.toLowerCase()?.includes(searchTerm) ||
							false ||
							carrier?.phone?.toLowerCase()?.includes(searchTerm) ||
							false
					)
					.map((carrier) => ({
						id: `carrier-${carrier.id}`,
						type: "carrier" as const,
						title: carrier.name || "Unnamed Carrier",
						subtitle: `Contact: ${carrier.contactPerson || "No Contact"}`,
						description: `Email: ${carrier.email || "N/A"} - Phone: ${carrier.phone || "N/A"} - Rating: ${carrier.rating}/5`,
						url: `/carriers/${carrier.id}`,
						data: carrier,
					}));

				results.push(...carrierResults);
			}

			// Search routes
			if (
				effectiveFilters.includes("route") &&
				Array.isArray(state.shipment?.routes)
			) {
				const routes = state.shipment.routes || [];
				const routeResults = routes
					.filter(
						(route: Route) =>
							route?.name?.toLowerCase()?.includes(searchTerm) ||
							false ||
							route?.startLocation?.toLowerCase()?.includes(searchTerm) ||
							false ||
							route?.endLocation?.toLowerCase()?.includes(searchTerm) ||
							false ||
							route?.type?.toLowerCase()?.includes(searchTerm) ||
							false ||
							route?.status?.toLowerCase()?.includes(searchTerm) ||
							false
					)
					.map((route) => ({
						id: `route-${route.id}`,
						type: "route" as const,
						title: route.name || "Unnamed Route",
						subtitle: `${route.startLocation || "Unknown"} to ${route.endLocation || "Unknown"}`,
						description: `Type: ${route.type} - Status: ${route.status} - Distance: ${route.distance}km`,
						url: `/routes/${route.id}`,
						data: route,
					}));

				results.push(...routeResults);
			}

			// Search freights
			if (
				effectiveFilters.includes("freight") &&
				Array.isArray(state.shipment?.freights)
			) {
				const freights = state.shipment.freights || [];
				const freightResults = freights
					.filter(
						(freight: Freight) =>
							freight?.freightNumber?.toLowerCase()?.includes(searchTerm) ||
							false ||
							freight?.type?.toLowerCase()?.includes(searchTerm) ||
							false ||
							freight?.status?.toLowerCase()?.includes(searchTerm) ||
							false ||
							freight?.vehicle?.identifier
								?.toLowerCase()
								?.includes(searchTerm) ||
							false
					)
					.map((freight) => ({
						id: `freight-${freight.id}`,
						type: "freight" as const,
						title: `Freight #${freight.freightNumber || "No Number"}`,
						subtitle: `Type: ${freight.type} - Status: ${freight.status}`,
						description: `Vehicle: ${freight.vehicle?.type || "N/A"} ${freight.vehicle?.identifier || ""} - Carrier: ${freight.carrierId}`,
						url: `/freights/${freight.id}`,
						data: freight,
					}));

				results.push(...freightResults);
			}

			return results;
		} catch (error) {
			console.error("Search error:", error);
			return [];
		}
	}
);

const searchSlice = createSlice({
	name: "search",
	initialState,
	reducers: {
		setSearchQuery: (state, action: PayloadAction<string>) => {
			state.query = action.payload;
			// Clear results if query is too short
			if (action.payload.length < 2) {
				state.results = [];
			}
		},
		clearSearch: (state) => {
			state.query = "";
			state.results = [];
			state.error = null;
		},
		toggleFilter: (state, action: PayloadAction<string>) => {
			const filter = action.payload;
			if (state.selectedFilters.includes(filter)) {
				state.selectedFilters = state.selectedFilters.filter(
					(f) => f !== filter
				);
			} else {
				state.selectedFilters.push(filter);
			}
		},
		addRecentSearch: (state, action: PayloadAction<string>) => {
			// Remove if already exists
			state.recentSearches = state.recentSearches.filter(
				(s) => s !== action.payload
			);
			// Add to beginning
			state.recentSearches.unshift(action.payload);
			// Keep only the last 5
			state.recentSearches = state.recentSearches.slice(0, 5);
		},
		clearRecentSearches: (state) => {
			state.recentSearches = [];
		},
		setSearchDrawerOpen: (state, action: PayloadAction<boolean>) => {
			state.isSearchDrawerOpen = action.payload;
		},
		// Initialize filters based on user role
		initializeFilters: (state, action: PayloadAction<UserRole | undefined>) => {
			state.selectedFilters = getAvailableFiltersForRole(action.payload);
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(searchAllStores.pending, (state) => {
				state.isSearching = true;
				state.error = null;
			})
			.addCase(searchAllStores.fulfilled, (state, action) => {
				state.isSearching = false;
				state.results = action.payload;
			})
			.addCase(searchAllStores.rejected, (state, action) => {
				state.isSearching = false;
				state.error = action.error.message || "An error occurred during search";
			});
	},
});

export const {
	setSearchQuery,
	clearSearch,
	toggleFilter,
	addRecentSearch,
	clearRecentSearches,
	setSearchDrawerOpen,
	initializeFilters,
} = searchSlice.actions;

export default searchSlice.reducer;
