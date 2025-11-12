import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ExtrasSelectorProps {
  experienceId: string;
  partySize: number;
  selectedExtras: Record<string, number>;
  onExtrasChange: (extras: Record<string, number>, total: number) => void;
}

const ExtrasSelector = ({
  experienceId,
  partySize,
  selectedExtras,
  onExtrasChange,
}: ExtrasSelectorProps) => {
  const { data: extras, isLoading } = useQuery({
    queryKey: ["extras", experienceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extras")
        .select("*")
        .eq("experience_id", experienceId)
        .eq("is_available", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !extras || extras.length === 0) {
    return null;
  }

  const updateQuantity = (extraId: string, delta: number) => {
    const currentQty = selectedExtras[extraId] || 0;
    const extra = extras.find((e) => e.id === extraId);
    if (!extra) return;

    const newQty = Math.max(0, Math.min(currentQty + delta, extra.max_qty || 10));
    
    const newExtras = { ...selectedExtras };
    if (newQty === 0) {
      delete newExtras[extraId];
    } else {
      newExtras[extraId] = newQty;
    }
    
    // Calculate new total
    const total = Object.entries(newExtras).reduce((sum, [id, qty]) => {
      const extra = extras.find((e) => e.id === id);
      if (!extra) return sum;
      return sum + (extra.price * qty);
    }, 0);
    
    onExtrasChange(newExtras, total);
  };

  const getPricingLabel = (extra: any) => {
    const typeMap = {
      per_person: "/ personne",
      per_night: "/ nuit",
      per_booking: "/ séjour"
    };
    return typeMap[extra.pricing_type as keyof typeof typeMap] || "/ séjour";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold mb-2">Extras</h2>
        <p className="text-muted-foreground">Vous pourrez ajouter des extras à l'étape suivante</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {extras.map((extra) => {
          const qty = selectedExtras[extra.id] || 0;
          const unitPrice = extra.price;

          return (
            <button
              key={extra.id}
              onClick={() => updateQuantity(extra.id, qty > 0 ? -qty : 1)}
              className="text-left p-6 bg-muted rounded-lg hover:bg-muted/80 transition-colors space-y-4"
            >
              <div className="w-16 h-16 flex items-center justify-center text-4xl">
                {extra.name.toLowerCase().includes("champagne") && "🍾"}
                {extra.name.toLowerCase().includes("rose") && "🌹"}
                {extra.name.toLowerCase().includes("macaron") && "🤌"}
                {extra.name.toLowerCase().includes("check-out") && "🏊"}
                {!["champagne", "rose", "macaron", "check-out"].some(k => extra.name.toLowerCase().includes(k)) && "✨"}
              </div>
              
              <div className="space-y-1">
                <p className="text-base font-semibold">
                  +{unitPrice}€ {getPricingLabel(extra)}
                </p>
                <p className="text-base">
                  {extra.name}
                </p>
              </div>
              
              {qty > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-sm font-medium text-primary">
                    Ajouté ({qty})
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ExtrasSelector;
