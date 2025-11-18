import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ExperienceHero from "@/components/experience/ExperienceHero";
import HotelSpotlight from "@/components/experience/HotelSpotlight";
import BookingPanel from "@/components/experience/BookingPanel";
import ExperienceDetails from "@/components/experience/ExperienceDetails";
import WhatsIncludedPhotos from "@/components/experience/WhatsIncludedPhotos";
import ExtrasSection from "@/components/experience/ExtrasSection";
import GoodToKnow from "@/components/experience/GoodToKnow";
import ReviewsSection from "@/components/experience/ReviewsSection";
import ImportantInformation from "@/components/experience/ImportantInformation";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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
  const {
    data: includes,
    isLoading: includesLoading
  } = useQuery({
    queryKey: ["experience-includes", experience?.id],
    queryFn: async () => {
      const {
        data,
        error
      } = await (supabase as any).from("experience_includes").select("*").eq("experience_id", experience?.id).eq("published", true).order("order_index");
      if (error) throw error;
      return data;
    },
    enabled: !!experience?.id
  });
  const {
    data: extras
  } = useQuery({
    queryKey: ["experience-extras", experience?.id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("extras").select("*").eq("experience_id", experience?.id).eq("is_available", true).order("sort_order");
      if (error) throw error;
      return data;
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
      <Header />

      <main className="flex-1">
        <ExperienceHero title={experience.title} subtitle={experience.subtitle} hotelName={experience.hotels?.name} photos={photos} />

        <div className="container pb-16 my-[26px]">
          <div className={`grid lg:grid-cols-3 gap-12 ${isMobile ? 'pb-24' : ''}`}>
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-12">
              <ExperienceDetails longCopy={experience.long_copy} />

              {includes && includes.length > 0 && <WhatsIncludedPhotos includes={includes} />}

              {extras && extras.length > 0 && <ExtrasSection extras={extras} selectedExtras={selectedExtras} onUpdateQuantity={(extraId, quantity) => {
              setSelectedExtras(prev => ({
                ...prev,
                [extraId]: quantity
              }));
            }} />}

              <GoodToKnow items={experience.good_to_know} />

              {experience.hotels && <HotelSpotlight hotel={experience.hotels} />}

              <ReviewsSection experienceId={experience.id} />

              <ImportantInformation checkinTime={(experience as any).checkin_time} checkoutTime={(experience as any).checkout_time} address={(experience as any).address} googleMapsLink={(experience as any).google_maps_link} accessibilityInfo={(experience as any).accessibility_info} services={(experience as any).services} />
            </div>

            {/* Right Column - Booking Panel */}
            <div className="lg:col-span-1 hidden lg:block">
              <BookingPanel experienceId={experience.id} hotelId={experience.hotel_id} basePrice={experience.base_price} basePriceType={experience.base_price_type || "per_person"} currency={experience.currency || "USD"} minParty={experience.min_party || 2} maxParty={experience.max_party || 4} />
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