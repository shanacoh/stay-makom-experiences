import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Language } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Navigation } from "lucide-react";

interface LocationMapProps {
  latitude: number | null;
  longitude: number | null;
  hotelName: string;
  lang?: Language;
  showGetThere?: boolean;
}

const LocationMap = ({ 
  latitude, 
  longitude, 
  hotelName, 
  lang = "en",
  showGetThere = true 
}: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    if (!latitude || !longitude) return;

    // Initialize map
    const map = L.map(mapContainer.current).setView([latitude, longitude], 14);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Custom marker icon
    const customIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="
        background-color: hsl(0 0% 15%);
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 13px;
        border: 2.5px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.35);
      ">📍</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
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

  // Navigation URLs
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  const appleMapsUrl = `https://maps.apple.com/?daddr=${latitude},${longitude}`;
  const wazeUrl = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;

  const getThereLabel = lang === "he" ? "הגעה" : lang === "fr" ? "S'y rendre" : "Get there";
  const sectionTitle = lang === "he" ? "איפה זה קורה" : lang === "fr" ? "Où ça se passe" : "Where you'll be";

  return (
    <section className="py-8">
      <div className="h-px bg-border/60 mb-8" />
      <h2 className="font-serif text-[20px] md:text-2xl font-bold uppercase tracking-wide text-foreground mb-4">
        {sectionTitle.toUpperCase()}
      </h2>
      <div className="h-[140px] md:h-[160px] rounded-lg overflow-hidden border border-border">
        <div ref={mapContainer} className="w-full h-full" />
      </div>
      <div className="mt-3">
        <p className="text-sm text-muted-foreground mb-3">{hotelName}</p>
        
        {showGetThere && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full md:w-auto gap-2 rounded-full border-border/60 hover:bg-foreground hover:text-background transition-all min-h-[44px] md:min-h-0"
              >
                <Navigation className="h-4 w-4" />
                {lang === "he" ? "קבלו הוראות הגעה" : "Get directions"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-background z-50">
              <DropdownMenuItem asChild>
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                  Google Maps
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={appleMapsUrl} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                  Apple Maps
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                  Waze
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </section>
  );
};

export default LocationMap;
