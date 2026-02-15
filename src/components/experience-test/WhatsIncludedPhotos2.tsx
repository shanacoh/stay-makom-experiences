import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { icons, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface WhatsIncludedPhotos2Props {
  experienceId: string;
  lang?: string;
}

const WhatsIncludedPhotos2 = ({ experienceId, lang = "en" }: WhatsIncludedPhotos2Props) => {
  const { data: includes } = useQuery({
    queryKey: ["experience2-includes", experienceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experience2_includes")
        .select("*")
        .eq("experience_id", experienceId)
        .eq("published", true)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  if (!includes || includes.length === 0) return null;

  const heading =
    lang === "he" ? "מה כולל" : lang === "fr" ? "Ce qui est inclus" : "What's included";

  const isImageUrl = (url?: string | null): boolean =>
    !!url && (url.startsWith("http://") || url.startsWith("https://"));

  const getIconComponent = (iconName?: string | null): LucideIcon => {
    if (!iconName || isImageUrl(iconName)) return Sparkles;
    const IconComponent = icons[iconName as keyof typeof icons];
    return (IconComponent as LucideIcon) || Sparkles;
  };

  return (
    <div className="space-y-4 sm:space-y-6" dir={lang === "he" ? "rtl" : "ltr"}>
      <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold">{heading}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {includes.map((item) => {
          const title = lang === "he" ? item.title_he || item.title : item.title;
          const description =
            lang === "he" ? item.description_he || item.description : item.description;
          const hasImageUrl = isImageUrl(item.icon_url);
          const IconComponent = getIconComponent(item.icon_url);

          return (
            <div key={item.id} className="group flex flex-col">
              <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden flex items-center justify-center mb-3">
                {hasImageUrl ? (
                  <img
                    src={item.icon_url!}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <IconComponent className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-primary" />
                )}
              </div>
              <div className="flex flex-col flex-1">
                <h3 className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2 h-8 sm:h-9">
                  {title}
                </h3>
                {description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WhatsIncludedPhotos2;
