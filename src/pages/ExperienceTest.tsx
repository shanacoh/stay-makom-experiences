import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingPanel from "@/components/experience/BookingPanel";
import HeroSection from "@/components/experience-test/HeroSection";
import HeroBookingPreview from "@/components/experience-test/HeroBookingPreview";
import FeaturedReview from "@/components/experience-test/FeaturedReview";
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
  const isMobile = useIsMobile();
  const bookingRef = useRef<HTMLDivElement>(null);

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

  // Get featured review for hero
  const featuredReview = reviews && reviews.length > 0 ? reviews[0] : null;

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

      <main className="flex-1">
        {/* Hero Section - Airbnb style: Photos left, Info right */}
        <HeroSection
          photos={galleryPhotos}
          title={title}
          subtitle={subtitle}
          hotelName={hotelName}
          city={city}
          averageRating={averageRating}
          reviewsCount={reviews?.length || 0}
          lang={lang}
        >
          <HeroBookingPreview
            basePrice={experience.base_price}
            basePriceType={experience.base_price_type || "per_person"}
            currency={experience.currency || "EUR"}
            averageRating={averageRating}
            reviewsCount={reviews?.length || 0}
            featuredReview={featuredReview}
            lang={lang}
            onViewDates={scrollToBooking}
          />
        </HeroSection>

        {/* Rest of Content */}
        <div className="container py-6 px-4 sm:px-6">
          <div className={`grid md:grid-cols-3 gap-6 lg:gap-8 ${isMobile ? 'pb-24' : ''}`}>
            {/* Left Column - Content */}
            <div className="md:col-span-2 space-y-0">
              {/* Description */}
              {longCopy && (
                <div className="py-6 border-b border-border">
                  <h2 className="text-lg font-bold mb-3">
                    {lang === 'he' ? 'על החוויה' : lang === 'en' ? 'About this experience' : 'À propos de cette expérience'}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                    {longCopy}
                  </p>
                </div>
              )}

              {/* Program Timeline */}
              {includes && includes.length > 0 && (
                <ProgramTimeline includes={includes} lang={lang} />
              )}

              {/* Extras Section */}
              {extras && extras.length > 0 && (
                <div className="py-6 border-b border-border">
                  <ExtrasSection 
                    extras={extras} 
                    selectedExtras={selectedExtras} 
                    onUpdateQuantity={handleUpdateQuantity} 
                  />
                </div>
              )}

              {/* Host Section */}
              <HostSection hotel={experience.hotels} lang={lang} />

              {/* Practical Info */}
              <PracticalInfo experience={experience} lang={lang} />

              {/* Reviews Grid */}
              {reviews && reviews.length > 0 && (
                <ReviewsGrid reviews={reviews} lang={lang} />
              )}

              {/* Location Map */}
              <LocationMap 
                latitude={experience.hotels?.latitude} 
                longitude={experience.hotels?.longitude}
                hotelName={hotelName}
                lang={lang}
              />

              {/* Other Experiences */}
              {experience.hotels && (
                <div className="py-6">
                  <OtherExperiencesFromHotel 
                    hotelId={experience.hotel_id}
                    currentExperienceId={experience.id}
                    hotelName={hotelName}
                  />
                </div>
              )}
            </div>

            {/* Right Column - Sticky Booking Panel */}
            <div className="md:col-span-1 hidden md:block" ref={bookingRef}>
              <div className="sticky top-4">
                <BookingPanel 
                  experienceId={experience.id} 
                  hotelId={experience.hotel_id} 
                  basePrice={experience.base_price} 
                  basePriceType={experience.base_price_type || "per_person"} 
                  currency={experience.currency || "USD"} 
                  minParty={experience.min_party || 2} 
                  maxParty={experience.max_party || 4} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bottom Bar */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
            <Sheet open={isBookingSheetOpen} onOpenChange={setIsBookingSheetOpen}>
              <SheetTrigger asChild>
                <button className="w-full p-3 flex items-center justify-between">
                  <div className="flex flex-col items-start">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-xl text-foreground">
                        {experience.base_price}€
                      </span>
                      <span className="text-xs line-through text-muted-foreground">
                        {Math.round(experience.base_price * 1.26)}€
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      / {experience.base_price_type === 'per_person' ? (lang === 'he' ? 'אדם' : 'person') : (lang === 'he' ? 'הזמנה' : 'booking')} · -26%
                    </span>
                  </div>
                  <Button size="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {t(lang, 'bookItNow')}
                  </Button>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[90vh] overflow-y-auto p-0">
                <div className="p-4">
                  <BookingPanel 
                    experienceId={experience.id} 
                    hotelId={experience.hotel_id} 
                    basePrice={experience.base_price} 
                    basePriceType={experience.base_price_type || "per_person"} 
                    currency={experience.currency || "USD"} 
                    minParty={experience.min_party || 2} 
                    maxParty={experience.max_party || 4} 
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ExperienceTest;
