import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
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

// Hand-drawn style SVG illustrations for different extra types
const IllustratedIcons: { [key: string]: React.FC<{ className?: string }> } = {
  default: ({ className }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 8c-2 4-8 8-8 16s6 12 8 12 8-4 8-12-6-12-8-16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M28 52c0-2.2 1.8-4 4-4s4 1.8 4 4v4H28v-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="32" cy="20" r="2" fill="currentColor" opacity="0.5"/>
      <path d="M26 36c2-1 4-1 6-1s4 0 6 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
    </svg>
  ),
  wine: ({ className }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 8h16v8c0 8-4 14-8 14s-8-6-8-14V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M32 30v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M24 48h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <ellipse cx="32" cy="18" rx="6" ry="4" fill="currentColor" opacity="0.15"/>
      <path d="M27 12c1 2 3 4 5 4s4-2 5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
  spa: ({ className }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 56c-12 0-20-8-20-20 0-8 8-16 20-28 12 12 20 20 20 28 0 12-8 20-20 20z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M32 24v24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <path d="M26 32c3 2 6 4 6 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      <path d="M38 36c-3 2-6 4-6 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
    </svg>
  ),
  dining: ({ className }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="40" rx="20" ry="8" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 40v4c0 4.4 9 8 20 8s20-3.6 20-8v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 28c0-4 2-8 4-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <path d="M32 26c0-4 0-8 1-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <path d="M44 28c0-4-2-8-4-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
  adventure: ({ className }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 8L8 56h48L32 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M32 8L22 32l10 4 10-4L32 8z" fill="currentColor" opacity="0.1"/>
      <path d="M20 44l6-8 6 6 8-10 6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
      <circle cx="40" cy="28" r="3" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
    </svg>
  ),
  flowers: ({ className }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="24" r="8" stroke="currentColor" strokeWidth="2"/>
      <circle cx="24" cy="20" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
      <circle cx="40" cy="20" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
      <circle cx="28" cy="28" r="5" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
      <circle cx="36" cy="28" r="5" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
      <path d="M32 32v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M28 40c-4 4-8 4-8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <path d="M36 44c4 2 8 2 8 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
  breakfast: ({ className }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="28" cy="36" rx="16" ry="12" stroke="currentColor" strokeWidth="2"/>
      <ellipse cx="28" cy="34" rx="10" ry="6" fill="currentColor" opacity="0.1"/>
      <path d="M48 28c4 0 8 4 8 8s-4 8-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M18 20c2-4 6-8 10-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      <path d="M28 16c2-4 4-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
    </svg>
  ),
  gift: ({ className }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="24" width="40" height="32" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 32h40" stroke="currentColor" strokeWidth="2"/>
      <path d="M32 24v32" stroke="currentColor" strokeWidth="2"/>
      <path d="M32 24c-4-4-8-8-12-6s-2 8 4 10c4 1 8 0 8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M32 24c4-4 8-8 12-6s2 8-4 10c-4 1-8 0-8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

// Map icon names to illustrated icons
const getIllustratedIcon = (iconName?: string): React.FC<{ className?: string }> => {
  if (!iconName) return IllustratedIcons.default;
  
  const name = iconName.toLowerCase();
  if (name.includes('wine') || name.includes('glass') || name.includes('champagne')) return IllustratedIcons.wine;
  if (name.includes('spa') || name.includes('leaf') || name.includes('lotus') || name.includes('droplet')) return IllustratedIcons.spa;
  if (name.includes('utensil') || name.includes('dining') || name.includes('plate') || name.includes('chef')) return IllustratedIcons.dining;
  if (name.includes('mountain') || name.includes('bike') || name.includes('compass') || name.includes('map')) return IllustratedIcons.adventure;
  if (name.includes('flower') || name.includes('heart') || name.includes('rose')) return IllustratedIcons.flowers;
  if (name.includes('coffee') || name.includes('breakfast') || name.includes('sun')) return IllustratedIcons.breakfast;
  if (name.includes('gift') || name.includes('box') || name.includes('package')) return IllustratedIcons.gift;
  
  return IllustratedIcons.default;
};

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
        en: "Add thoughtful touches to elevate your stay",
        fr: "Ajoutez des attentions pour sublimer votre séjour",
        he: "הוסיפו נגיעות מחשבה כדי להעלות את השהייה שלכם"
      },
      addToStay: {
        en: "Add to my stay",
        fr: "Ajouter à mon séjour",
        he: "הוסף לשהייה שלי"
      },
      added: {
        en: "Added",
        fr: "Ajouté",
        he: "נוסף"
      },
      from: {
        en: "From",
        fr: "À partir de",
        he: "החל מ-"
      }
    };
    return texts[key]?.[lang] || texts[key]?.en || key;
  };

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'USD' ? '$' : currency === 'ILS' ? '₪' : '€';
    return `${getText('from')} ${symbol}${price}`;
  };

  return (
    <div className="space-y-8" dir={lang === 'he' ? 'rtl' : 'ltr'}>
      {/* Emotional header */}
      <div className="text-center max-w-lg mx-auto">
        <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground mb-3">
          {getText('sectionTitle')}
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          {getText('sectionSubtitle')}
        </p>
      </div>
      
      {/* Editorial cards - no grid, flowing layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {extras.map((extra) => {
          const quantity = selectedExtras[extra.id] || 0;
          const isAdded = quantity > 0;
          const name = getLocalizedField(extra, 'name', lang) as string || extra.name;
          const description = getLocalizedField(extra, 'description', lang) as string || extra.description;
          const IconComponent = getIllustratedIcon(extra.image_url);
          
          return (
            <div
              key={extra.id}
              className={`
                group relative bg-card rounded-2xl p-6 
                transition-all duration-300 ease-out
                border border-border/50
                ${isAdded 
                  ? 'ring-2 ring-primary/30 bg-primary/5 shadow-lg' 
                  : 'hover:shadow-xl hover:-translate-y-1 hover:border-border'
                }
              `}
            >
              {/* Illustrated icon */}
              <div className="mb-5">
                <div className={`
                  w-16 h-16 rounded-2xl 
                  flex items-center justify-center
                  transition-colors duration-300
                  ${isAdded 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                  }
                `}>
                  <IconComponent className="w-10 h-10" />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                {/* Title - primary focus */}
                <h3 className="font-semibold text-lg text-foreground leading-snug">
                  {name}
                </h3>

                {/* Micro-description - emotional, not functional */}
                {description && (
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                    {description}
                  </p>
                )}

                {/* Price - discreet and elegant */}
                <p className="text-sm text-muted-foreground/80 font-medium">
                  {formatPrice(extra.price, extra.currency)}
                </p>
              </div>

              {/* CTA Button */}
              <div className="mt-6">
                {!isAdded ? (
                  <Button
                    variant="outline"
                    className={`
                      w-full rounded-xl py-5 text-sm font-medium
                      border-2 border-foreground/20 
                      bg-background hover:bg-foreground hover:text-background
                      transition-all duration-300 ease-out
                      shadow-sm hover:shadow-md
                    `}
                    onClick={() => onUpdateQuantity(extra.id, 1)}
                  >
                    {getText('addToStay')}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="default"
                      className={`
                        flex-1 rounded-xl py-5 text-sm font-medium
                        bg-primary text-primary-foreground
                        shadow-md
                      `}
                      onClick={() => onUpdateQuantity(extra.id, 0)}
                    >
                      <Check className="w-4 h-4 me-2" />
                      {getText('added')}
                    </Button>
                  </div>
                )}
              </div>

              {/* Subtle corner decoration when added */}
              {isAdded && (
                <div className="absolute top-3 end-3">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExtrasSection;
