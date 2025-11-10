import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ExperienceHero from "@/components/experience/ExperienceHero";
import HotelSpotlight from "@/components/experience/HotelSpotlight";
import BookingPanel from "@/components/experience/BookingPanel";
import ExperienceDetails from "@/components/experience/ExperienceDetails";
import { Loader2 } from "lucide-react";

const Experience = () => {
  const { slug } = useParams<{ slug: string }>();

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
    enabled: !!slug,
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
          <p className="text-muted-foreground">Experience not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  const photos = experience.photos && experience.photos.length > 0 
    ? experience.photos 
    : experience.hero_image 
    ? [experience.hero_image] 
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <ExperienceHero
          title={experience.title}
          subtitle={experience.subtitle}
          photos={photos}
        />

        <div className="container pb-16">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-12">
              {experience.hotels && (
                <HotelSpotlight hotel={experience.hotels} />
              )}

              <ExperienceDetails
                longCopy={experience.long_copy}
                includes={experience.includes}
                notIncludes={experience.not_includes}
                goodToKnow={experience.good_to_know}
              />
            </div>

            {/* Right Column - Booking Panel */}
            <div className="lg:col-span-1">
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
      </main>

      <Footer />
    </div>
  );
};

export default Experience;
