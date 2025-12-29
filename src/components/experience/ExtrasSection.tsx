import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";
import { useLanguage, getLocalizedField } from "@/hooks/useLanguage";

interface Extra {
  id: string;
  name: string;
  name_he?: string | null;
  description?: string;
  description_he?: string | null;
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
  const { lang } = useLanguage();
  
  // Only show real extras, no placeholders
  if (!extras || extras.length === 0) return null;

  const getText = (key: string) => {
    const texts: { [key: string]: { en: string; fr: string; he: string } } = {
      sectionTitle: {
        en: "Make it unforgettable",
        fr: "Rendez-le inoubliable",
        he: "הפכו את זה לבלתי נשכח"
      },
      sectionSubtitle: {
        en: "Thoughtful touches to elevate your stay",
        fr: "Des attentions pour sublimer votre séjour",
        he: "נגיעות מחשבה להעלאת השהייה"
      },
      add: {
        en: "Add",
        fr: "Ajouter",
        he: "הוסף"
      },
      added: {
        en: "Added",
        fr: "Ajouté",
        he: "נוסף"
      }
    };
    return texts[key]?.[lang] || texts[key]?.en || key;
  };

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'USD' ? '$' : currency === 'ILS' ? '₪' : '€';
    return `+${symbol}${price}`;
  };

  // Check if image_url is an actual image URL
  const isImageUrl = (url?: string) => url && (url.startsWith('http') || url.startsWith('/'));

  return (
    <div className="space-y-5" dir={lang === 'he' ? 'rtl' : 'ltr'}>
      {/* Compact header */}
      <div>
        <h2 className="font-serif text-xl md:text-2xl font-medium text-foreground mb-1">
          {getText('sectionTitle')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {getText('sectionSubtitle')}
        </p>
      </div>
      
      {/* Grid layout - 2 cols mobile, 3 cols desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {extras.map((extra) => {
          const quantity = selectedExtras[extra.id] || 0;
          const isAdded = quantity > 0;
          const name = getLocalizedField(extra, 'name', lang) as string || extra.name;
          const description = getLocalizedField(extra, 'description', lang) as string || extra.description;
          const hasImage = isImageUrl(extra.image_url);
          
          return (
            <div
              key={extra.id}
              className={`
                group flex flex-col rounded-xl overflow-hidden
                transition-all duration-200 ease-out
                border
                ${isAdded 
                  ? 'border-primary/40 bg-primary/5' 
                  : 'border-border/60 hover:border-border hover:bg-muted/30'
                }
              `}
            >
              {/* Image banner */}
              <div className={`
                w-full h-20 overflow-hidden
                ${hasImage ? '' : 'bg-gradient-to-br from-muted to-muted/50'}
                flex items-center justify-center
              `}>
                {hasImage ? (
                  <img 
                    src={extra.image_url} 
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-lg">✦</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3 flex flex-col flex-1">
                <h3 className="font-medium text-sm text-foreground leading-snug line-clamp-2">
                  {name}
                </h3>
                {description && (
                  <p className="text-muted-foreground text-xs leading-relaxed line-clamp-1 mt-0.5">
                    {description}
                  </p>
                )}
                <span className="text-xs text-muted-foreground/70 mt-1">
                  {formatPrice(extra.price, extra.currency)}
                </span>

                {/* CTA Button - full width */}
                <div className="mt-auto pt-2">
                  {!isAdded ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className={`
                        w-full h-7 text-xs font-medium rounded-full
                        border-foreground/20 
                        hover:bg-foreground hover:text-background hover:border-foreground
                        transition-all duration-200
                      `}
                      onClick={() => onUpdateQuantity(extra.id, 1)}
                    >
                      <Plus className="w-3 h-3 me-1" />
                      {getText('add')}
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full h-7 text-xs font-medium rounded-full"
                      onClick={() => onUpdateQuantity(extra.id, 0)}
                    >
                      <Check className="w-3 h-3 me-1" />
                      {getText('added')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExtrasSection;
