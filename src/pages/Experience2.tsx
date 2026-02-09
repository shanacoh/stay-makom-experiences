/**
 * Page publique V2 pour afficher une expérience
 * Utilise experiences2 + hotels2 + intégration HyperGuest
 */

import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useExperience2 } from '@/hooks/useExperience2';
import { BookingPanel2 } from '@/components/experience/BookingPanel2';
import HeroSection from '@/components/experience-test/HeroSection';
import ProgramTimeline from '@/components/experience-test/ProgramTimeline';
import YourStaySection from '@/components/experience-test/YourStaySection';
import LocationMap from '@/components/experience-test/LocationMap';
import StickyPriceBar from '@/components/experience-test/StickyPriceBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/hooks/useLanguage';
import { SEOHead } from '@/components/SEOHead';

export default function Experience2() {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLanguage();
  const { data: experience, isLoading, error } = useExperience2(slug || null);
  const footerRef = useRef<HTMLElement>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const t = {
    en: {
      notFound: 'Experience not found',
      notFoundDesc: 'The experience you are looking for does not exist or is no longer available.',
      notConfigured: 'Hotel not configured',
      notConfiguredDesc: 'This experience is not yet available for booking.',
      viewDates: 'View availability',
    },
    he: {
      notFound: 'החוויה לא נמצאה',
      notFoundDesc: 'החוויה שחיפשת אינה קיימת או שאינה זמינה יותר.',
      notConfigured: 'המלון לא מוגדר',
      notConfiguredDesc: 'חוויה זו אינה זמינה עדיין להזמנה.',
      viewDates: 'לתאריכים',
    },
    fr: {
      notFound: 'Expérience non trouvée',
      notFoundDesc: 'L\'expérience que vous recherchez n\'existe pas ou n\'est plus disponible.',
      notConfigured: 'Hôtel non configuré',
      notConfiguredDesc: 'Cette expérience n\'est pas encore disponible pour la réservation.',
      viewDates: 'Voir les disponibilités',
    },
  }[lang] || {
    notFound: 'Experience not found',
    notFoundDesc: 'The experience you are looking for does not exist or is no longer available.',
    notConfigured: 'Hotel not configured',
    notConfiguredDesc: 'This experience is not yet available for booking.',
    viewDates: 'View availability',
  };

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

  const hotel = experience.hotels2;
  const category = experience.categories;
  const hyperguestPropertyId = hotel?.hyperguest_property_id;

  // Use hotel photos if experience has none
  const photos = experience.photos?.length 
    ? experience.photos 
    : hotel?.photos || [experience.hero_image || hotel?.hero_image];

  // Get localized content
  const title = lang === 'he' ? (experience.title_he || experience.title) : experience.title;
  const subtitle = lang === 'he' ? (experience.subtitle_he || experience.subtitle) : experience.subtitle;
  const hotelName = lang === 'he' ? (hotel?.name_he || hotel?.name) : hotel?.name;
  const city = lang === 'he' ? (hotel?.city_he || hotel?.city) : hotel?.city;
  const region = lang === 'he' ? (hotel?.region_he || hotel?.region) : hotel?.region;
  const categoryName = lang === 'he' ? (category?.name_he || category?.name) : category?.name;
  const longCopy = lang === 'he' ? (experience.long_copy_he || experience.long_copy) : experience.long_copy;

  // Build hotel object for YourStaySection
  const hotelData = hotel ? {
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
  } : null;

  // Build includes for ProgramTimeline - transform strings to IncludeItem format
  const includesData = (experience.includes || []).map((item: string, index: number) => ({
    id: `include-${index}`,
    title: item,
    order_index: index,
  }));

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={title}
        description={subtitle || undefined}
        ogImage={experience.hero_image || hotel?.hero_image || undefined}
      />
      <Header />

      {/* Hero Section */}
      <HeroSection
        photos={photos.filter(Boolean)}
        title={title}
        subtitle={subtitle || undefined}
        hotelName={hotelName}
        hotelImage={hotel?.hero_image || undefined}
        city={city || undefined}
        region={region || undefined}
        lang={lang as 'en' | 'he' | 'fr'}
        experienceId={experience.id}
        hotelId={hotel?.id}
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
            {includesData.length > 0 && (
              <ProgramTimeline
                includes={includesData}
                lang={lang as 'en' | 'he' | 'fr'}
                introText={longCopy || undefined}
              />
            )}

            {hotelData && (
              <YourStaySection
                hotel={hotelData}
                lang={lang as 'en' | 'he' | 'fr'}
              />
            )}

            {hotel?.latitude && hotel?.longitude && (
              <LocationMap
                latitude={hotel.latitude}
                longitude={hotel.longitude}
                hotelName={hotelName || ''}
                lang={lang as 'en' | 'he' | 'fr'}
              />
            )}
          </div>

          {/* Colonne droite - Booking Panel (Desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <BookingPanel2
                experienceId={experience.id}
                hotelId={hotel?.id || ''}
                hyperguestPropertyId={hyperguestPropertyId || null}
                currency={experience.currency || 'ILS'}
                minParty={experience.min_party || 2}
                maxParty={experience.max_party || 4}
                lang={lang as 'en' | 'he' | 'fr'}
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
          basePriceType={experience.base_price_type || 'per_person'}
          currency={experience.currency || 'ILS'}
          lang={lang as 'en' | 'he' | 'fr'}
          onViewDates={() => setIsSheetOpen(true)}
          footerRef={footerRef}
        />
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <BookingPanel2
            experienceId={experience.id}
            hotelId={hotel?.id || ''}
            hyperguestPropertyId={hyperguestPropertyId || null}
            currency={experience.currency || 'ILS'}
            minParty={experience.min_party || 2}
            maxParty={experience.max_party || 4}
            lang={lang as 'en' | 'he' | 'fr'}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
