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
    <div className="space-y-2">
      <label className="text-sm font-medium">Extras (optionnel)</label>
      <div className="space-y-2">
        {extras.map((extra) => {
          const qty = selectedExtras[extra.id] || 0;
          const unitPrice = extra.price;

          return (
            <label
              key={extra.id}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50 ${
                qty > 0
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
            >
              <input
                type="checkbox"
                checked={qty > 0}
                onChange={() => updateQuantity(extra.id, qty > 0 ? -qty : 1)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium text-sm">{extra.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {extra.description || getPricingLabel(extra)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold">+{unitPrice}€</div>
                    <div className="text-xs text-muted-foreground">{getPricingLabel(extra)}</div>
                  </div>
                </div>
                {qty > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        updateQuantity(extra.id, -1);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium min-w-[2rem] text-center">
                      {qty}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        updateQuantity(extra.id, 1);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default ExtrasSelector;
