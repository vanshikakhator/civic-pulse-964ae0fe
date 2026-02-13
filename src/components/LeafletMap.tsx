import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: { lat: number; lng: number; popup?: string; priority?: string }[];
  onClick?: (lat: number, lng: number) => void;
  selectedPosition?: [number, number] | null;
  className?: string;
}

export function LeafletMap({
  center = [20.5937, 78.9629],
  zoom = 5,
  markers = [],
  onClick,
  selectedPosition,
  className = "h-[400px] w-full rounded-lg",
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current).setView(center, zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapInstance.current);

    if (onClick) {
      mapInstance.current.on("click", (e: L.LeafletMouseEvent) => {
        onClick(e.latlng.lat, e.latlng.lng);
      });
    }

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const allMarkers = [...markers];
    if (selectedPosition) {
      allMarkers.push({ lat: selectedPosition[0], lng: selectedPosition[1], popup: "Selected Location" });
    }

    allMarkers.forEach(({ lat, lng, popup, priority }) => {
      const color = priority === "High" ? "#ef4444" : priority === "Medium" ? "#f59e0b" : "#22c55e";
      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="width:24px;height:24px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(mapInstance.current!);
      if (popup) marker.bindPopup(popup);
      markersRef.current.push(marker);
    });
  }, [markers, selectedPosition]);

  return <div ref={mapRef} className={className} />;
}
