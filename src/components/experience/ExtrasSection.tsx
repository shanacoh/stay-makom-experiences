import { Button } from "@/components/ui/button";
import { Plus, Minus, Sparkles } from "lucide-react";

interface Extra {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  image_url?: string;
  pricing_type: string;
}

interface ExtrasSectionProps {
  extras: Extra[];
  selectedExtras: { [key: string]: number };
  onUpdateQuantity: (extraId: string, quantity: number) => void;
}

const ExtrasSection = ({ extras, selectedExtras, onUpdateQuantity }: ExtrasSectionProps) => {
  if (!extras || extras.length === 0) return null;

  const getPricingLabel = (pricingType: string) => {
    switch (pricingType) {
      case "per_person":
        return "/ person";
      case "per_night":
        return "/ night";
      case "per_booking":
        return "/ booking";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sans text-3xl font-bold mb-2">Spice it up</h2>
        <p className="text-muted-foreground italic">Enhance your stay with optional extras you can add to your booking on the right.</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {extras.map((extra) => {
          const quantity = selectedExtras[extra.id] || 0;
          
          return (
            <div
              key={extra.id}
              className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow"
            >
              <div className="shrink-0">
                {extra.image_url ? (
                  <img src={extra.image_url} alt="" className="w-12 h-12 object-contain" />
                ) : (
                  <Sparkles className="w-12 h-12 text-primary" />
                )}
              </div>
              
              <div className="space-y-1 flex-1">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Extra
                </div>
                <h3 className="font-semibold text-sm leading-tight">{extra.name}</h3>
                {extra.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {extra.description}
                  </p>
                )}
                <div className="text-sm font-bold pt-1">
                  ${extra.price} <span className="text-xs font-normal text-muted-foreground">{getPricingLabel(extra.pricing_type)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                {quantity === 0 ? (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => onUpdateQuantity(extra.id, 1)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 w-full justify-center">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => onUpdateQuantity(extra.id, quantity - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-medium text-sm">{quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => onUpdateQuantity(extra.id, quantity + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExtrasSection;
