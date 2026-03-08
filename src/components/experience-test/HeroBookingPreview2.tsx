import { useMemo } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useExperienceAddons, useExperiencePricingConfig, calculatePriceV2 } from "@/hooks/useExperience2Price";
import { useQuickDateAvailability } from "@/hooks/useQuickDateAvailability";
import { Loader2 } from "lucide-react";

interface HeroBookingPreview2Props {
  experienceId: string;
  currency: string;
  lang: 'en' | 'he' | 'fr';
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

  const propId = hyperguestPropertyId ? parseInt(hyperguestPropertyId) : null;
  const { data: quickDates, isLoading: isLoadingDates } = useQuickDateAvailability({
    propertyId: propId,
    nights: 1,
    adults: 2,
    currency,
    enabled: !!propId,
  });

  const cheapestDate = useMemo(() => {
    if (!quickDates || quickDates.length === 0) return null;
    return quickDates.reduce((best, curr) => {
      if (curr.cheapestPrice == null) return best;
      if (!best || best.cheapestPrice == null || curr.cheapestPrice < best.cheapestPrice) return curr;
      return best;
    }, null as typeof quickDates[0] | null);
  }, [quickDates]);

  // Calculate addon total with proper multipliers
  const addonTotal = useMemo(() => {
    if (!addons || addons.length === 0) return 0;
    const pricingAddons = addons.filter(
      (a) => (EXPERIENCE_PRICING_TYPES as string[]).includes(a.type) && a.is_active
    );
    return pricingAddons.reduce((sum, a) => {
      const v = Number(a.value) || 0;
      switch (a.type) {
        case 'per_person': return sum + v * minParty;
        case 'per_night': return sum + v * minNights;
        case 'per_person_per_night': return sum + v * minParty * minNights;
        default: return sum + v;
      }
    }, 0);
  }, [addons, minParty, minNights]);

  // Total price = room price + addon extras (or addon-only fallback)
  const displayPrice = useMemo(() => {
    const roomPrice = cheapestDate?.cheapestPrice;
    if (roomPrice != null && roomPrice > 0) {
      return roomPrice + addonTotal; // Room + addons = true total
    }
    return addonTotal > 0 ? addonTotal : null; // Fallback: addons only
  }, [cheapestDate, addonTotal]);

  const hasRealDate = !!cheapestDate;

  const getCurrencySymbol = (cur: string) => {
    if (cur === 'ILS') return '₪';
    if (cur === 'EUR') return '€';
    return '$';
  };

  const symbol = getCurrencySymbol(currency);
  const nightLabel = lang === "he" ? "ללילה" : "/ night";

  // If no hyperguest, show "Request this stay" panel instead
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
          {/* Left: Price info */}
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-muted-foreground">
                {lang === "he" ? "מ-" : "From "}
              </span>
              <span className="text-lg font-semibold text-foreground">
                {symbol}{Math.round(displayPrice)}
              </span>
              <span className="text-sm text-muted-foreground">{nightLabel}</span>
            </div>
            {hasRealDate && (
              <p className="text-xs text-muted-foreground">
                {format(cheapestDate.checkin, "dd MMM")} · 1 {lang === "he" ? "לילה" : "night"}
              </p>
            )}
          </div>

          {/* Right: CTA Button */}
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
