import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Navigation, ExternalLink } from "lucide-react";
import { getLocalizedField, type Language } from "@/hooks/useLanguage";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Hotel {
  id: string;
  name: string;
  name_he?: string;
  slug: string;
  story?: string;
  story_he?: string;
  hero_image?: string;
  photos?: string[];
  city?: string;
  city_he?: string;
  region?: string;
  region_he?: string;
  amenities?: string[];
  highlights?: string[];
  highlights_he?: string[];
  latitude?: number | null;
  longitude?: number | null;
}

interface YourStaySectionProps {
  hotel: Hotel | null;
  lang?: Language;
  googleMapsLink?: string | null;
}

const YourStaySection = ({ hotel, lang = "en", googleMapsLink }: YourStaySectionProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const hasCoordinates = hotel?.latitude && hotel?.longitude;

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    if (!hotel?.latitude || !hotel?.longitude) return;

    // Initialize map
    const map = L.map(mapContainer.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: true,
    }).setView([hotel.latitude, hotel.longitude], 14);
    mapRef.current = map;

    // Light, elegant tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '',
    }).addTo(map);

    // Custom marker icon - elegant pin
    const customIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="
        background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%);
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      "><div style="transform: rotate(45deg); color: white; font-size: 14px;">✦</div></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    // Add marker
    L.marker([hotel.latitude, hotel.longitude], { icon: customIcon }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [hotel?.latitude, hotel?.longitude]);

  if (!hotel) return null;

  const name = getLocalizedField(hotel, "name", lang) as string || hotel.name;
  const city = getLocalizedField(hotel, "city", lang) as string || hotel.city;
  const region = getLocalizedField(hotel, "region", lang) as string || hotel.region;
  const story = getLocalizedField(hotel, "story", lang) as string || hotel.story;
  const highlights = (lang === 'he' ? hotel.highlights_he : hotel.highlights) || hotel.highlights || [];

  // Get photos for the grid
  const hotelPhotos = [hotel.hero_image, ...(hotel.photos || [])].filter(Boolean).slice(0, 2);

  const getDirectionsUrl = () => {
    if (googleMapsLink) return googleMapsLink;
    if (hotel.latitude && hotel.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${hotel.latitude},${hotel.longitude}`;
    }
    return null;
  };

  const directionsUrl = getDirectionsUrl();

  const translations = {
    title: lang === "he" ? "המלון שלך" : lang === "fr" ? "Votre hébergement" : "Your stay",
    subtitle: lang === "he" 
      ? "החוויה כוללת לינה במלון הזה" 
      : lang === "fr" 
      ? "Cette expérience inclut un séjour dans cet établissement"
      : "This experience includes a stay at this property",
    viewProperty: lang === "he" ? "לפרופיל" : lang === "fr" ? "Voir plus" : "View property",
    getDirections: lang === "he" ? "נווט" : lang === "fr" ? "Itinéraire" : "Get directions",
    locationLabel: lang === "he" ? "מיקום" : lang === "fr" ? "Localisation" : "Location",
  };

  return (
    <section className="py-6 border-b border-border">
      <div className="space-y-5">
        {/* Section Header */}
        <div>
          <h2 className="font-serif text-xl md:text-2xl font-medium text-foreground mb-1">
            {translations.title}
          </h2>
          <p className="text-muted-foreground text-sm">
            {translations.subtitle}
          </p>
        </div>

        {/* Hotel Card with integrated map */}
        <div className="rounded-xl overflow-hidden border border-border bg-card">
          {/* Visual Grid: Photos + Map */}
          <div className={`grid ${hasCoordinates ? 'grid-cols-3' : 'grid-cols-2'} gap-0.5`}>
            {/* Photos */}
            {hotelPhotos.map((photo, index) => (
              <div key={index} className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={photo || "/placeholder.svg"}
                  alt={`${name} - ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
            
            {/* Integrated Map */}
            {hasCoordinates && (
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <div ref={mapContainer} className="w-full h-full" />
                {/* Map overlay gradient */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent" />
                {/* Location badge */}
                <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                  <MapPin className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium text-foreground">{translations.locationLabel}</span>
                </div>
              </div>
            )}
          </div>

          {/* Hotel Info */}
          <div className="p-4 md:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">{name}</h3>
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{city}{region ? `, ${region}` : ''}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {directionsUrl && (
                  <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-1.5"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{translations.getDirections}</span>
                      <ExternalLink className="h-3 w-3 sm:hidden" />
                    </Button>
                  </a>
                )}
                <Link to={`/hotel/${hotel.slug}`}>
                  <Button variant="default" size="sm">
                    {translations.viewProperty}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {highlights.slice(0, 6).map((highlight, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50"
              >
                <Star className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="text-xs md:text-sm">{highlight}</span>
              </div>
            ))}
          </div>
        )}

        {/* Story excerpt */}
        {story && (
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
            {story}
          </p>
        )}
      </div>
    </section>
  );
};

export default YourStaySection;
