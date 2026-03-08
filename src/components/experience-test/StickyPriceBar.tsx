import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MOBILE_BOTTOM_NAV_HEIGHT } from "@/constants/layout";
import { useQuickDateAvailability } from "@/hooks/useQuickDateAvailability";
import { useExperienceAddons, useExperiencePricingConfig, calculatePriceV2 } from "@/hooks/useExperience2Price";
import { useCurrency } from "@/contexts/CurrencyContext";

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
  const { displayCurrency, symbol, altSymbol, setDisplayCurrency, convert } = useCurrency();

  const propId = hyperguestPropertyId ? parseInt(hyperguestPropertyId) : null;

  // Always fetch in ILS to match addon currency
  const { data: quickDates } = useQuickDateAvailability({
    propertyId: propId,
    nights: 1,
    adults: 2,
    currency: "ILS",
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

  // Calculate in ILS, then convert
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
      "ILS"
    );

    const ilsTotal = breakdown.finalTotal + selectedExtrasTotal;
    if (ilsTotal > 0) {
      return Math.round(convert(ilsTotal));
    }
    return null;
  }, [cheapestDate, addons, pricingConfig, minParty, minNights, selectedExtrasTotal, convert]);

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

  const nightLabel = lang === 'he' ? 'ללילה' : lang === 'fr' ? '/ nuit' : '/ night';
  const ctaLabel = lang === 'he' ? 'לתאריכים' : lang === 'fr' ? 'Voir les dates' : 'VIEW DATES';

  const handleInlineToggle = () => {
    setDisplayCurrency(displayCurrency === "ILS" ? "USD" : "ILS");
  };

  const isShowingUSD = displayCurrency === "USD";

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
              <>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-muted-foreground">
                    {lang === 'he' ? 'מ-' : 'From '}
                  </span>
                  <span className="text-base font-semibold text-foreground">
                    {symbol}{displayPrice}
                  </span>
                  <span className="text-xs text-muted-foreground">{nightLabel}</span>
                  <button
                    onClick={handleInlineToggle}
                    className="text-[10px] leading-none transition-colors"
                    style={{ color: '#9e9e9e' }}
                  >
                    · {lang === 'he' ? `ראה ב${altSymbol}` : `see in ${altSymbol}`}
                  </button>
                </div>
                {isShowingUSD && (
                  <p className="text-[10px] leading-tight mt-0.5" style={{ color: '#9e9e9e' }}>
                    {lang === 'he' ? 'החיוב בשקלים' : 'Charged in NIS'}
                  </p>
                )}
              </>
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
