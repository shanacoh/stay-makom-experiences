/**
 * Page publique V2 pour afficher une expérience
 * Supporte le parcours multi-hôtels via experience2_hotels
 * Utilise experiences2 + hotels2 + intégration HyperGuest
 */
import { useRef, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useExperience2 } from "@/hooks/useExperience2";
import { BookingPanel2 } from "@/components/experience/BookingPanel2";
import HeroSection from "@/components/experience-test/HeroSection";
import ProgramTimeline from "@/components/experience-test/ProgramTimeline";
import YourStaySection from "@/components/experience-test/YourStaySection";
import LocationMap from "@/components/experience-test/LocationMap";
import StickyPriceBar from "@/components/experience-test/StickyPriceBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/useLanguage";
import { SEOHead } from "@/components/SEOHead";
import { MapPin, Moon } from "lucide-react";

export default function Experience2() {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLanguage();
  const { data: experience, isLoading, error } = useExperience2(slug || null);
  const footerRef = useRef<HTMLElement>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const t = {
    en: {
      notFound: "Experience not found",
      notFoundDesc: "The experience you are looking for does not exist or is no longer available.",
      notConfigured: "Hotel not configured",
      notConfiguredDesc: "This experience is not yet available for booking.",
      viewDates: "View availability",
      yourJourney: "Your Journey",
      nightsAt: "nights at",
      night: "night",
      nights: "nights",
      step: "Step",
    },
    he: {
      notFound: "החוויה לא נמצאה",
      notFoundDesc: "החוויה שחיפשת אינה קיימת או שאינה זמינה יותר.",
      notConfigured: "המלון לא מוגדר",
      notConfiguredDesc: "חוויה זו אינה זמינה עדיין להזמנה.",
      viewDates: "לתאריכים",
      yourJourney: "המסלול שלך",
      nightsAt: "לילות ב",
      night: "לילה",
      nights: "לילות",
      step: "תחנה",
    },
    fr: {
      notFound: "Expérience non trouvée",
      notFoundDesc: "L'expérience que vous recherchez n'existe pas ou n'est plus disponible.",
      notConfigured: "Hôtel non configuré",
      notConfiguredDesc: "Cette expérience n'est pas encore disponible pour la réservation.",
      viewDates: "Voir les disponibilités",
      yourJourney: "Votre Parcours",
      nightsAt: "nuits à",
      night: "nuit",
      nights: "nuits",
      step: "Étape",
    },
  }[lang] || {
    notFound: "Experience not found",
    notFoundDesc: "The experience you are looking for does not exist or is no longer available.",
    notConfigured: "Hotel not configured",
    notConfiguredDesc: "This experience is not yet available for booking.",
    viewDates: "View availability",
    yourJourney: "Your Journey",
    nightsAt: "nights at",
    night: "night",
    nights: "nights",
    step: "Step",
  };

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 max-w-6xl mx-auto px-4">
          <Skeleton className="h-[60vh] w-full rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-8 mt-8">
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Error / not found
  // ---------------------------------------------------------------------------

  if (error || !experience) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold">{t.notFound}</h1>
            <p className="text-muted-foreground">{t.notFoundDesc}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Multi-hotel parcours data
  // ---------------------------------------------------------------------------

  /** Parcours hôtels triés par position (déjà trié dans le hook) */
  const parcoursHotels: {
    position: number;
    nights: number;
    notes: string | null;
    notes_he: string | null;
    hotel: any;
  }[] = ((experience as any).experience2_hotels || []).map((eh: any) => ({
    position: eh.position ?? 1,
    nights: eh.nights ?? 1,
    notes: eh.notes ?? null,
    notes_he: eh.notes_he ?? null,
    hotel: eh.hotels2,
  }));

  /** Fallback: if no parcours hotels, use the legacy single hotel */
  const legacyHotel = experience.hotels2;
  const hasMultiHotel = parcoursHotels.length > 0;
  const primaryHotel = hasMultiHotel ? parcoursHotels[0]?.hotel : legacyHotel;

  const category = experience.categories;
  const hyperguestPropertyId = primaryHotel?.hyperguest_property_id;

  // ---------------------------------------------------------------------------
  // Aggregate photos from all parcours hotels
  // ---------------------------------------------------------------------------

  const allHotelPhotos = useMemo(() => {
    if (hasMultiHotel) {
      const photos: string[] = [];
      for (const ph of parcoursHotels) {
        if (ph.hotel?.hero_image) photos.push(ph.hotel.hero_image);
        if (Array.isArray(ph.hotel?.photos)) {
          photos.push(...ph.hotel.photos);
        }
      }
      return photos;
    }
    if (legacyHotel) {
      return [legacyHotel.hero_image, ...(legacyHotel.photos || [])].filter(Boolean) as string[];
    }
    return [];
  }, [hasMultiHotel, parcoursHotels, legacyHotel]);

  // Use experience photos if available, otherwise hotel photos
  const photos =
    experience.photos?.length > 0
      ? experience.photos
      : allHotelPhotos.length > 0
        ? allHotelPhotos
        : [experience.hero_image || primaryHotel?.hero_image].filter(Boolean);

  // ---------------------------------------------------------------------------
  // Localized content
  // ---------------------------------------------------------------------------

  const title = lang === "he" ? experience.title_he || experience.title : experience.title;
  const subtitle = lang === "he" ? experience.subtitle_he || experience.subtitle : experience.subtitle;
  const primaryHotelName = lang === "he" ? primaryHotel?.name_he || primaryHotel?.name : primaryHotel?.name;
  const city = lang === "he" ? primaryHotel?.city_he || primaryHotel?.city : primaryHotel?.city;
  const region = lang === "he" ? primaryHotel?.region_he || primaryHotel?.region : primaryHotel?.region;
  const categoryName = lang === "he" ? category?.name_he || category?.name : category?.name;
  const longCopy = lang === "he" ? experience.long_copy_he || experience.long_copy : experience.long_copy;

  // ---------------------------------------------------------------------------
  // Build hotel data for YourStaySection (per hotel)
  // ---------------------------------------------------------------------------

  const buildHotelData = (hotel: any) => {
    if (!hotel) return null;
    return {
      id: hotel.id,
      name: hotel.name,
      name_he: hotel.name_he || undefined,
      slug: hotel.slug,
      hero_image: hotel.hero_image || undefined,
      photos: hotel.photos || undefined,
      city: hotel.city || undefined,
      city_he: hotel.city_he || undefined,
      region: hotel.region || undefined,
      region_he: hotel.region_he || undefined,
      star_rating: hotel.star_rating ?? undefined,
      check_in_time: hotel.check_in_time || undefined,
      check_out_time: hotel.check_out_time || undefined,
      number_of_rooms: hotel.number_of_rooms ?? undefined,
      property_type: hotel.property_type || undefined,
    };
  };

  // Build includes for ProgramTimeline
  const includesData = (experience.includes || []).map((item: string, index: number) => ({
    id: `include-${index}`,
    title: item,
    order_index: index,
  }));

  // ---------------------------------------------------------------------------
  // Compute total nights for display
  // ---------------------------------------------------------------------------

  const totalNights = hasMultiHotel ? parcoursHotels.reduce((sum, ph) => sum + (ph.nights || 1), 0) : null;

  // ---------------------------------------------------------------------------
  // Render: Journey overview for multi-hotel
  // ---------------------------------------------------------------------------

  const renderJourneyOverview = () => {
    if (!hasMultiHotel || parcoursHotels.length <= 1) return null;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{t.yourJourney}</h2>
        {totalNights && (
          <p className="text-muted-foreground">
            {totalNights} {totalNights === 1 ? t.night : t.nights}
          </p>
        )}
        <div className="relative">
          {/* Vertical line connecting steps */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            {parcoursHotels.map((ph, idx) => {
              const hotelName = lang === "he" ? ph.hotel?.name_he || ph.hotel?.name : ph.hotel?.name;
              const hotelCity = lang === "he" ? ph.hotel?.city_he || ph.hotel?.city : ph.hotel?.city;
              const notes = lang === "he" ? ph.notes_he || ph.notes : ph.notes;

              return (
                <div key={ph.hotel?.id || idx} className="relative flex gap-4">
                  {/* Step indicator */}
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {idx + 1}
                  </div>

                  <div className="flex-1 pb-2">
                    <div className="flex items-start gap-4">
                      {/* Hotel thumbnail */}
                      {ph.hotel?.hero_image && (
                        <img
                          src={ph.hotel.hero_image}
                          alt={hotelName || ""}
                          className="w-20 h-20 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{hotelName}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Moon className="h-4 w-4" />
                          <span>
                            {ph.nights} {ph.nights === 1 ? t.night : t.nights}
                          </span>
                          {hotelCity && (
                            <>
                              <MapPin className="h-4 w-4 ml-2" />
                              <span>{hotelCity}</span>
                            </>
                          )}
                        </div>
                        {notes && <p className="text-sm text-muted-foreground mt-1">{notes}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Render: Hotels stay sections
  // ---------------------------------------------------------------------------

  const renderStaySections = () => {
    if (hasMultiHotel) {
      return parcoursHotels.map((ph, idx) => {
        const hotelData = buildHotelData(ph.hotel);
        if (!hotelData) return null;
        return <YourStaySection key={ph.hotel?.id || idx} hotel={hotelData} lang={lang as "en" | "he" | "fr"} />;
      });
    }

    // Legacy single hotel
    const hotelData = buildHotelData(legacyHotel);
    if (!hotelData) return null;
    return <YourStaySection hotel={hotelData} lang={lang as "en" | "he" | "fr"} />;
  };

  // ---------------------------------------------------------------------------
  // Render: Location maps for all hotels
  // ---------------------------------------------------------------------------

  const renderMaps = () => {
    if (hasMultiHotel) {
      return parcoursHotels
        .filter((ph) => ph.hotel?.latitude && ph.hotel?.longitude)
        .map((ph, idx) => {
          const hotelName = lang === "he" ? ph.hotel?.name_he || ph.hotel?.name : ph.hotel?.name;
          return (
            <LocationMap
              key={ph.hotel?.id || idx}
              latitude={ph.hotel.latitude}
              longitude={ph.hotel.longitude}
              hotelName={hotelName || ""}
              lang={lang as "en" | "he" | "fr"}
            />
          );
        });
    }

    // Legacy single hotel
    if (legacyHotel?.latitude && legacyHotel?.longitude) {
      return (
        <LocationMap
          latitude={legacyHotel.latitude}
          longitude={legacyHotel.longitude}
          hotelName={primaryHotelName || ""}
          lang={lang as "en" | "he" | "fr"}
        />
      );
    }

    return null;
  };

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={title}
        description={subtitle || undefined}
        ogImage={experience.hero_image || primaryHotel?.hero_image || undefined}
      />

      <Header />

      {/* Hero Section */}
      <HeroSection
        photos={photos.filter(Boolean)}
        title={title}
        subtitle={subtitle || undefined}
        hotelName={primaryHotelName}
        hotelImage={primaryHotel?.hero_image || undefined}
        city={city || undefined}
        region={region || undefined}
        lang={lang as "en" | "he" | "fr"}
        experienceId={experience.id}
        hotelId={primaryHotel?.id}
        categoryName={categoryName || undefined}
        categorySlug={category?.slug || undefined}
        minParty={experience.min_party || 2}
        maxParty={experience.max_party || 4}
      />

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-8 lg:gap-12">
          {/* Colonne gauche - Contenu */}
          <div className="space-y-12">
            {/* Journey Overview (multi-hotel) */}
            {renderJourneyOverview()}

            {includesData.length > 0 && (
              <ProgramTimeline
                includes={includesData}
                lang={lang as "en" | "he" | "fr"}
                introText={longCopy || undefined}
              />
            )}

            {/* Hotel stay section(s) */}
            {renderStaySections()}

            {/* Location map(s) */}
            {renderMaps()}
          </div>

          {/* Colonne droite - Booking Panel (Desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <BookingPanel2
                experienceId={experience.id}
                hotelId={primaryHotel?.id || ""}
                hyperguestPropertyId={hyperguestPropertyId || null}
                currency={experience.currency || "ILS"}
                minParty={experience.min_party || 2}
                maxParty={experience.max_party || 4}
                lang={lang as "en" | "he" | "fr"}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Sticky Price Bar (Mobile) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <StickyPriceBar
          basePrice={experience.base_price}
          basePriceType={experience.base_price_type || "per_person"}
          currency={experience.currency || "ILS"}
          lang={lang as "en" | "he" | "fr"}
          onViewDates={() => setIsSheetOpen(true)}
          footerRef={footerRef}
        />
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <BookingPanel2
            experienceId={experience.id}
            hotelId={primaryHotel?.id || ""}
            hyperguestPropertyId={hyperguestPropertyId || null}
            currency={experience.currency || "ILS"}
            minParty={experience.min_party || 2}
            maxParty={experience.max_party || 4}
            lang={lang as "en" | "he" | "fr"}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
