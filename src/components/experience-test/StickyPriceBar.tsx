import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MOBILE_BOTTOM_NAV_HEIGHT } from "@/constants/layout";
import { useQuickDateAvailability } from "@/hooks/useQuickDateAvailability";
import { useExperienceAddons, useExperiencePricingConfig, calculatePriceV2 } from "@/hooks/useExperience2Price";

interface StickyPriceBarProps {
  experienceId: string;
  currency: string;
  lang: 'en' | 'he' | 'fr';
  onViewDates: () => void;
  footerRef: React.RefObject<HTMLElement>;
  hyperguestPropertyId?: string | null;
  selectedExtrasTotal?: number;
  minParty?: number;
  minNights?: number;
}

const StickyPriceBar = ({
  experienceId,
  currency,
  lang,
  onViewDates,
  footerRef,
  hyperguestPropertyId,
  selectedExtrasTotal = 0,
  minParty = 2,
  minNights = 1,
}: StickyPriceBarProps) => {
  const [isHidden, setIsHidden] = useState(false);

  // Fetch real-time HyperGuest price (same as HeroBookingPreview2)
  const propId = hyperguestPropertyId ? parseInt(hyperguestPropertyId) : null;
  const { data: quickDates } = useQuickDateAvailability({
    propertyId: propId,
    nights: 1,
    adults: 2,
    currency,
    enabled: !!propId,
  });

  const { data: addons } = useExperienceAddons(experienceId);
  const { data: pricingConfig } = useExperiencePricingConfig(experienceId);

  const cheapestDate = useMemo(() => {
    if (!quickDates || quickDates.length === 0) return null;
    return quickDates.reduce((best, curr) => {
      if (curr.cheapestPrice == null) return best;
      if (!best || best.cheapestPrice == null || curr.cheapestPrice < best.cheapestPrice) return curr;
      return best;
    }, null as typeof quickDates[0] | null);
  }, [quickDates]);

  // Compute exact total with same engine as booking panel
  const displayPrice = useMemo(() => {
    const roomPrice = cheapestDate?.cheapestPrice ?? 0;
    const breakdown = calculatePriceV2(
      roomPrice,
      minParty,
      minNights,
      (addons ?? []) as any,
      pricingConfig ?? {
        commission_room_pct: 0,
        commission_addons_pct: 0,
        tax_pct: 0,
        promo_type: null,
        promo_value: null,
        promo_is_percentage: true,
      },
      currency
    );

    if (breakdown.finalTotal > 0) {
      return Math.round(breakdown.finalTotal + selectedExtrasTotal);
    }

    return selectedExtrasTotal > 0 ? Math.round(selectedExtrasTotal) : null;
  }, [cheapestDate, addons, pricingConfig, minParty, minNights, currency, selectedExtrasTotal]);

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
  const nightLabel = lang === 'he' ? 'ללילה' : lang === 'fr' ? '/ nuit' : '/ night';
  const ctaLabel = lang === 'he' ? 'לתאריכים' : lang === 'fr' ? 'Voir les dates' : 'VIEW DATES';

  return (
    <div
      className={cn(
        "md:hidden fixed left-0 right-0 z-40 bg-background border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-all duration-300",
        isHidden ? "translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
      )}
      style={{ bottom: `calc(${MOBILE_BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px))` }}
    >
      <div className="px-4">
        <div className="flex items-center justify-between py-3">
          <div>
            {displayPrice ? (
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-muted-foreground">
                  {lang === 'he' ? 'מ-' : 'From '}
                </span>
                <span className="text-base font-semibold text-foreground">
                  {symbol}{displayPrice}
                </span>
                <span className="text-xs text-muted-foreground">{nightLabel}</span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground italic">
                {lang === 'he' ? 'מחיר לפי בקשה' : 'Price on request'}
              </span>
            )}
          </div>

          <Button 
            onClick={onViewDates}
            className="px-5 h-10 rounded-full font-semibold text-xs tracking-wider uppercase bg-foreground text-background hover:bg-foreground/90"
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StickyPriceBar;
