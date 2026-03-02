import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getLocalizedField, type Language } from "@/hooks/useLanguage";
import { MapPin } from "lucide-react";

interface OtherExperiences2Props {
  hotelId: string;
  currentExperienceId: string;
  lang?: string;
}

const OtherExperiences2 = ({ hotelId, currentExperienceId, lang = "en" }: OtherExperiences2Props) => {
  const { data: experiences } = useQuery({
    queryKey: ["hotel2-other-experiences", hotelId, currentExperienceId],
    queryFn: async () => {
      // Find other experiences2 sharing this hotel via the junction table
      const { data: links, error } = await supabase
        .from("experience2_hotels")
        .select("experience_id")
        .eq("hotel_id", hotelId)
        .neq("experience_id", currentExperienceId);

      if (error) throw error;
      if (!links || links.length === 0) return [];

      const ids = [...new Set(links.map((l) => l.experience_id))];

      const { data: exps, error: expErr } = await supabase
        .from("experiences2")
        .select("id, title, title_he, slug, hero_image, thumbnail_image, base_price, base_price_type, currency, hotel_id, hotels2(hero_image, city, city_he, name, name_he)")
        .in("id", ids)
        .eq("status", "published")
        .limit(4);

      if (expErr) throw expErr;
      return exps || [];
    },
  });

  if (!experiences || experiences.length === 0) return null;

  return (
    <section className="py-6">
      <h2 className="font-serif text-lg md:text-2xl font-medium text-foreground mb-4">
        {lang === "he" ? "חוויות נוספות" : lang === "fr" ? "Autres expériences" : "Other experiences"}
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {experiences.map((exp) => {
          const title = getLocalizedField(exp, "title", lang as Language) as string;
          const heroImage = (exp as any).thumbnail_image || exp.hero_image || (exp.hotels2 as any)?.hero_image || "/placeholder.svg";
          const city = getLocalizedField(exp.hotels2 || {}, "city", lang as Language) as string;

          return (
            <a
              key={exp.id}
              href={`/experience2/${exp.slug}?lang=${lang}`}
              className="group block space-y-1.5 sm:space-y-3"
            >
              <div className="aspect-[4/3] bg-muted rounded-md sm:rounded-lg overflow-hidden">
                <img src={heroImage} alt={title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <h3 className="font-semibold text-xs sm:text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {title}
                </h3>
                {city && (
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="line-clamp-1">{city}</span>
                  </div>
                )}
                <div className="text-xs sm:text-sm font-bold">
                  ${exp.base_price}
                  <span className="text-[10px] sm:text-xs font-normal text-muted-foreground ml-0.5">
                    / {exp.base_price_type === "per_person"
                      ? (lang === "he" ? "אדם" : "pers.")
                      : (lang === "he" ? "לילה" : "night")}
                  </span>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
};

export default OtherExperiences2;
