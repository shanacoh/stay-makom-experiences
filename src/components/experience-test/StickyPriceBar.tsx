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
  heroRef: React.RefObject<HTMLElement>;
  footerRef: React.RefObject<HTMLElement>;
}

const StickyPriceBar = ({
  basePrice,
  basePriceType,
  currency,
  averageRating,
  reviewsCount = 0,
  lang,
  onViewDates,
  heroRef,
  footerRef
}: StickyPriceBarProps) => {
  const [isSticky, setIsSticky] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;

      const heroRect = heroRef.current.getBoundingClientRect();
      const heroBottom = heroRect.bottom;
      
      // Show sticky bar when hero price is scrolled out of view
      setIsSticky(heroBottom < 100);

      // Hide when footer is in view
      if (footerRef.current) {
        const footerRect = footerRef.current.getBoundingClientRect();
        setIsHidden(footerRect.top < window.innerHeight);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [heroRef, footerRef]);

  const priceLabel = basePriceType === 'per_person' 
    ? (lang === 'he' ? 'לאדם' : lang === 'fr' ? 'par voyageur' : 'per person')
    : (lang === 'he' ? 'להזמנה' : lang === 'fr' ? 'par réservation' : 'per booking');

  const currencySymbol = currency === 'USD' ? '$' : '€';
  const formattedPrice = lang === 'he' 
    ? `${currencySymbol}${basePrice}`
    : `${basePrice}${currencySymbol}`;

  // Only show on mobile - desktop has sticky booking panel
  return (
    <div
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-all duration-300",
        isSticky && !isHidden ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      )}
    >
      <div className="container px-4">
        <div className="flex items-center justify-between py-3">
          {/* Left: Price info */}
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm">
                {lang === 'he' ? 'מ-' : lang === 'fr' ? 'À partir de ' : 'From '}
              </span>
              <span className="text-base font-semibold underline">{formattedPrice}</span>
              <span className="text-xs text-muted-foreground ml-1">{priceLabel}</span>
            </div>
            <p className="text-sm text-cta font-medium">
              {lang === 'he' ? 'ביטול חינם' : lang === 'fr' ? 'Annulation gratuite' : 'Free cancellation'}
            </p>
          </div>

          {/* Right: CTA - rounded style */}
          <Button 
            onClick={onViewDates}
            variant="cta"
            className="px-6 rounded-full font-medium"
          >
            {lang === 'he' ? 'לתאריכים' : lang === 'fr' ? 'Voir les dates' : 'View dates'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StickyPriceBar;
