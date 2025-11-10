import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";

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

  // Calculate total whenever extras or data changes
  useEffect(() => {
    if (!extras) return;
    
    const total = Object.entries(selectedExtras).reduce((sum, [id, qty]) => {
      const extra = extras.find((e) => e.id === id);
      if (!extra) return sum;
      return sum + (extra.price * qty);
    }, 0);
    
    onExtrasChange(selectedExtras, total);
  }, [selectedExtras, extras]);

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

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Add-ons (Optional)</label>
      <div className="space-y-3">
        {extras.map((extra) => {
          const qty = selectedExtras[extra.id] || 0;
          const unitPrice = extra.price;
          const subtotal = qty * unitPrice;

          return (
            <Card key={extra.id} className="p-4">
              <div className="flex justify-between items-start gap-4 mb-3">
                <div className="flex-1">
                  <p className="font-medium">{extra.name}</p>
                  {extra.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {extra.description}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    ${unitPrice} {extra.pricing_type === "per_person" && "per person"}
                    {extra.pricing_type === "per_night" && "per night"}
                    {extra.pricing_type === "per_booking" && "per booking"}
                  </p>
                </div>
                {qty > 0 && (
                  <p className="font-bold text-lg whitespace-nowrap">
                    ${subtotal}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(extra.id, -1)}
                  disabled={qty === 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{qty}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(extra.id, 1)}
                  disabled={qty >= (extra.max_qty || 10)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ExtrasSelector;
