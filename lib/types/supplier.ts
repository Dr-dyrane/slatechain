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