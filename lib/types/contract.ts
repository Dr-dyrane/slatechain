export type ContractStatus =
	| "draft"
	| "pending"
	| "open"
	| "active"
	| "completed"
	| "expired"
	| "terminated";

export type BidStatus = "submitted" | "under_review" | "accepted" | "rejected";
export type Contract = {
	_id: string;
	id: string;
	title: string;
	contractNumber: string;
	description?: string;
	status: ContractStatus;
	version: number;
	startDate: string;
	endDate: string;
	renewalDate?: string;
	supplierId: string;
	bidId?: string;
	createdBy: string;
	signedBySupplier?: boolean;
	signedByAdmin?: boolean;
	isTerminated?: boolean;
	terminationReason?: string;
	tags?: string[];
	notes?: string;
	createdAt: string;
	updatedAt: string;
};

export interface Bid {
	_id: string;
	id: string;
	title: string;
	referenceNumber: string;
	status: "submitted" | "under_review" | "accepted" | "rejected";
	submissionDate: string;
	validUntil: string;
	proposedAmount: number;
	description?: string;
	durationInDays: number;
	supplierId: string; // Linked to the Supplier
	linkedContractId?: string; // Optional, linked to a contract
	tags?: string[];
	notes?: string;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
}

export interface BidState {
	items: Bid[];
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
}
