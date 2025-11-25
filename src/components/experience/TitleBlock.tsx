import { useLanguage } from "@/hooks/useLanguage";
import { MapPin, Star } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TitleBlockProps {
  title: string;
  hotelName: string;
  hotelSlug?: string;
  isNew?: boolean;
  rating?: number;
  reviewCount?: number;
  city?: string;
  distance?: number;
  address?: string;
  googleMapsLink?: string;
}

const TitleBlock = ({
  title,
  hotelName,
  hotelSlug,
  isNew,
  rating,
  reviewCount,
  city,
  distance,
  address,
  googleMapsLink,
}: TitleBlockProps) => {
  const { lang } = useLanguage();
  const [mapModalOpen, setMapModalOpen] = useState(false);

  return (
    <>
      <div className="space-y-4 sm:space-y-5">
        {/* NEW Badge */}
        {isNew && (
          <div>
            <span className="inline-block px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full uppercase tracking-wide">
              New
            </span>
          </div>
        )}

        {/* Main Title Line */}
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            {title}
          </h1>
          <span className="text-3xl sm:text-4xl md:text-5xl text-muted-foreground font-light">•</span>
          {hotelSlug ? (
            <a
              href={`/hotel/${hotelSlug}`}
              className="text-2xl sm:text-3xl md:text-4xl text-primary hover:underline font-semibold transition-colors"
            >
              {hotelName}
            </a>
          ) : (
            <span className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground">
              {hotelName}
            </span>
          )}
        </div>

        {/* Secondary Line - Rating, Location, Map */}
        <div className="flex flex-wrap items-center gap-3 text-base sm:text-lg">
          {/* Rating */}
          {rating && reviewCount ? (
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-foreground">{rating.toFixed(1)}</span>
              <span className="text-muted-foreground">
                ({reviewCount} {reviewCount === 1 ? (lang === 'he' ? 'ביקורת' : 'review') : (lang === 'he' ? 'ביקורות' : 'reviews')})
              </span>
            </div>
          ) : null}

          {/* Separator */}
          {rating && city && <span className="text-muted-foreground">•</span>}

          {/* City */}
          {city && <span className="font-medium text-foreground">{city}</span>}

          {/* Distance */}
          {distance && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{distance} km</span>
            </>
          )}

          {/* Add to Map Link */}
          {(address || googleMapsLink) && (
            <>
              <span className="text-muted-foreground">•</span>
              <button
                onClick={() => setMapModalOpen(true)}
                className="flex items-center gap-1.5 text-primary hover:underline font-semibold transition-colors"
              >
                <MapPin className="w-5 h-5" />
                <span>{lang === 'he' ? 'הוסף למפה' : 'Add to map'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Map Modal */}
      <Dialog open={mapModalOpen} onOpenChange={setMapModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{lang === 'he' ? 'מיקום' : 'Location'}</DialogTitle>
            <DialogDescription>
              {address || (lang === 'he' ? 'כתובת לא זמינה' : 'Address not available')}
            </DialogDescription>
          </DialogHeader>
          {googleMapsLink && (
            <div className="flex justify-end">
              <Button asChild>
                <a href={googleMapsLink} target="_blank" rel="noopener noreferrer">
                  {lang === 'he' ? 'פתח ב-Google Maps' : 'Open in Google Maps'}
                </a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TitleBlock;
