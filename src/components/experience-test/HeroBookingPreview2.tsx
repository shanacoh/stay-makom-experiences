import { useMemo } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { DualPrice } from "@/components/ui/DualPrice";
import { useExperienceAddons } from "@/hooks/useExperience2Price";
import { useQuickDateAvailability } from "@/hooks/useQuickDateAvailability";
import { EXPERIENCE_PRICING_TYPES } from "@/types/experience2_addons";
import { Loader2 } from "lucide-react";

interface HeroBookingPreview2Props {
  experienceId: string;
  currency: string;
  lang: 'en' | 'he' | 'fr';
  onViewDates: () => void;
  hyperguestPropertyId?: string | null;
  basePrice?: number | null;
}

const HeroBookingPreview2 = ({
  experienceId,
  currency,
  lang,
  onViewDates,
  hyperguestPropertyId,
  basePrice,
}: HeroBookingPreview2Props) => {
  const { data: addons } = useExperienceAddons(experienceId);

  // Fetch real 1-night availability to show actual cheapest price + date
  const propId = hyperguestPropertyId ? parseInt(hyperguestPropertyId) : null;
  const { data: quickDates, isLoading: isLoadingDates } = useQuickDateAvailability({
    propertyId: propId,
    nights: 1,
    adults: 2,
    currency,
    enabled: !!propId,
  });

  // Find cheapest real date
  const cheapestDate = useMemo(() => {
    if (!quickDates || quickDates.length === 0) return null;
    return quickDates.reduce((best, curr) => {
      if (curr.cheapestPrice == null) return best;
      if (!best || best.cheapestPrice == null || curr.cheapestPrice < best.cheapestPrice) return curr;
      return best;
    }, null as typeof quickDates[0] | null);
  }, [quickDates]);

  // Fallback to addons-based price if no real data
  const fallbackPrice = useMemo(() => {
    if (!addons || addons.length === 0) return null;
    const pricingAddons = addons.filter(
      (a) => (EXPERIENCE_PRICING_TYPES as string[]).includes(a.type) && a.is_active
    );
    if (pricingAddons.length === 0) return null;
    const total = pricingAddons.reduce((sum, a) => sum + a.value, 0);
    return total > 0 ? total : null;
  }, [addons]);

  const priceType = useMemo(() => {
    if (!addons) return "per_person";
    const pricingAddons = addons.filter(
      (a) => (EXPERIENCE_PRICING_TYPES as string[]).includes(a.type) && a.is_active
    );
    if (pricingAddons.length === 1) return pricingAddons[0].type;
    return "per_person";
  }, [addons]);

  // Use real price if available, then addons fallback, then base_price fallback
  const displayPrice = cheapestDate?.cheapestPrice ?? fallbackPrice ?? (basePrice && basePrice > 0 ? basePrice : null);
  const displayCurrency = cheapestDate?.currency ?? currency;
  const hasRealDate = !!cheapestDate;

  if (!displayPrice || displayPrice <= 0) {
    if (isLoadingDates && propId) {
      return (
        <div className="hidden md:block">
          <div className="bg-muted/30 rounded-xl p-3 lg:p-4">
            <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {lang === "he" ? "בודק מחירים..." : lang === "fr" ? "Vérification des prix..." : "Checking prices..."}
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  const priceLabel =
    priceType === "per_person" || priceType === "per_person_per_night"
      ? lang === "he" ? "לאדם" : lang === "fr" ? "par voyageur" : "per person"
      : priceType === "per_night"
        ? lang === "he" ? "ללילה" : lang === "fr" ? "par nuit" : "per night"
        : lang === "he" ? "להזמנה" : lang === "fr" ? "par réservation" : "per booking";

  return (
    <div className="hidden md:block">
      <div className="bg-muted/30 rounded-xl p-3 lg:p-4">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Price info */}
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-foreground">
                {lang === "he" ? "מ-" : lang === "fr" ? "À partir de " : "From "}
              </span>
              <DualPrice
                amount={displayPrice}
                currency={displayCurrency}
                inline
                className="text-base lg:text-lg font-semibold underline"
              />
            </div>
            {hasRealDate ? (
              <p className="text-xs text-muted-foreground">
                {format(cheapestDate.checkin, "dd MMM")} · 1 {lang === "he" ? "לילה" : lang === "fr" ? "nuit" : "night"}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">{priceLabel}</p>
            )}
          </div>

          {/* Right: CTA Button */}
          <Button
            onClick={onViewDates}
            variant="cta"
            className="px-4 text-sm uppercase tracking-wide"
          >
            {lang === "he" ? "לתאריכים" : lang === "fr" ? "Voir les dates" : "View dates"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroBookingPreview2;
