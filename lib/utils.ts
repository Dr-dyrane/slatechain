import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RootState } from "@/lib/store";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";
import crypto from "crypto";
import type mongoose from "mongoose";
import type { Supplier, UserRole } from "./types";
import {
	parsePhoneNumberFromString,
	type CountryCode,
} from "libphonenumber-js";

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

export interface RateLimitConfig {
	uniqueTokenPerInterval?: number;
	interval?: number;
}

export const getSidebarItemMeta = (
	state: Partial<RootState>,
	path: string
): SidebarItemMeta => {
	switch (path) {
		case "/inventory":
			const totalStock =
				state.inventory?.items?.reduce((sum, item) => sum + item.quantity, 0) ||
				0;
			const lowStockItems =
				state.inventory?.items?.filter(
					(item) => item.quantity <= item.minAmount
				).length || 0;
			return {
				badge:
					lowStockItems > 0
						? {
								count: lowStockItems,
								variant: "warning",
							}
						: undefined,
				serviceIcon: state.auth?.user?.integrations?.erp_crm?.enabled
					? {
							src: "/icons/sap.svg",
							alt: "ERP Integration",
						}
					: undefined,
			};

		case "/orders":
			const pendingOrders =
				state.orders?.items.filter((order) => order.status === "PENDING")
					.length || 0;
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
			const inTransitShipments =
				state.shipment?.items.filter((s) => s.status === "IN_TRANSIT").length ||
				0;
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
					count: state.supplier?.items.length || 0,
					variant: "secondary",
				},
			};

		case "/users":
			return {
				badge: {
					count: state.user?.items.length || 0,
					variant: "secondary",
				},
				serviceIcon: state.auth?.user?.integrations?.erp_crm?.enabled
					? {
							src: "/icons/sap.svg",
							alt: "CRM Integration",
						}
					: undefined,
			};

		case "/apps":
			const ecommerceIntegration = state.auth?.user?.integrations?.ecommerce;
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

export interface RateLimiter {
	check: (limit: number, identifier: string) => Promise<void>;
	pending: (identifier: string) => Promise<number>;
	reset: (identifier: string) => Promise<void>;
}

export async function getRateLimitHeaders(
	remaining: number,
	limit: number,
	reset: number
) {
	return {
		"X-RateLimit-Limit": limit.toString(),
		"X-RateLimit-Remaining": Math.max(0, remaining).toString(),
		"X-RateLimit-Reset": reset.toString(),
	};
}

export function createRateLimiter(
	prefix: string,
	config: RateLimitConfig = {}
): RateLimiter {
	const {
		uniqueTokenPerInterval = 500, // Default number of tokens per interval
		interval = 60000, // Default interval of 60 seconds
	} = config;

	const redis = Redis.fromEnv();

	return {
		check: async (limit: number, identifier: string) => {
			const key = `${prefix}:${identifier}`;
			const count = await redis.incr(key);

			// Set expiry on first request
			if (count === 1) {
				await redis.expire(key, Math.floor(interval / 1000));
			}

			if (count > limit) {
				const ttl = await redis.ttl(key);
				throw new Error(
					JSON.stringify({
						error: "Too Many Requests",
						limit,
						remaining: 0,
						reset: Date.now() + ttl * 1000,
					})
				);
			}
		},

		pending: async (identifier: string) => {
			const key = `${prefix}:${identifier}`;
			return redis.get(key) as Promise<number>;
		},

		reset: async (identifier: string) => {
			const key = `${prefix}:${identifier}`;
			await redis.del(key);
		},
	};
}

// Middleware to handle rate limiting
export async function withRateLimit(
	req: Request,
	prefix: string,
	limit: number,
	interval = 60000
) {
	// Multiply the passed limit by 100
	const adjustedLimit = limit * 100;

	const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
	const limiter = createRateLimiter(prefix, { interval });

	try {
		await limiter.check(adjustedLimit, ip);
		const pending = await limiter.pending(ip);
		const remaining = Math.max(0, adjustedLimit - (pending ?? 0));
		const reset = Date.now() + interval;

		return {
			headers: await getRateLimitHeaders(remaining, adjustedLimit, reset),
			limited: false,
		};
	} catch (error) {
		const data = JSON.parse((error as Error).message);
		return {
			headers: await getRateLimitHeaders(0, adjustedLimit, data.reset),
			limited: true,
		};
	}
}

/**
 * Formats a number as currency
 * @param value The number to format
 * @param currency The currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency = "USD"): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
		maximumFractionDigits: 2,
	}).format(value);
}

export const currencies = [
	{ code: "USD", name: "US Dollar" },
	{ code: "EUR", name: "Euro" },
	{ code: "GBP", name: "British Pound" },
	{ code: "JPY", name: "Japanese Yen" },
	{ code: "CAD", name: "Canadian Dollar" },
	{ code: "AUD", name: "Australian Dollar" },
	{ code: "CHF", name: "Swiss Franc" },
	{ code: "CNY", name: "Chinese Yuan" },
	{ code: "INR", name: "Indian Rupee" },
	{ code: "BRL", name: "Brazilian Real" },
	{ code: "LKR", name: "Sri Lankan Rupee" },
];

/**
 * Formats a number with thousand separators
 * @param value The number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number): string {
	return new Intl.NumberFormat("en-US").format(value);
}

/**
 * Formats a date to a readable string
 * @param date The date to format
 * @param format The format to use (default: 'medium')
 * @returns Formatted date string
 */
export function formatDate(
	date: Date | string,
	format: "short" | "medium" | "long" = "medium"
): string {
	const dateObj = typeof date === "string" ? new Date(date) : date;

	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: format === "short" ? "short" : "long",
		day: "numeric",
	};

	if (format === "long") {
		options.weekday = "long";
		options.hour = "2-digit";
		options.minute = "2-digit";
	}

	return new Intl.DateTimeFormat("en-US", options).format(dateObj);
}

/**
 * Formats a percentage value
 * @param value The decimal value to format as percentage
 * @param decimals Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals = 1): string {
	return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Verifies that a webhook request is from Shopify
 */
export async function verifyShopifyWebhook(req: NextRequest): Promise<boolean> {
	try {
		const hmacHeader = req.headers.get("X-Shopify-Hmac-Sha256");
		if (!hmacHeader) {
			return false;
		}

		const shopifyWebhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;
		if (!shopifyWebhookSecret) {
			console.error("SHOPIFY_WEBHOOK_SECRET is not configured");
			return false;
		}

		// Get the raw body
		const rawBody = await req.text();

		// Calculate the HMAC
		const calculatedHmac = crypto
			.createHmac("sha256", shopifyWebhookSecret)
			.update(rawBody, "utf8")
			.digest("base64");

		// Compare the calculated HMAC with the one from the header
		return crypto.timingSafeEqual(
			Buffer.from(calculatedHmac),
			Buffer.from(hmacHeader)
		);
	} catch (error) {
		console.error("Error verifying Shopify webhook:", error);
		return false;
	}
}

/**
 * Verifies that a webhook request is from SAP
 */
export async function verifySAPWebhook(req: NextRequest): Promise<boolean> {
	try {
		const signatureHeader = req.headers.get("X-SAP-Signature");
		if (!signatureHeader) {
			return false;
		}

		const sapWebhookSecret = process.env.SAP_WEBHOOK_SECRET;
		if (!sapWebhookSecret) {
			console.error("SAP_WEBHOOK_SECRET is not configured");
			return false;
		}

		// Get the raw body
		const rawBody = await req.text();

		// Calculate the signature
		const calculatedSignature = crypto
			.createHmac("sha256", sapWebhookSecret)
			.update(rawBody, "utf8")
			.digest("hex");

		// Compare the calculated signature with the one from the header
		return signatureHeader === calculatedSignature;
	} catch (error) {
		console.error("Error verifying SAP webhook:", error);
		return false;
	}
}

/**
 * Verifies that a webhook request is from Power BI
 */
export async function verifyPowerBIWebhook(req: NextRequest): Promise<boolean> {
	try {
		const signatureHeader = req.headers.get("X-PowerBI-Signature");
		if (!signatureHeader) {
			return false;
		}

		const powerBIWebhookSecret = process.env.POWER_BI_WEBHOOK_SECRET;
		if (!powerBIWebhookSecret) {
			console.error("POWER_BI_WEBHOOK_SECRET is not configured");
			return false;
		}

		// Get the raw body
		const rawBody = await req.text();

		// Calculate the signature
		const calculatedSignature = crypto
			.createHmac("sha256", powerBIWebhookSecret)
			.update(rawBody, "utf8")
			.digest("hex");

		// Compare the calculated signature with the one from the header
		return signatureHeader === calculatedSignature;
	} catch (error) {
		console.error("Error verifying Power BI webhook:", error);
		return false;
	}
}

/**
 * Verifies that a webhook request is from IoT platform
 */
export async function verifyIoTWebhook(req: NextRequest): Promise<boolean> {
	try {
		const signatureHeader = req.headers.get("X-IoT-Signature");
		if (!signatureHeader) {
			return false;
		}

		const iotWebhookSecret = process.env.IOT_WEBHOOK_SECRET;
		if (!iotWebhookSecret) {
			console.error("IOT_WEBHOOK_SECRET is not configured");
			return false;
		}

		// Get the raw body
		const rawBody = await req.text();

		// Calculate the signature
		const calculatedSignature = crypto
			.createHmac("sha256", iotWebhookSecret)
			.update(rawBody, "utf8")
			.digest("hex");

		// Compare the calculated signature with the one from the header
		return signatureHeader === calculatedSignature;
	} catch (error) {
		console.error("Error verifying IoT webhook:", error);
		return false;
	}
}

/**
 * Adds ID handling to a mongoose schema
 * @param schema The mongoose schema to modify
 */
export function addIdSupport(schema: mongoose.Schema) {
	// Configure schema options
	schema.set("toJSON", {
		virtuals: true,
		transform: (doc, ret) => {
			if (ret._id) {
				ret.id = ret._id.toString();
			}
			return ret;
		},
	});

	// Add id virtual
	schema.virtual("id").get(function () {
		// This approach avoids TypeScript errors by checking if _id exists and is an object
		if (this._id && typeof this._id === "object" && this._id.toString) {
			return this._id.toString();
		}
		return null;
	});

	// Add toJSON method to handle nested documents
	if (!schema.methods.toJSON) {
		schema.methods.toJSON = function () {
			const obj = this.toObject({ virtuals: true });
			obj.id = obj._id.toString();

			// Handle arrays with _id fields
			Object.keys(obj).forEach((key) => {
				if (Array.isArray(obj[key])) {
					obj[key] = obj[key].map((item: any) => {
						if (item && typeof item === "object" && item._id) {
							item.id = item._id.toString();
						}
						return item;
					});
				}
			});

			return obj;
		};
	}
}

/**
 * Prepares supplier data for API submission
 */
export function prepareSupplierData(data: any) {
	// Create a full name from first and last name if available
	const fullName =
		data.firstName && data.lastName
			? `${data.firstName} ${data.lastName}`.trim()
			: data.name || "";

	// Create a supplier object that matches the expected format
	return {
		// User fields
		firstName: data.firstName || fullName.split(" ")[0] || "",
		lastName: data.lastName || fullName.split(" ").slice(1).join(" ") || "",
		email: data.email,
		password: data.password,
		phoneNumber: data.phoneNumber || "",
		role: "supplier" as UserRole,

		// Supplier-specific fields
		name: fullName || `${data.firstName} ${data.lastName}`,
		contactPerson: data.contactPerson || fullName,
		address: data.address || "",
		rating: data.rating || 3,
		status: data.status || "ACTIVE",

		// If updating an existing user
		userId: data.userId || null,
	};
}

/**
 * Extracts first and last name from a supplier object
 */
export function extractNameParts(supplier: Supplier): {
	firstName: string;
	lastName: string;
} {
	const nameParts = supplier.name.split(" ");
	return {
		firstName: nameParts[0] || "",
		lastName: nameParts.slice(1).join(" ") || "",
	};
}

// Define an extended supplier interface for internal use
export interface SupplierFormData
	extends Omit<Supplier, "id" | "createdAt" | "updatedAt"> {
	id?: string;
	firstName?: string;
	lastName?: string;
	password?: string;
	userId?: string;
	role?: UserRole;
	createdAt?: string;
	updatedAt?: string;
}

/**
 * Utility functions for exporting data to CSV format
 */

/**
 * Convert an array of objects to CSV format
 * @param data Array of objects to convert
 * @param columns Column definitions to use for headers and data extraction
 * @returns CSV formatted string
 */
export function convertToCSV<T extends Record<string, any>>(
	data: T[],
	columns: { accessorKey: string; header: string }[]
) {
	if (!data || !data.length) return "";

	// Create header row from column headers
	const header = columns.map((column) => `"${column.header}"`).join(",");

	// Create data rows
	const rows = data.map((item) => {
		return columns
			.map((column) => {
				// Get the value using accessorKey
				const value = item[column.accessorKey];

				// Handle different value types and escape quotes
				if (value === null || value === undefined) return '""';
				if (typeof value === "string") return `"${value.replace(/"/g, '""')}"`;
				return `"${value}"`;
			})
			.join(",");
	});

	// Combine header and rows
	return [header, ...rows].join("\n");
}

/**
 * Download data as a CSV file
 * @param data CSV formatted string
 * @param filename Name of the file to download
 */
export function downloadCSV(data: string, filename: string) {
	// Create a blob with the CSV data
	const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });

	// Check if msSaveBlob is available (for IE 10+)
	if (typeof navigator !== "undefined" && "msSaveBlob" in navigator) {
		(navigator as any).msSaveBlob(blob, filename);
	} else {
		// Other browsers
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.setAttribute("download", filename);

		// Append and trigger download
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
}

/**
 * Export data to CSV and trigger download
 * @param data Array of objects to export
 * @param columns Column definitions to use for headers and data extraction
 * @param filename Name of the file to download
 */
export function exportToCSV<T extends Record<string, any>>(
	data: T[],
	columns: { accessorKey: string; header: string }[],
	filename: string
) {
	const csv = convertToCSV(data, columns);
	downloadCSV(csv, filename);
}

export interface StoreCredit {
	code: string;
	amount: number;
	issuedAt: Date;
	customerId: string;
}

// Function to issue store credit
export async function issueStoreCredit(
	customerId: string,
	amount: number
): Promise<StoreCredit> {
	const code = crypto.randomBytes(8).toString("hex"); // Unique 16-char hex code
	const issuedAt = new Date();

	const storeCredit: StoreCredit = {
		code,
		amount,
		issuedAt,
		customerId,
	};
	// Mock "saving" to the database
	storeCreditDB.push(storeCredit);

	console.log("Store credit issued:", storeCredit);
	return storeCredit;
}

// Mock in-memory store for store credits
const storeCreditDB: StoreCredit[] = [];

// Function to get all issued store credits
export async function getAllStoreCredits(): Promise<StoreCredit[]> {
	return storeCreditDB;
}

/**
 * Validates a phone number
 * @param phoneNumber - The phone number to validate
 * @param countryCode - Optional country code for validation
 * @returns Boolean indicating if the phone number is valid
 */
export function isValidPhoneNumber(
	phoneNumber: string,
	countryCode?: CountryCode
): boolean {
	try {
		const parsedNumber = parsePhoneNumberFromString(phoneNumber, countryCode);
		return parsedNumber ? parsedNumber.isValid() : false;
	} catch (error) {
		return false;
	}
}

/**
 * Formats a phone number to E.164 format
 * @param phoneNumber - The phone number to format
 * @param countryCode - Optional country code for formatting
 * @returns Formatted phone number or null if invalid
 */
export function formatPhoneNumber(
	phoneNumber: string,
	countryCode?: CountryCode
): string | null {
	try {
		const parsedNumber = parsePhoneNumberFromString(phoneNumber, countryCode);
		return parsedNumber ? parsedNumber.format("E.164") : null;
	} catch (error) {
		return null;
	}
}

/**
 * Gets the country code from a phone number
 * @param phoneNumber - The phone number
 * @returns The country code or null if not detectable
 */
export function getCountryFromPhone(phoneNumber: string): CountryCode | null {
	try {
		const parsedNumber = parsePhoneNumberFromString(phoneNumber);
		return parsedNumber ? (parsedNumber.country as CountryCode) : null;
	} catch (error) {
		return null;
	}
}

/**
 * Gets the national number without country code
 * @param phoneNumber - The phone number
 * @returns The national number or null if invalid
 */
export function getNationalNumber(phoneNumber: string): string | null {
	try {
		const parsedNumber = parsePhoneNumberFromString(phoneNumber);
		return parsedNumber ? parsedNumber.nationalNumber : null;
	} catch (error) {
		return null;
	}
}

/**
 * Generates a unique reference number with a prefix
 * @param prefix The prefix for the reference number (e.g., "CNT" for contracts, "BID" for bids)
 * @returns A unique reference number
 */
export function generateReferenceNumber(prefix: string): string {
	const timestamp = Date.now().toString().slice(-6);
	const random = Math.floor(Math.random() * 10000)
		.toString()
		.padStart(4, "0");
	return `${prefix}-${timestamp}-${random}`;
}
