import type { CountryCode } from "libphonenumber-js";

export interface Country {
	name: string;
	code: CountryCode;
	dialCode: string;
	flag: string;
}

// List of countries with their dial codes and flags
export const countries: Country[] = [
	{ name: "Nigeria", code: "NG", dialCode: "+234", flag: "🇳🇬" },
	{ name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" },
	{ name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧" },
	{ name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦" },
	{ name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺" },
	{ name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳" },
	{ name: "South Africa", code: "ZA", dialCode: "+27", flag: "🇿🇦" },
	{ name: "Ghana", code: "GH", dialCode: "+233", flag: "🇬🇭" },
	{ name: "Kenya", code: "KE", dialCode: "+254", flag: "🇰🇪" },
	{ name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪" },
	{ name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷" },
	{ name: "Brazil", code: "BR", dialCode: "+55", flag: "🇧🇷" },
	{ name: "China", code: "CN", dialCode: "+86", flag: "🇨🇳" },
	{ name: "Japan", code: "JP", dialCode: "+81", flag: "🇯🇵" },
	{ name: "Mexico", code: "MX", dialCode: "+52", flag: "🇲🇽" },
	// Add more countries as needed
];

// Find a country by its code
export function findCountryByCode(code: string): Country | null {
	const country = countries.find(
		(c) => c.code.toLowerCase() === code.toLowerCase()
	);
	return country || null;
}

// Find a country by its dial code
export function findCountryByDialCode(dialCode: string): Country | null {
	// Normalize the dial code to include the + if it doesn't
	const normalizedDialCode = dialCode.startsWith("+")
		? dialCode
		: `+${dialCode}`;
	const country = countries.find((c) => c.dialCode === normalizedDialCode);
	return country || null;
}

// Get the default country (Nigeria)
export function getDefaultCountry(): Country {
	return countries.find((c) => c.code === "NG") || countries[0];
}

// Extract country code from a full phone number
export function extractCountryFromNumber(phoneNumber: string): Country | null {
	if (!phoneNumber) return null;

	// Ensure the phone number starts with +
	const normalizedNumber = phoneNumber.startsWith("+")
		? phoneNumber
		: `+${phoneNumber}`;

	// Try to find the country by checking dial codes
	// Start with longer dial codes to avoid false matches
	const sortedCountries = [...countries].sort(
		(a, b) => b.dialCode.length - a.dialCode.length
	);

	for (const country of sortedCountries) {
		if (normalizedNumber.startsWith(country.dialCode)) {
			return country;
		}
	}

	return null;
}
