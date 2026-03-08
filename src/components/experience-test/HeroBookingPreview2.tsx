import { useMemo } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  useExperienceAddons,
  useExperiencePricingConfig,
  calculatePriceV2,
} from "@/hooks/useExperience2Price";
import { useQuickDateAvailability } from "@/hooks/useQuickDateAvailability";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Loader2 } from "lucide-react";

interface HeroBookingPreview2Props {
  experienceId: string;
  currency: string;
  lang: "en" | "he" | "fr";
  onViewDates: () => void;
  hyperguestPropertyId?: string | null;
  minParty?: number;
  minNights?: number;
}

const HeroBookingPreview2 = ({
  experienceId,
  currency,
  lang,
  onViewDates,
  hyperguestPropertyId,
  minParty = 2,
  minNights = 1,
}: HeroBookingPreview2Props) => {
  const { data: addons } = useExperienceAddons(experienceId);
  const { data: pricingConfig } = useExperiencePricingConfig(experienceId);
  const { symbol, convert } = useCurrency();

  const propId = hyperguestPropertyId ? parseInt(hyperguestPropertyId) : null;

  // Always fetch in ILS so room price + addons are in the same currency
  const { data: quickDates, isLoading: isLoadingDates } = useQuickDateAvailability({
    propertyId: propId,
    nights: 1,
    adults: 2,
    currency: "ILS",
    enabled: !!propId,
  });

  const cheapestDate = useMemo(() => {
    if (!quickDates || quickDates.length === 0) return null;
    return quickDates.reduce((best, curr) => {
      if (curr.cheapestPrice == null) return best;
      if (!best || best.cheapestPrice == null || curr.cheapestPrice < best.cheapestPrice) return curr;
      return best;
    }, null as (typeof quickDates)[0] | null);
  }, [quickDates]);

  // Calculate total in ILS, then convert
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

    return breakdown.finalTotal > 0 ? Math.round(convert(breakdown.finalTotal)) : null;
  }, [cheapestDate, addons, pricingConfig, minParty, minNights, convert]);

  const nightLabel = lang === "he" ? "ללילה" : "/ night";

  if (!propId) {
    return (
      <div className="hidden md:block">
        <div className="bg-muted/30 rounded-xl p-5 space-y-3">
          <Button
            onClick={onViewDates}
            className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium uppercase tracking-wide"
          >
            {lang === "he" ? "בקשו שהייה זו" : "Request this stay"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            {lang === "he" ? "נאשר זמינות תוך 24 שעות" : "We'll confirm availability within 24h"}
          </p>
        </div>
      </div>
    );
  }

  if (!displayPrice || displayPrice <= 0) {
    if (isLoadingDates) {
      return (
        <div className="hidden md:block">
          <div className="bg-muted/30 rounded-xl p-3 lg:p-4">
            <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {lang === "he" ? "בודק מחירים..." : "Checking prices..."}
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="hidden md:block">
      <div className="bg-muted/30 rounded-xl p-3 lg:p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-muted-foreground">{lang === "he" ? "מ-" : "From "}</span>
              <span className="text-lg font-semibold text-foreground">{symbol}{displayPrice}</span>
              <span className="text-sm text-muted-foreground">{nightLabel}</span>
            </div>
            {cheapestDate && (
              <p className="text-xs text-muted-foreground">
                {format(cheapestDate.checkin, "dd MMM")} · 1 {lang === "he" ? "לילה" : "night"}
              </p>
            )}
          </div>

          <Button
            onClick={onViewDates}
            className="px-4 text-sm uppercase tracking-wide bg-foreground text-background hover:bg-foreground/90"
          >
            {lang === "he" ? "לתאריכים" : "View dates"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroBookingPreview2;
