"use client";

import { useEffect, useRef, useState } from "react";
import type { Shipment } from "@/lib/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
  shipments: Shipment[];
}

export function MapComponent({ shipments }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  
  const [lastUpdate, setLastUpdate] = useState<number>(() => {
    return Number(localStorage.getItem("lastMapUpdate")) || 0;
  });

  const [lastLocation, setLastLocation] = useState<{ lat: number; lng: number } | null>(() => {
    const savedLocation = localStorage.getItem("lastMapLocation");
    return savedLocation ? JSON.parse(savedLocation) : null;
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        dragging: true,
        doubleClickZoom: false,
        scrollWheelZoom: false,
      }).setView([0, 0], 2);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    }

    const updateMap = () => {
      const map = mapRef.current;
      if (!map) return;

      // Remove previous markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      const customIcon = L.divIcon({
        className: "custom-marker",
        html: `<div style="display: flex; justify-content: center; align-items: center; width: 30px; height: 30px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z"/>
                      <circle cx="12" cy="11" r="2"/>
                  </svg>
               </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
      });

      let bounds = L.latLngBounds([]);

      shipments.forEach((shipment) => {
        if (shipment.currentLocation) {
          const { latitude, longitude } = shipment.currentLocation;

          const marker = L.marker([latitude, longitude], { icon: customIcon })
            .addTo(map)
            .bindPopup(`<strong>${shipment.name}</strong><br/>${shipment.status}`);

          markersRef.current.push(marker);
          bounds.extend([latitude, longitude]);
        }
      });

      if (bounds.isValid()) {
        // ✅ Smooth zoom to fit all shipments
        map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 15 });

        // ✅ Save last known location in localStorage
        const center = bounds.getCenter();
        localStorage.setItem("lastMapLocation", JSON.stringify({ lat: center.lat, lng: center.lng }));
        setLastLocation({ lat: center.lat, lng: center.lng });
      }

      // ✅ Save last update time in localStorage
      const currentTime = Date.now();
      localStorage.setItem("lastMapUpdate", String(currentTime));
      setLastUpdate(currentTime);
    };

    const thirtyMinutes = 30 * 60 * 1000;
    const now = Date.now();

    // ✅ Check if 30 minutes have passed since last update
    if (now - lastUpdate >= thirtyMinutes) {
      updateMap();
    } else if (lastLocation) {
      // ✅ Restore last saved location before the next update
      mapRef.current.flyTo([lastLocation.lat, lastLocation.lng], 10, { animate: true });
    }

    // ✅ Auto-update every 30 minutes
    const interval = setInterval(updateMap, thirtyMinutes);

    return () => clearInterval(interval);
  }, [shipments, lastUpdate, lastLocation]);

  return (
    <div
      ref={mapContainerRef}
      className="relative w-full h-[400px] rounded-lg overflow-hidden"
      style={{ position: "relative", zIndex: 1 }}
    />
  );
}
