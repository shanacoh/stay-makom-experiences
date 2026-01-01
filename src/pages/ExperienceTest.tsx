import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingPanel from "@/components/experience/BookingPanel";
import HeroSection from "@/components/experience-test/HeroSection";
import ExperienceSearchHeader from "@/components/experience-test/ExperienceSearchHeader";
import StickyPriceBar from "@/components/experience-test/StickyPriceBar";
import YourStaySection from "@/components/experience-test/YourStaySection";
import ProgramTimeline from "@/components/experience-test/ProgramTimeline";
import HostSection from "@/components/experience-test/HostSection";
import PracticalInfo from "@/components/experience-test/PracticalInfo";
import ReviewsGrid from "@/components/experience-test/ReviewsGrid";
import LocationMap from "@/components/experience-test/LocationMap";
import ExtrasSection from "@/components/experience/ExtrasSection";
import OtherExperiencesFromHotel from "@/components/experience/OtherExperiencesFromHotel";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";
import { useLanguage, getLocalizedField } from "@/hooks/useLanguage";
import { t } from "@/lib/translations";

const ExperienceTest = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLanguage();
  const [isBookingSheetOpen, setIsBookingSheetOpen] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState<{ [key: string]: number }>({});
  const [guestCount, setGuestCount] = useState(2);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showSearchHeader, setShowSearchHeader] = useState(false);
  const isMobile = useIsMobile();
  
  const heroRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const bookingRef = useRef<HTMLDivElement>(null);

  // Handle scroll for search header visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowSearchHeader(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch experience data
  const { data: experience, isLoading } = useQuery({
    queryKey: ["experience", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select(`
          *,
          hotels (*)
        `)
        .eq("slug", slug)
        .eq("status", "published")
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug
  });

  // Fetch includes (for timeline)
  const { data: includes } = useQuery({
    queryKey: ["experience-includes", experience?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("experience_includes")
        .select("*")
        .eq("experience_id", experience?.id)
        .eq("published", true)
        .order("order_index");
      if (error) throw error;
      return data;
    },
    enabled: !!experience?.id,
  });

  // Fetch reviews
  const { data: reviews } = useQuery({
    queryKey: ["experience-reviews", experience?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("experience_reviews")
        .select("*")
        .eq("experience_id", experience?.id)
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!experience?.id,
  });

  // Fetch extras
  const { data: extras } = useQuery({
    queryKey: ["experience-extras", experience?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experience_extras")
        .select(`
          extra_id,
          extras (*)
        `)
        .eq("experience_id", experience?.id);
      if (error) throw error;
      return data?.map((item: any) => item.extras).filter(Boolean) || [];
    },
    enabled: !!experience?.id,
  });

  const handleUpdateQuantity = (extraId: string, quantity: number) => {
    setSelectedExtras(prev => ({
      ...prev,
      [extraId]: Math.max(0, quantity)
    }));
  };

  const scrollToBooking = () => {
    if (isMobile) {
      setIsBookingSheetOpen(true);
    } else {
      bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">{t(lang, 'experienceNotFound')}</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Get localized content
  const title = getLocalizedField(experience, 'title', lang) as string || experience.title;
  const subtitle = getLocalizedField(experience, 'subtitle', lang) as string || experience.subtitle;
  const hotelName = getLocalizedField(experience.hotels, 'name', lang) as string || experience.hotels?.name;
  const city = getLocalizedField(experience.hotels, 'city', lang) as string || experience.hotels?.city;
  const longCopy = getLocalizedField(experience, 'long_copy', lang) as string || experience.long_copy;

  // Build gallery photos
  const galleryPhotos: string[] = [];
  if (experience.hero_image) galleryPhotos.push(experience.hero_image);
  if (experience.photos?.length) galleryPhotos.push(...experience.photos.filter((p: string) => p !== experience.hero_image));
  if (experience.hotels?.hero_image && !galleryPhotos.includes(experience.hotels.hero_image)) galleryPhotos.push(experience.hotels.hero_image);
  if (experience.hotels?.photos?.length) galleryPhotos.push(...experience.hotels.photos.filter((p: string) => !galleryPhotos.includes(p)));

  // Calculate average rating
  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length
    : null;

  return (
    <div className="min-h-screen flex flex-col" dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <SEOHead
        titleEn={experience.seo_title_en}
        titleHe={experience.seo_title_he}
        descriptionEn={experience.meta_description_en}
        descriptionHe={experience.meta_description_he}
        ogTitleEn={experience.og_title_en}
        ogTitleHe={experience.og_title_he}
        ogDescriptionEn={experience.og_description_en}
        ogDescriptionHe={experience.og_description_he}
        ogImage={experience.og_image || experience.hero_image}
        fallbackTitle={`${title} - ${hotelName || ''} - StayMakom`}
        fallbackDescription={subtitle || experience.long_copy?.substring(0, 155) || ""}
      />
      <Header />

      {/* Removed sticky search header - not needed since we have sticky booking panel */}

      <main className="flex-1">
        {/* HERO SECTION - Airbnb-style layout with integrated booking panel */}
        <section ref={heroRef}>
          <HeroSection
            photos={galleryPhotos}
            title={title}
            subtitle={subtitle}
            hotelName={hotelName}
            hotelImage={experience.hotels?.hero_image}
            city={city}
            region={getLocalizedField(experience.hotels, 'region', lang) as string || experience.hotels?.region}
            address={experience.address || experience.hotels?.city}
            averageRating={averageRating}
            reviewsCount={reviews?.length || 0}
            reviews={reviews || []}
            basePrice={experience.base_price}
            basePriceType={experience.base_price_type || 'per_person'}
            currency={experience.currency || 'EUR'}
            lang={lang}
            onViewDates={scrollToBooking}
            experienceId={experience.id}
            hotelId={experience.hotel_id}
            minParty={experience.min_party || 2}
            maxParty={experience.max_party || 4}
          />
        </section>

        {/* CONTENT - 2-column layout with sticky booking panel */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className={`grid md:grid-cols-[55fr_45fr] gap-4 md:gap-8 ${isMobile ? 'pb-20' : ''}`}>
            
            {/* LEFT COLUMN - Story content (progressive disclosure) */}
            <div className="space-y-0">
              
              {/* 1. AU PROGRAMME - Title + Description + Grid */}
              {includes && includes.length > 0 && (
                <ProgramTimeline includes={includes} lang={lang} introText={longCopy || undefined} />
              )}

              {/* 3. EXTRAS - Optional upgrades */}
              {extras && extras.length > 0 && (
                <section className="py-6 border-b border-border">
                  <ExtrasSection 
                    extras={extras} 
                    selectedExtras={selectedExtras} 
                    onUpdateQuantity={handleUpdateQuantity} 
                  />
                </section>
              )}

              {/* 4. YOUR STAY - Hotel integration (the anchor) */}
              <YourStaySection hotel={experience.hotels} lang={lang} />

              {/* 6. REVIEWS - Social proof */}
              {reviews && reviews.length > 0 && (
                <ReviewsGrid reviews={reviews} lang={lang} />
              )}

              {/* 7. PRACTICAL INFO - Details for committed users */}
              <PracticalInfo experience={experience} lang={lang} />

              {/* 8. LOCATION - Final context */}
              <LocationMap 
                latitude={experience.hotels?.latitude} 
                longitude={experience.hotels?.longitude}
                hotelName={hotelName}
                lang={lang}
              />

              {/* 9. OTHER EXPERIENCES - Keep exploring */}
              {experience.hotels && (
                <section className="py-6 pb-24">
                  <OtherExperiencesFromHotel 
                    hotelId={experience.hotel_id}
                    currentExperienceId={experience.id}
                    hotelName={hotelName}
                  />
                </section>
              )}
            </div>

            {/* RIGHT COLUMN - Sticky Booking Panel */}
            <div className="hidden md:block" ref={bookingRef}>
              <div className="sticky top-4">
                {/* Airbnb-style price header with CTA - with relief/shadow effect */}
                <div className="flex items-center justify-between mb-4 p-4 bg-card border border-border rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_24px_-4px_rgba(0,0,0,0.18)] transition-shadow">
                  <div className="flex flex-col">
                    <span className="text-base">
                      {lang === 'he' ? 'מ-' : lang === 'fr' ? 'À partir de ' : 'From '}
                      <span className="font-semibold underline">{experience.base_price} €</span>
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {experience.base_price_type === 'per_person' 
                        ? (lang === 'he' ? 'לאדם' : lang === 'fr' ? 'par voyageur' : 'per person') 
                        : (lang === 'he' ? 'להזמנה' : lang === 'fr' ? 'par réservation' : 'per booking')}
                    </span>
                    <span className="text-sm text-primary font-medium">
                      {lang === 'he' ? 'ביטול חינם' : lang === 'fr' ? 'Annulation gratuite' : 'Free cancellation'}
                    </span>
                  </div>
                  <Button 
                    variant="cta"
                    onClick={scrollToBooking}
                    className="px-8 py-3 font-medium text-sm"
                  >
                    {lang === 'he' ? 'לתאריכים' : lang === 'fr' ? 'Voir les dates' : 'View dates'}
                  </Button>
                </div>
                <BookingPanel 
                  experienceId={experience.id} 
                  hotelId={experience.hotel_id} 
                  basePrice={experience.base_price} 
                  basePriceType={experience.base_price_type || "per_person"} 
                  currency={experience.currency || "EUR"} 
                  minParty={experience.min_party || 2} 
                  maxParty={experience.max_party || 4} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* STICKY PRICE BAR - Desktop (appears on scroll) */}
        <StickyPriceBar
          basePrice={experience.base_price}
          basePriceType={experience.base_price_type || "per_person"}
          currency={experience.currency || "EUR"}
          averageRating={averageRating}
          reviewsCount={reviews?.length || 0}
          lang={lang}
          onViewDates={scrollToBooking}
          heroRef={heroRef as React.RefObject<HTMLElement>}
          footerRef={footerRef as React.RefObject<HTMLElement>}
        />

        {/* MOBILE STICKY BOTTOM BAR */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
            <Sheet open={isBookingSheetOpen} onOpenChange={setIsBookingSheetOpen}>
              <SheetTrigger asChild>
                <button className="w-full px-5 py-4 flex items-center justify-between">
                  <div className="flex flex-col items-start">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-base text-foreground underline">
                        {lang === 'he' ? `מ-${experience.base_price}€` : lang === 'fr' ? `À partir de ${experience.base_price}€` : `From ${experience.base_price}€`}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {experience.base_price_type === 'per_person' 
                        ? (lang === 'he' ? 'לאדם' : lang === 'fr' ? 'par voyageur' : 'per person') 
                        : (lang === 'he' ? 'להזמנה' : lang === 'fr' ? 'par réservation' : 'per booking')}
                    </span>
                  </div>
                  <Button 
                    variant="cta"
                    size="default" 
                    className="px-8 font-medium text-sm"
                  >
                    {lang === 'he' ? 'לתאריכים' : lang === 'fr' ? 'Voir les dates' : 'View dates'}
                  </Button>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[90vh] overflow-y-auto p-0 rounded-t-2xl">
                <div className="p-5 pt-8">
                  <BookingPanel 
                    experienceId={experience.id} 
                    hotelId={experience.hotel_id} 
                    basePrice={experience.base_price} 
                    basePriceType={experience.base_price_type || "per_person"} 
                    currency={experience.currency || "EUR"} 
                    minParty={experience.min_party || 2} 
                    maxParty={experience.max_party || 4} 
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </main>

      <footer ref={footerRef as React.RefObject<HTMLElement>}>
        <Footer />
      </footer>
    </div>
  );
};

export default ExperienceTest;
