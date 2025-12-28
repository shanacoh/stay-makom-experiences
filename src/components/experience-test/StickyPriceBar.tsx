import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
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

  return (
    <div
      className={cn(
        "hidden md:block fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-all duration-300",
        isSticky && !isHidden ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      )}
    >
      <div className="container px-6">
        <div className="flex items-center justify-between py-4">
          {/* Left: Price info */}
          <div className="flex items-center gap-6">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold">
                  {lang === 'he' ? 'מ-' : lang === 'fr' ? 'À partir de ' : 'From '}
                  <span className="underline">{formattedPrice}</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{priceLabel}</p>
            </div>

            {/* Rating */}
            {averageRating && (
              <div className="flex items-center gap-1.5 text-sm">
                <Star className="h-4 w-4 fill-foreground text-foreground" />
                <span className="font-medium">{averageRating.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({reviewsCount} {lang === 'he' ? 'ביקורות' : lang === 'fr' ? 'avis' : 'reviews'})
                </span>
              </div>
            )}
          </div>

          {/* Right: CTA */}
          <Button 
            onClick={onViewDates}
            size="lg"
            className="px-8 font-medium"
          >
            {lang === 'he' ? 'בחרו תאריכים' : lang === 'fr' ? 'Voir les disponibilités' : 'Check availability'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StickyPriceBar;
