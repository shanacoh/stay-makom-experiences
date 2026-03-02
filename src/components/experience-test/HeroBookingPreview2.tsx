import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DualPrice } from "@/components/ui/DualPrice";
import { useExperienceAddons } from "@/hooks/useExperience2Price";
import { EXPERIENCE_PRICING_TYPES } from "@/types/experience2_addons";

interface HeroBookingPreview2Props {
  experienceId: string;
  currency: string;
  lang: 'en' | 'he' | 'fr';
  onViewDates: () => void;
}

const HeroBookingPreview2 = ({
  experienceId,
  currency,
  lang,
  onViewDates,
}: HeroBookingPreview2Props) => {
  const { data: addons } = useExperienceAddons(experienceId);

  const startingPrice = useMemo(() => {
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

  if (!startingPrice || startingPrice <= 0) return null;

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
                amount={startingPrice}
                currency={currency}
                inline
                className="text-base lg:text-lg font-semibold underline"
              />
            </div>
            <p className="text-xs text-muted-foreground">{priceLabel}</p>
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
