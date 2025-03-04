// Supplier
export interface Supplier {
	id: string;
	name: string;
	contactPerson: string;
	email: string;
	phoneNumber: string;
	address: string;
	rating: number;
	status: "ACTIVE" | "INACTIVE";
	createdAt: string;
	updatedAt: string;
}

export interface SupplierDocument {
	id: string;
	supplierId: string;
	name: string;
	type: string;
	url: string;
	uploadedAt: string;
}

export interface ChatMessage {
	id: string;
	supplierId: string;
	senderId: string;
	senderName: string;
	message: string;
	timestamp: string;
}

export interface GeoLocation {
	latitude: number;
	longitude: number;
}

export enum ShipmentStatus {
    CREATED = "CREATED",
    PREPARING = "PREPARING",
    IN_TRANSIT = "IN_TRANSIT",
    DELIVERED = "DELIVERED",
  }  

export interface Shipment {
	id: string;
	name: string;
	orderId: string;
	trackingNumber: string;
	carrier: string;
	freightId: string;
	routeId: string;
	status: keyof ShipmentStatus;
	destination: string;
	estimatedDeliveryDate: string;
	actualDeliveryDate?: string;
	currentLocation?: GeoLocation;
}

export interface Transport {
	id: string;
	type: "TRUCK" | "SHIP" | "PLANE";
	capacity: number;
	currentLocation: GeoLocation;
	status: "AVAILABLE" | "IN_TRANSIT" | "MAINTENANCE";
	carrierId: string;
}

export interface Carrier {
	id: string;
	name: string;
	contactPerson: string;
	email: string;
	phone: string;
	rating: number;
	status: "ACTIVE" | "INACTIVE";
}

// Route interface
export interface Route {
	id: string;
	name: string;
	startLocation: string;
	endLocation: string;
	distance: number;
	estimatedDuration: number;
}

// Freight interface
export interface Freight {
	id: string;
	type: string;
	name: string;
	weight: number;
	volume: number;
	hazardous: boolean;
	specialInstructions?: string;
}

export interface ShipmentState {
	items: Shipment[];
	carriers: Carrier[];
	routes: Route[];
	transports: Transport[];
	freights: Freight[];
	loading: boolean;
	error: string | null;
}

// Route Status
export enum RouteStatus {
    PLANNED = "PLANNED",
	ACTIVE = "ACTIVE",
	INACTIVE = "INACTIVE",
	UNDER_MAINTENANCE = "UNDER_MAINTENANCE",
}

// Route Type
export enum RouteType {
	LOCAL = "LOCAL",
	REGIONAL = "REGIONAL",
	INTERNATIONAL = "INTERNATIONAL",
}

// Freight Status
export enum FreightStatus {
	PENDING = "PENDING",
	IN_TRANSIT = "IN_TRANSIT",
	DELIVERED = "DELIVERED",
	ON_HOLD = "ON_HOLD",
}
