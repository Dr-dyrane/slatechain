"use client";

import type { GeoLocation } from "@/lib/types";
import { useState, useEffect } from "react";
import type { CountryCode } from "libphonenumber-js";

// A reusable function to get geolocation
const getGeoLocation = (
	successCallback: (position: GeolocationPosition) => void,
	errorCallback: (error: GeolocationPositionError) => void
) => {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
			enableHighAccuracy: true,
			timeout: 5000,
			maximumAge: 0,
		});
	} else {
		// Create a custom GeolocationPositionError for unsupported browsers
		const error = {
			code: 0, // Geolocation error code for unsupported browsers
			message: "Geolocation is not supported by your browser",
		} as GeolocationPositionError;
		errorCallback(error);
	}
};

interface UseGeolocationResult {
	location: GeoLocation | null;
	loading: boolean;
	error: string | null;
	getLocation: () => void;
}

export function useGeolocation(): UseGeolocationResult {
	const [location, setLocation] = useState<GeoLocation | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const getLocation = () => {
		setLoading(true);
		setError(null);

		getGeoLocation(
			(position) => {
				setLocation({
					latitude: parseFloat(position.coords.latitude.toFixed(5)),
					longitude: parseFloat(position.coords.longitude.toFixed(5)),
				});
				setLoading(false);
			},
			(error) => {
				setError(error.message);
				setLoading(false);
			}
		);
	};

	return { location, loading, error, getLocation };
}

interface LocationState {
	country: CountryCode | null;
	loading: boolean;
	error: Error | null;
}

export function useUserLocation() {
	const [state, setState] = useState<LocationState>({
		country: null,
		loading: true,
		error: null,
	});

	useEffect(() => {
		const fetchLocation = async () => {
			try {
				// Try IP-based geolocation
				const response = await fetch("https://ipapi.co/json/");
				if (response.ok) {
					const data = await response.json();
					if (data.country_code) {
						setState({
							country: data.country_code as CountryCode,
							loading: false,
							error: null,
						});
						return;
					}
				}

				// Fallback to browser geolocation
				getGeoLocation(
					async (position) => {
						try {
							const { latitude, longitude } = position.coords;
							const geoResponse = await fetch(
								`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
							);

							if (geoResponse.ok) {
								const data = await geoResponse.json();
								setState({
									country: data.countryCode as CountryCode,
									loading: false,
									error: null,
								});
							} else {
								setState({ country: "NG", loading: false, error: null });
							}
						} catch (error) {
							setState({
								country: "NG",
								loading: false,
								error:
									error instanceof Error ? error : new Error("Unknown error"),
							});
						}
					},
					() => setState({ country: "NG", loading: false, error: null }) // Handle geolocation failure
				);
			} catch (error) {
				setState({
					country: "NG",
					loading: false,
					error: error instanceof Error ? error : new Error("Unknown error"),
				});
			}
		};

		fetchLocation();
	}, []);

	return state;
}
