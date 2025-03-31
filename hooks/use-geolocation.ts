"use client";

import { useState } from "react";
import type { GeoLocation } from "@/lib/types";

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
		if (!navigator.geolocation) {
			setError("Geolocation is not supported by your browser");
			return;
		}

		setLoading(true);
		setError(null);

		navigator.geolocation.getCurrentPosition(
			(position) => {
				setLocation({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
				});
				setLoading(false);
			},
			(error) => {
				setError(error.message);
				setLoading(false);
			},
			{ enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
		);
	};

	return { location, loading, error, getLocation };
}
