import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink } from "lucide-react";

interface Hotel {
  id: string;
  name: string;
  slug: string;
  city?: string | null;
  region?: string | null;
  highlights?: string[] | null;
  photos?: string[] | null;
  hero_image?: string | null;
}

interface HotelSpotlightProps {
  hotel: Hotel;
}

const HotelSpotlight = ({ hotel }: HotelSpotlightProps) => {
  const displayPhotos = hotel.photos?.slice(0, 3) || [];
  const highlights = hotel.highlights?.slice(0, 3) || [];

  return (
    <div className="bg-muted/30 rounded-xl p-4 sm:p-6 md:p-8 border border-border">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex-1">
          <h3 className="font-sans text-lg sm:text-xl md:text-2xl font-bold mb-2">{hotel.name}</h3>
          {(hotel.city || hotel.region) && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
              {hotel.city}, {hotel.region}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" asChild className="w-full sm:w-auto text-xs sm:text-sm">
          <Link to={`/hotels/${hotel.slug}`}>
            About the hotel
            <ExternalLink className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </Link>
        </Button>
      </div>

      {highlights.length > 0 && (
        <ul className="space-y-2 mb-4 sm:mb-6">
          {highlights.map((highlight, index) => (
            <li key={index} className="flex items-start gap-2 text-sm sm:text-base">
              <span className="text-primary mt-1">•</span>
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      )}

      {displayPhotos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {displayPhotos.map((photo, index) => (
            <div key={index} className="aspect-square rounded-lg overflow-hidden">
              <img
                src={photo}
                alt={`${hotel.name} - ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelSpotlight;
