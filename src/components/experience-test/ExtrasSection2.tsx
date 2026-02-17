/**
 * Spice It Up – User-facing interactive extras section
 * Fetches hotel2_extras linked to the experience via experience2_extras
 * Users can toggle extras on/off, affecting the booking price
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Check } from "lucide-react";
import { DualPrice } from "@/components/ui/DualPrice";

export interface SelectedExtra {
  id: string;
  name: string;
  name_he: string | null;
  price: number;
  currency: string;
  pricing_type: string;
}

interface ExtrasSection2Props {
  experienceId: string;
  lang?: string;
  currency?: string;
  selectedExtras: SelectedExtra[];
  onToggleExtra: (extra: SelectedExtra) => void;
}

const ExtrasSection2 = ({
  experienceId,
  lang = "en",
  currency = "ILS",
  selectedExtras,
  onToggleExtra,
}: ExtrasSection2Props) => {
  // Fetch hotel2_extras linked to this experience via experience2_extras
  const { data: extras } = useQuery({
    queryKey: ["experience2-public-extras", experienceId],
    queryFn: async () => {
      // Get linked extra IDs
      const { data: links, error: linksError } = await (supabase as any)
        .from("experience2_extras")
        .select("extra_id")
        .eq("experience_id", experienceId);
      if (linksError) throw linksError;
      if (!links || links.length === 0) return [];

      const extraIds = links.map((l: any) => l.extra_id);

      // Fetch the actual extras
      const { data, error } = await supabase
        .from("hotel2_extras")
        .select("*")
        .in("id", extraIds)
        .eq("is_available", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  if (!extras || extras.length === 0) return null;

  const getTypeLabel = (type: string) => {
    const labels: Record<string, Record<string, string>> = {
      per_booking: { en: "/ booking", he: "/ הזמנה", fr: "/ réservation" },
      per_night: { en: "/ night", he: "/ לילה", fr: "/ nuit" },
      per_guest: { en: "/ guest", he: "/ אורח", fr: "/ voyageur" },
    };
    return labels[type]?.[lang] || labels[type]?.en || "";
  };

  const sectionTitle = lang === "he" ? "תוספות אופציונליות" : lang === "fr" ? "Personnalisez votre séjour" : "Spice it up";

  return (
    <section className="py-6 border-b border-border">
      <h2 className="font-serif text-xl md:text-2xl font-medium text-foreground mb-2">
        {sectionTitle}
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        {lang === "he"
          ? "הוסיפו תוספות לחוויה שלכם"
          : lang === "fr"
            ? "Ajoutez des extras optionnels à votre réservation"
            : "Enhance your stay with optional extras"}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {extras.map((extra) => {
          const isSelected = selectedExtras.some((se) => se.id === extra.id);
          const name = lang === "he" ? extra.name_he || extra.name : extra.name;

          const extraData: SelectedExtra = {
            id: extra.id,
            name: extra.name,
            name_he: extra.name_he,
            price: extra.price,
            currency: extra.currency,
            pricing_type: extra.pricing_type,
          };

          return (
            <button
              key={extra.id}
              type="button"
              onClick={() => onToggleExtra(extraData)}
              className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-primary/50 bg-muted/30"
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10"
              }`}>
                {isSelected ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{name}</p>
              </div>
              <div className="text-right shrink-0">
                <DualPrice amount={extra.price} currency={extra.currency} inline className="text-sm" />
                <span className="text-xs text-muted-foreground ml-1">{getTypeLabel(extra.pricing_type)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default ExtrasSection2;
