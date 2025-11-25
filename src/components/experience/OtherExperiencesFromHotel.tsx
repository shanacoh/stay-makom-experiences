import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage, getLocalizedField } from "@/hooks/useLanguage";
import { MapPin, Star } from "lucide-react";

interface OtherExperiencesProps {
  hotelId: string;
  currentExperienceId: string;
  hotelName: string;
}

const OtherExperiencesFromHotel = ({ hotelId, currentExperienceId, hotelName }: OtherExperiencesProps) => {
  const { lang } = useLanguage();

  const { data: experiences, isLoading } = useQuery({
    queryKey: ["hotel-other-experiences", hotelId, currentExperienceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("hotel_id", hotelId)
        .eq("status", "published")
        .neq("id", currentExperienceId)
        .limit(4);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !experiences || experiences.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold">
        {lang === 'he' 
          ? `חוויות נוספות מ-${hotelName}` 
          : `Other experiences from ${hotelName}`}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {experiences.map((exp) => {
          const title = getLocalizedField(exp, 'title', lang) as string;
          const heroImage = exp.hero_image || exp.photos?.[0] || '/placeholder.svg';

          return (
            <a
              key={exp.id}
              href={`/experience/${exp.slug}?lang=${lang}`}
              className="group block space-y-2 sm:space-y-3"
            >
              {/* Image */}
              <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                <img
                  src={heroImage}
                  alt={title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="space-y-1">
                <h3 className="font-semibold text-sm sm:text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {title}
                </h3>
                
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="line-clamp-1">
                    {getLocalizedField(exp, 'city', lang) || hotelName}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold">
                    {exp.base_price}€
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      / {exp.base_price_type === 'per_person' 
                        ? (lang === 'he' ? 'אדם' : 'person') 
                        : (lang === 'he' ? 'לילה' : 'night')}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default OtherExperiencesFromHotel;
