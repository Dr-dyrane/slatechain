import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";

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
		| "invoice";
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
	],
	recentSearches: [],
	isSearchDrawerOpen: false,
};

// Create the search thunk
export const searchAllStores = createAsyncThunk(
	"search/searchAllStores",
	async (query: string, { getState }) => {
		const state = getState() as RootState;
		const { selectedFilters } = state.search;

		// Array to hold all search results
		const results: SearchResult[] = [];

		// Only search if query is at least 2 characters
		if (query.length < 2) {
			return results;
		}

		const searchTerm = query.toLowerCase();

		// Search inventory items
		if (selectedFilters.includes("inventory")) {
			const inventoryItems = state.inventory.items;
			const inventoryResults = inventoryItems
				.filter(
					(item) =>
						item.name?.toLowerCase().includes(searchTerm) ||
						item.sku?.toLowerCase().includes(searchTerm) ||
						item.description?.toLowerCase().includes(searchTerm)
				)
				.map((item) => ({
					id: `inventory-${item.id}`,
					type: "inventory" as const,
					title: item.name || "Unnamed Item",
					subtitle: `SKU: ${item.sku || "N/A"}`,
					description: item.description || "",
					image:  "/logo.png",
					url: `/inventory/${item.id}`,
					data: item,
				}));

			results.push(...inventoryResults);
		}

		// Search orders
		if (
			selectedFilters.includes("order") ||
			selectedFilters.includes("invoice")
		) {
			const orders = state.orders.items;
			const orderResults = orders
				.filter(
					(order) =>
						order.orderNumber?.toLowerCase().includes(searchTerm) ||
						order.customerName?.toLowerCase().includes(searchTerm) ||
						order.status?.toLowerCase().includes(searchTerm)
				)
				.map((order) => ({
					id: `order-${order.id}`,
					type: "order" as const,
					title: `Order #${order.orderNumber}`,
					subtitle: `${order.customerName || "Unknown Customer"} - ${order.status || "Unknown Status"}`,
					description: `${order.items?.length || 0} items - $${order.totalAmount?.toFixed(2) || "0.00"}`,
					url: `/orders?id=${order.id}`,
					data: order,
				}));

			results.push(...orderResults);

			// Add invoices (from paid orders)
			if (selectedFilters.includes("invoice")) {
				const invoiceResults = orders
					.filter((order) => order.paid)
					.filter(
						(order) =>
							`INV-${order.orderNumber?.replace("ORD", "")}`
								.toLowerCase()
								.includes(searchTerm) ||
							order.customerName?.toLowerCase().includes(searchTerm)
					)
					.map((order) => ({
						id: `invoice-${order.id}`,
						type: "invoice" as const,
						title: `Invoice #INV-${order.orderNumber?.replace("ORD", "")}`,
						subtitle: `${order.customerName || "Unknown Customer"} - ${order.paid ? "Paid" : "Unpaid"}`,
						description: `$${order.totalAmount?.toFixed(2) || "0.00"}`,
						url: `/orders?tab=invoices&id=${order.id}`,
						data: order,
					}));

				results.push(...invoiceResults);
			}
		}

		// Search suppliers
		if (selectedFilters.includes("supplier")) {
			const suppliers = state.supplier.items;
			const supplierResults = suppliers
				.filter(
					(supplier) =>
						supplier.name?.toLowerCase().includes(searchTerm) ||
						supplier.email?.toLowerCase().includes(searchTerm) ||
						supplier.phone?.toLowerCase().includes(searchTerm)
				)
				.map((supplier) => ({
					id: `supplier-${supplier.id}`,
					type: "supplier" as const,
					title: supplier.name || "Unnamed Supplier",
					subtitle: supplier.email || "No Email",
					description: supplier.address || "",
					url: `/suppliers/${supplier.id}`,
					data: supplier,
				}));

			results.push(...supplierResults);
		}

		// Search customers
		if (selectedFilters.includes("customer")) {
			const customers = state.customer.items;
			const customerResults = customers
				.filter(
					(customer) =>
						customer.name?.toLowerCase().includes(searchTerm) ||
						customer.email?.toLowerCase().includes(searchTerm) ||
						customer.phone?.toLowerCase().includes(searchTerm)
				)
				.map((customer) => ({
					id: `customer-${customer.id}`,
					type: "customer" as const,
					title: customer.name || "Unnamed Customer",
					subtitle: customer.email || "No Email",
					description: customer.address || "",
					url: `/customers/${customer.id}`,
					data: customer,
				}));

			results.push(...customerResults);
		}

		// Search shipments
		if (selectedFilters.includes("shipment")) {
			const shipments = state.shipment.items;
			const shipmentResults = shipments
				.filter(
					(shipment) =>
						shipment.trackingNumber?.toLowerCase().includes(searchTerm) ||
						shipment.carrier?.toLowerCase().includes(searchTerm) ||
						shipment.status?.toLowerCase().includes(searchTerm)
				)
				.map((shipment) => ({
					id: `shipment-${shipment.id}`,
					type: "shipment" as const,
					title: `Shipment #${shipment.trackingNumber || "No Tracking"}`,
					subtitle: `${shipment.carrier || "Unknown Carrier"} - ${shipment.status || "Unknown Status"}`,
					description: shipment.notes || "",
					url: `/shipments/${shipment.id}`,
					data: shipment,
				}));

			results.push(...shipmentResults);
		}

		// Search returns
		if (selectedFilters.includes("return")) {
			const returns = state.returns.items;
			const returnResults = returns
				.filter(
					(returnItem) =>
						returnItem.returnNumber?.toLowerCase().includes(searchTerm) ||
						returnItem.customerName?.toLowerCase().includes(searchTerm) ||
						returnItem.status?.toLowerCase().includes(searchTerm)
				)
				.map((returnItem) => ({
					id: `return-${returnItem.id}`,
					type: "return" as const,
					title: `Return #${returnItem.returnNumber || "No Number"}`,
					subtitle: `${returnItem.customerName || "Unknown Customer"} - ${returnItem.status || "Unknown Status"}`,
					description: returnItem.reason || "",
					url: `/orders?tab=returns&id=${returnItem.id}`,
					data: returnItem,
				}));

			results.push(...returnResults);
		}

		return results;
	}
);

const searchSlice = createSlice({
	name: "search",
	initialState,
	reducers: {
		setSearchQuery: (state, action: PayloadAction<string>) => {
			state.query = action.payload;
		},
		clearSearch: (state) => {
			state.query = "";
			state.results = [];
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
} = searchSlice.actions;

export default searchSlice.reducer;
