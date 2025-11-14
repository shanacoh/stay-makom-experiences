import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

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
        <h2 className="font-sans text-3xl font-bold mb-2">Add extras</h2>
        <p className="text-muted-foreground">Enhance your experience with these optional add-ons</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {extras.map((extra) => {
          const quantity = selectedExtras[extra.id] || 0;
          
          return (
            <Card key={extra.id} className="overflow-hidden">
              {extra.image_url && (
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={extra.image_url}
                    alt={extra.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{extra.name}</h3>
                    {extra.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {extra.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold">
                      ${extra.price} <span className="text-sm font-normal text-muted-foreground">{getPricingLabel(extra.pricing_type)}</span>
                    </div>
                    
                    {quantity === 0 ? (
                      <Button
                        size="sm"
                        onClick={() => onUpdateQuantity(extra.id, 1)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => onUpdateQuantity(extra.id, quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => onUpdateQuantity(extra.id, quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ExtrasSection;
