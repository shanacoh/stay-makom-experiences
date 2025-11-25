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
      <div className="space-y-3 sm:space-y-4">
        {/* NEW Badge */}
        {isNew && (
          <div>
            <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full uppercase">
              New
            </span>
          </div>
        )}

        {/* Main Title Line */}
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
            {title}
          </h1>
          <span className="text-2xl sm:text-3xl md:text-4xl text-muted-foreground">•</span>
          {hotelSlug ? (
            <a
              href={`/hotel/${hotelSlug}`}
              className="text-lg sm:text-xl md:text-2xl text-primary hover:underline font-medium"
            >
              {hotelName}
            </a>
          ) : (
            <span className="text-lg sm:text-xl md:text-2xl font-medium">
              {hotelName}
            </span>
          )}
        </div>

        {/* Secondary Line */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm sm:text-base text-muted-foreground">
          {/* Rating */}
          {rating && reviewCount ? (
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
              <span>
                ({reviewCount} {reviewCount === 1 ? (lang === 'he' ? 'ביקורת' : 'review') : (lang === 'he' ? 'ביקורות' : 'reviews')})
              </span>
            </div>
          ) : null}

          {/* Separator */}
          {rating && city && <span>•</span>}

          {/* City */}
          {city && <span>{city}</span>}

          {/* Distance */}
          {distance && (
            <>
              <span>•</span>
              <span>{distance} km</span>
            </>
          )}

          {/* Add to Map Link */}
          {(address || googleMapsLink) && (
            <>
              <span>•</span>
              <button
                onClick={() => setMapModalOpen(true)}
                className="flex items-center gap-1 text-primary hover:underline font-medium"
              >
                <MapPin className="w-4 h-4" />
                {lang === 'he' ? 'הוסף למפה' : 'Add to map'}
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
