import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EXPERIENCE_PRICING_TYPES } from "@/types/experience2_addons";
import { Sparkles } from "lucide-react";

interface ExtrasSection2Props {
  experienceId: string;
  lang?: string;
  currency?: string;
}

const ExtrasSection2 = ({ experienceId, lang = "en", currency = "ILS" }: ExtrasSection2Props) => {
  const { data: addons } = useQuery({
    queryKey: ["experience2-extras", experienceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experience2_addons")
        .select("*")
        .eq("experience_id", experienceId)
        .eq("is_active", true)
        .in("type", EXPERIENCE_PRICING_TYPES as any)
        .order("calculation_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  if (!addons || addons.length === 0) return null;

  const formatPrice = (value: number, isPercentage: boolean | null) => {
    if (isPercentage) return `${value}%`;
    return new Intl.NumberFormat(lang === "he" ? "he-IL" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, Record<string, string>> = {
      per_person: { en: "/ person", he: "/ אדם", fr: "/ pers." },
      per_night: { en: "/ night", he: "/ לילה", fr: "/ nuit" },
      per_person_per_night: { en: "/ person / night", he: "/ אדם / לילה", fr: "/ pers. / nuit" },
      fixed: { en: "flat fee", he: "מחיר קבוע", fr: "forfait" },
    };
    return labels[type]?.[lang] || labels[type]?.en || "";
  };

  return (
    <section className="py-6 border-b border-border">
      <h2 className="font-serif text-xl md:text-2xl font-medium text-foreground mb-4">
        {lang === "he" ? "תוספות זמינות" : lang === "fr" ? "Extras disponibles" : "Available extras"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addons.map((addon) => {
          const name = lang === "he" ? addon.name_he || addon.name : addon.name;
          const description = lang === "he" ? addon.description_he || addon.description : addon.description;

          return (
            <div key={addon.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{name}</p>
                {description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="font-bold text-sm">{formatPrice(addon.value, addon.is_percentage)}</span>
                <span className="text-xs text-muted-foreground ml-1">{getTypeLabel(addon.type)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ExtrasSection2;
