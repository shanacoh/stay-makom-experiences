import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StickyPriceBarProps {
  basePrice: number;
  basePriceType: string;
  currency: string;
  averageRating?: number | null;
  reviewsCount?: number;
  lang: 'en' | 'he' | 'fr';
  onViewDates: () => void;
  footerRef: React.RefObject<HTMLElement>;
  hasHyperguest?: boolean;
}

const StickyPriceBar = ({
  basePrice,
  basePriceType,
  currency,
  lang,
  onViewDates,
  footerRef,
  hasHyperguest = false,
}: StickyPriceBarProps) => {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (footerRef.current) {
        const footerRect = footerRef.current.getBoundingClientRect();
        setIsHidden(footerRect.top < window.innerHeight);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [footerRef]);

  const getCurrencySymbol = (cur: string) => {
    if (cur === 'ILS') return '₪';
    if (cur === 'EUR') return '€';
    return '$';
  };

  const symbol = getCurrencySymbol(currency);
  const formattedPrice = `${symbol}${Math.round(basePrice)}`;
  const nightLabel = lang === 'he' ? 'ללילה' : lang === 'fr' ? '/ nuit' : '/ night';

  const ctaLabel = hasHyperguest
    ? (lang === 'he' ? 'לתאריכים' : lang === 'fr' ? 'Voir les dates' : 'View dates')
    : (lang === 'he' ? 'בקשו שהייה' : lang === 'fr' ? 'Demander ce séjour' : 'Request this stay');

  return (
    <div
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-all duration-300",
        isHidden ? "translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
      )}
    >
      <div className="container px-4 pb-safe">
        <div className="flex items-center justify-between py-3">
          {/* Left: Price */}
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-muted-foreground">
                {lang === 'he' ? 'מ-' : 'From '}
              </span>
              <span className="text-base font-semibold text-foreground">{formattedPrice}</span>
              <span className="text-xs text-muted-foreground">{nightLabel}</span>
            </div>
          </div>

          {/* Right: CTA */}
          <Button 
            onClick={onViewDates}
            className="px-5 rounded-full font-medium bg-foreground text-background hover:bg-foreground/90"
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StickyPriceBar;
