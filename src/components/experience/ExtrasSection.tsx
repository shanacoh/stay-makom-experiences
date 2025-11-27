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
              className={`group flex flex-col ${isPlaceholder ? 'opacity-40' : ''}`}
            >
              {/* Icon Container */}
              <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden flex items-center justify-center mb-3">
                <IconComponent className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-primary" />
              </div>
              
              {/* Content Container - Fixed heights for alignment */}
              <div className="flex flex-col flex-1">
                {/* Label */}
                <div className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Extra
                </div>
                
                {/* Title - Fixed 2-line height */}
                <h3 className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2 h-8 sm:h-9">
                  {extra.name}
                </h3>
                
                {/* Price - Directly under title, no extra spacing */}
                {!isPlaceholder && (
                  <div className="text-sm sm:text-base font-bold text-primary">
                    ${extra.price}
                    <span className="text-[10px] sm:text-xs font-normal text-muted-foreground ml-1">
                      {getPricingLabel(extra.pricing_type)}
                    </span>
                  </div>
                )}
                
                {/* Spacer to push button to bottom */}
                <div className="flex-1 min-h-2" />
                
                {/* Add Button */}
                {!isPlaceholder && (
                  <div className="mt-2">
                    {quantity === 0 ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-8 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => onUpdateQuantity(extra.id, 1)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 w-full justify-center bg-muted rounded-md p-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 hover:bg-background"
                          onClick={() => onUpdateQuantity(extra.id, quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-6 text-center font-semibold text-sm">{quantity}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 hover:bg-background"
                          onClick={() => onUpdateQuantity(extra.id, quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
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
