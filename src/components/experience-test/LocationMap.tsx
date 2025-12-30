import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Language } from "@/hooks/useLanguage";

interface LocationMapProps {
  latitude: number | null;
  longitude: number | null;
  hotelName: string;
  lang?: Language;
}

const LocationMap = ({ latitude, longitude, hotelName, lang = "en" }: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    if (!latitude || !longitude) return;

    // Initialize map
    const map = L.map(mapContainer.current).setView([latitude, longitude], 13);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Custom marker icon
    const customIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="
        background-color: hsl(var(--primary));
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ">📍</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });

    // Add marker
    L.marker([latitude, longitude], { icon: customIcon })
      .bindPopup(`<strong>${hotelName}</strong>`)
      .addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude, hotelName]);

  if (!latitude || !longitude) return null;

  return (
    <section className="py-6 border-b border-border">
      <h2 className="text-lg font-serif font-bold mb-4">
        {lang === "he" ? "איפה זה קורה" : lang === "en" ? "Where you'll be" : "Où ça se passe"}
      </h2>
      <div className="h-[280px] rounded-lg overflow-hidden border border-border">
        <div ref={mapContainer} className="w-full h-full" />
      </div>
      <p className="text-sm text-muted-foreground mt-2">{hotelName}</p>
    </section>
  );
};

export default LocationMap;
