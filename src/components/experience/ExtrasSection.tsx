import { Button } from "@/components/ui/button";
import { Plus, Minus, Sparkles } from "lucide-react";
import { icons } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
  // Create placeholder items if fewer than 2
  const displayExtras = [...(extras || [])];
  while (displayExtras.length < 2) {
    displayExtras.push({
      id: `placeholder-${displayExtras.length}`,
      name: 'Extra',
      description: 'To be determined',
      price: 0,
      currency: 'EUR',
      pricing_type: 'per_booking',
      image_url: undefined,
    });
  }

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

  const getIconComponent = (iconName?: string): LucideIcon => {
    if (!iconName) return Sparkles;
    const IconComponent = icons[iconName as keyof typeof icons];
    return (IconComponent as LucideIcon) || Sparkles;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold mb-2">Spice it up</h2>
        <p className="text-xs sm:text-sm text-muted-foreground italic">Enhance your stay with optional extras you can add to your booking on the right.</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {displayExtras.map((extra) => {
          const isPlaceholder = extra.id.startsWith('placeholder');
          const quantity = selectedExtras[extra.id] || 0;
          const IconComponent = getIconComponent(extra.image_url);
          
          return (
            <div
              key={extra.id}
              className={`group space-y-2 sm:space-y-3 ${isPlaceholder ? 'opacity-50' : ''}`}
            >
              <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                <IconComponent className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-primary" />
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <div className="space-y-0.5 sm:space-y-1">
                  <div className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Extra
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm leading-tight">{extra.name}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed h-6 sm:h-8 line-clamp-2">
                    {extra.description || '\u00A0'}
                  </p>
                  {!isPlaceholder && (
                    <div className="text-xs sm:text-sm font-bold pt-0.5 sm:pt-1">
                      ${extra.price} <span className="text-[10px] sm:text-xs font-normal text-muted-foreground">{getPricingLabel(extra.pricing_type)}</span>
                    </div>
                  )}
                </div>
                
                {!isPlaceholder && (
                  <div className="flex items-center justify-center pt-0.5 sm:pt-1">
                    {quantity === 0 ? (
                    <Button
                      size="sm"
                      className="w-full h-7 sm:h-8 text-[10px] sm:text-xs"
                      onClick={() => onUpdateQuantity(extra.id, 1)}
                    >
                      <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                      Add
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1.5 sm:gap-2 w-full justify-center">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6 sm:h-7 sm:w-7"
                        onClick={() => onUpdateQuantity(extra.id, quantity - 1)}
                      >
                        <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </Button>
                      <span className="w-5 sm:w-6 text-center font-medium text-xs sm:text-sm">{quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6 sm:h-7 sm:w-7"
                        onClick={() => onUpdateQuantity(extra.id, quantity + 1)}
                      >
                        <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </Button>
                    </div>
                  )}
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
