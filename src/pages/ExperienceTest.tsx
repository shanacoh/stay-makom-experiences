import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingPanel from "@/components/experience/BookingPanel";
import PhotoGrid from "@/components/experience-test/PhotoGrid";
import FeaturedReview from "@/components/experience-test/FeaturedReview";
import ProgramTimeline from "@/components/experience-test/ProgramTimeline";
import HostSection from "@/components/experience-test/HostSection";
import PracticalInfo from "@/components/experience-test/PracticalInfo";
import ReviewsGrid from "@/components/experience-test/ReviewsGrid";
import { Loader2, Star, MapPin } from "lucide-react";
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
  const isMobile = useIsMobile();

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

      <main className="flex-1">
        {/* Airbnb-style Photo Grid */}
        <PhotoGrid photos={galleryPhotos} title={title} />

        {/* Main Content */}
        <div className="container py-8 px-4 sm:px-6">
          <div className={`grid md:grid-cols-3 gap-8 lg:gap-12 ${isMobile ? 'pb-24' : ''}`}>
            {/* Left Column - Content */}
            <div className="md:col-span-2 space-y-0">
              {/* Title Block - Airbnb style */}
              <div className="pb-6 border-b border-border">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>
                
                {/* Rating, reviews, location */}
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  {averageRating && (
                    <>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-foreground text-foreground" />
                        <span className="font-semibold">{averageRating.toFixed(2)}</span>
                      </div>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground underline cursor-pointer">
                        {reviews?.length} {lang === 'he' ? 'ביקורות' : lang === 'en' ? 'reviews' : 'avis'}
                      </span>
                      <span className="text-muted-foreground">·</span>
                    </>
                  )}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{city}</span>
                  </div>
                  {hotelName && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">
                        {lang === 'he' ? 'מאת' : lang === 'en' ? 'Hosted by' : 'Hôte :'} {hotelName}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Featured Review - Airbnb style */}
              {reviews && reviews.length > 0 && (
                <div className="py-6">
                  <FeaturedReview reviews={reviews} lang={lang} />
                </div>
              )}

              {/* Description */}
              {longCopy && (
                <div className="py-6 border-b border-border">
                  <h2 className="text-xl font-bold mb-4">
                    {lang === 'he' ? 'על החוויה' : lang === 'en' ? 'About this experience' : 'À propos'}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {longCopy}
                  </p>
                </div>
              )}

              {/* Program Timeline - Airbnb style */}
              {includes && includes.length > 0 && (
                <ProgramTimeline includes={includes} lang={lang} />
              )}

              {/* Host Section - Airbnb style */}
              <HostSection hotel={experience.hotels} lang={lang} />

              {/* Practical Info - Airbnb style */}
              <PracticalInfo experience={experience} lang={lang} />

              {/* Reviews Grid - Airbnb style */}
              {reviews && reviews.length > 0 && (
                <ReviewsGrid reviews={reviews} lang={lang} />
              )}
            </div>

            {/* Right Column - Sticky Booking Panel (your current design) */}
            <div className="md:col-span-1 hidden md:block">
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

        {/* Mobile Sticky Bottom Bar */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
            <Sheet open={isBookingSheetOpen} onOpenChange={setIsBookingSheetOpen}>
              <SheetTrigger asChild>
                <button className="w-full p-4 flex items-center justify-between">
                  <div className="flex flex-col items-start">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-2xl text-foreground">
                        {experience.base_price}€
                      </span>
                      <span className="text-sm line-through text-muted-foreground">
                        {Math.round(experience.base_price * 1.26)}€
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      / {experience.base_price_type === 'per_person' ? (lang === 'he' ? 'אדם' : 'person') : (lang === 'he' ? 'הזמנה' : 'booking')} · -26%
                    </span>
                  </div>
                  <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90">
                    {t(lang, 'bookItNow')}
                  </Button>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[90vh] overflow-y-auto p-0">
                <div className="p-6">
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
