import type { CountryCode } from "libphonenumber-js";
import { Country as CSCCountry } from "country-state-city";

export interface Country {
	name: string;
	code: CountryCode;
	dialCode: string;
	flag: string;
	flagSvg?: string;
}

// Convert country-state-city data to our format
export const countries: Country[] = CSCCountry.getAllCountries().map(
	(country) => {
		// Extract the dial code from the phone code
		const dialCode = country.phonecode.startsWith("+")
			? country.phonecode
			: `+${country.phonecode}`;

		// Create flag emoji from country code
		// Convert country code to regional indicator symbols (Unicode)
		const flag = country.isoCode
			.toUpperCase()
			.split("")
			.map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
			.join("");

		// Create SVG flag URL - using a free flag API
		const flagSvg = `https://flagcdn.com/w20/${country.isoCode.toLowerCase()}.png`;

		return {
			name: country.name,
			code: country.isoCode as CountryCode,
			dialCode,
			flag,
			flagSvg,
		};
	}
);

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
