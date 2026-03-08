import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, Clock, DoorOpen, Hotel as HotelIcon, Users, ChevronRight } from "lucide-react";
import { getLocalizedField, type Language } from "@/hooks/useLanguage";
import LocationPopover from "@/components/experience/LocationPopover";

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
  star_rating?: number;
  check_in_time?: string;
  check_out_time?: string;
  number_of_rooms?: number;
  property_type?: string;
  latitude?: number;
  longitude?: number;
}

interface YourStaySectionProps {
  hotel: Hotel | null;
  lang?: Language;
}

const YourStaySection = ({ hotel, lang = "en" }: YourStaySectionProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!hotel) return null;

  const name = getLocalizedField(hotel, "name", lang) as string || hotel.name;
  const city = getLocalizedField(hotel, "city", lang) as string || hotel.city;
  const region = getLocalizedField(hotel, "region", lang) as string || hotel.region;
  const story = getLocalizedField(hotel, "story", lang) as string || hotel.story;
  const highlights = (lang === 'he' ? hotel.highlights_he : hotel.highlights) || hotel.highlights || [];

  // Get photos for display
  const hotelPhotos = [hotel.hero_image, ...(hotel.photos || [])].filter(Boolean).slice(0, 6);

  // Build info pills
  const infoPills: { icon: React.ReactNode; label: string; value: string }[] = [];
  if (hotel.star_rating && hotel.star_rating > 0) {
    infoPills.push({
      icon: <Star className="h-4 w-4 fill-amber-400 text-amber-400" />,
      label: lang === "he" ? "דירוג" : "Rating",
      value: `${hotel.star_rating} stars`,
    });
  }
  if (hotel.check_in_time) {
    infoPills.push({
      icon: <DoorOpen className="h-4 w-4 text-muted-foreground" />,
      label: lang === "he" ? "צ'ק-אין" : "Check-in",
      value: hotel.check_in_time,
    });
  }
  if (hotel.check_out_time) {
    infoPills.push({
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
      label: lang === "he" ? "צ'ק-אאוט" : "Check-out",
      value: hotel.check_out_time,
    });
  }
  if (hotel.property_type) {
    infoPills.push({
      icon: <HotelIcon className="h-4 w-4 text-muted-foreground" />,
      label: lang === "he" ? "סוג" : "Type",
      value: hotel.property_type,
    });
  }

  return (
    <section className="py-8 md:py-10">
      {/* Hairline rule */}
      <div className="h-px bg-border/60 mb-8 md:mb-10" />

      <div className="space-y-8 md:space-y-10">
        {/* 1. Section Title — uppercase serif */}
        <div>
          <h2 className="font-serif text-[20px] md:text-2xl font-bold uppercase tracking-wide text-foreground">
            {lang === "he" ? "על השהייה שלך" : lang === "fr" ? "À PROPOS DE VOTRE SÉJOUR" : "ABOUT YOUR STAY"}
          </h2>
        </div>

        {/* 2. Hotel Photos — Desktop: 3-col grid / Mobile: horizontal scroll carousel */}
        {hotelPhotos.length > 0 && (
          <>
            {/* Desktop grid */}
            <div className="hidden md:grid grid-cols-3 gap-2">
              {hotelPhotos.slice(0, 3).map((photo, index) => (
                <div key={index} className="relative overflow-hidden rounded-[10px] h-[200px]">
                  <img
                    src={photo || "/placeholder.svg"}
                    alt={`${name} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Mobile carousel */}
            <div
              ref={scrollRef}
              className="md:hidden flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {hotelPhotos.map((photo, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 snap-start rounded-[10px] overflow-hidden"
                  style={{ width: "75%" }}
                >
                  <img
                    src={photo || "/placeholder.svg"}
                    alt={`${name} - ${index + 1}`}
                    className="w-full h-[180px] object-cover"
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Hotel name + location + view property */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">{name}</h3>
            <LocationPopover
              city={city || undefined}
              region={region || undefined}
              hotelName={name}
              latitude={hotel.latitude}
              longitude={hotel.longitude}
              lang={lang}
            />
          </div>
          <Link to={`/hotel2/${hotel.slug}`}>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-full border-border/60 hover:bg-foreground hover:text-background transition-all text-xs"
            >
              {lang === "he" ? "לפרופיל" : "View property"}
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* 3. Key Stay Info — Visual Pills */}
        {infoPills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {infoPills.map((pill, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2.5 md:py-2 rounded-[10px] bg-[hsl(var(--muted))]/50 border border-border/40 min-h-[44px]"
              >
                {pill.icon}
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-muted-foreground">{pill.label}</span>
                  <span className="text-[13px] md:text-sm font-semibold text-foreground">{pill.value}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {highlights.slice(0, 6).map((highlight, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 rounded-lg bg-muted/40"
              >
                <Star className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="text-[13px] md:text-sm">{highlight}</span>
              </div>
            ))}
          </div>
        )}

        {/* Story excerpt */}
        {story && (
          <p className="text-muted-foreground text-[15px] md:text-sm leading-relaxed line-clamp-3">
            {story}
          </p>
        )}
      </div>
    </section>
  );
};

export default YourStaySection;
