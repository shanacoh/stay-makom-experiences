import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ExperienceHero from "@/components/experience/ExperienceHero";
import TitleBlock from "@/components/experience/TitleBlock";
import BookingPanel from "@/components/experience/BookingPanel";
import ExperienceDetails from "@/components/experience/ExperienceDetails";
import WhatsIncludedPhotos from "@/components/experience/WhatsIncludedPhotos";
import ExtrasSection from "@/components/experience/ExtrasSection";
import GoodToKnow from "@/components/experience/GoodToKnow";
import ReviewsSection from "@/components/experience/ReviewsSection";
import OtherExperiencesFromHotel from "@/components/experience/OtherExperiencesFromHotel";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";
const Experience = () => {
  const {
    slug
  } = useParams<{
    slug: string;
  }>();
  const [selectedExtras, setSelectedExtras] = useState<{
    [key: string]: number;
  }>({});
  const [isBookingSheetOpen, setIsBookingSheetOpen] = useState(false);
  const isMobile = useIsMobile();
  const {
    data: experience,
    isLoading
  } = useQuery({
    queryKey: ["experience", slug],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("experiences").select(`
          *,
          hotels (*)
        `).eq("slug", slug).eq("status", "published").single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug
  });
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

  const { data: reviews } = useQuery({
    queryKey: ["experience-reviews", experience?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("experience_reviews")
        .select("*")
        .eq("experience_id", experience?.id)
        .eq("published", true);
      if (error) throw error;
      return data || [];
    },
    enabled: !!experience?.id,
  });
  const {
    data: extras
  } = useQuery({
    queryKey: ["experience-extras", experience?.id],
    queryFn: async () => {
      // Fetch extras through the experience_extras join table
      const { data, error } = await supabase
        .from("experience_extras")
        .select(`
          extra_id,
          extras (*)
        `)
        .eq("experience_id", experience?.id);

      if (error) throw error;
      
      // Filter to only available extras and flatten the structure
      return data
        ?.map((item: any) => item.extras)
        .filter((extra: any) => extra && extra.is_available)
        .sort((a: any, b: any) => (a?.sort_order || 0) - (b?.sort_order || 0)) || [];
    },
    enabled: !!experience?.id
  });
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>;
  }
  if (!experience) {
    return <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Experience not found</p>
        </main>
        <Footer />
      </div>;
  }
  const photos = experience.photos && experience.photos.length > 0 ? experience.photos : experience.hero_image ? [experience.hero_image] : experience.hotels?.hero_image ? [experience.hotels.hero_image] : [];
  return <div className="min-h-screen flex flex-col">
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
        fallbackTitle={`${experience.title} - ${experience.hotels?.name || ''} - StayMakom`}
        fallbackDescription={experience.subtitle || experience.long_copy?.substring(0, 155) || ""}
      />
      <Header />

      <main className="flex-1">
        <ExperienceHero title={experience.title} subtitle={experience.subtitle} hotelName={experience.hotels?.name} photos={photos} />

        <div className="container pb-16 px-4 sm:px-6 my-[26px]">
          <div className={`grid lg:grid-cols-3 gap-6 sm:gap-8 md:gap-12 ${isMobile ? 'pb-24' : ''}`}>
            {/* Left Column - Content */}
            <div className="lg:col-span-2 space-y-8 sm:space-y-10 md:space-y-12">
              {/* Title Block */}
              <TitleBlock
                title={experience.title}
                hotelName={experience.hotels?.name || ''}
                hotelSlug={experience.hotels?.slug}
                isNew={false}
                rating={reviews && reviews.length > 0 ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length : undefined}
                reviewCount={reviews?.length}
                city={experience.hotels?.city}
                address={(experience as any).address}
                googleMapsLink={(experience as any).google_maps_link}
              />

              {/* Description */}
              <ExperienceDetails experience={experience} />

              {/* What's Included */}
              <WhatsIncludedPhotos includes={includes} />

              {/* Spice It Up (Extras) */}
              <ExtrasSection 
                extras={extras || []} 
                selectedExtras={selectedExtras} 
                onUpdateQuantity={(extraId, quantity) => {
                  setSelectedExtras(prev => ({
                    ...prev,
                    [extraId]: quantity
                  }));
                }} 
              />

              {/* Reviews */}
              <ReviewsSection experienceId={experience.id} />

              {/* Good to Know */}
              <GoodToKnow items={experience.good_to_know} />

              {/* Other Experiences from This Hotel */}
              <OtherExperiencesFromHotel 
                hotelId={experience.hotel_id}
                currentExperienceId={experience.id}
                hotelName={experience.hotels?.name || ''}
              />
            </div>

            {/* Right Column - Sticky Booking Panel */}
            <div className="lg:col-span-1 hidden lg:block">
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
                      / {experience.base_price_type === 'per_person' ? 'personne' : 'séjour'} · -26%
                    </span>
                  </div>
                  <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90">
                    Book it now
                  </Button>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[90vh] overflow-y-auto p-0">
                <div className="p-6">
                  <BookingPanel experienceId={experience.id} hotelId={experience.hotel_id} basePrice={experience.base_price} basePriceType={experience.base_price_type || "per_person"} currency={experience.currency || "USD"} minParty={experience.min_party || 2} maxParty={experience.max_party || 4} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </main>

      <Footer />
    </div>;
};
export default Experience;