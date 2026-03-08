/**
 * Wrapper around ExperienceCard that fetches real-time HyperGuest room price
 * and displays the TRUE total (room + addons) as "Starting from".
 */
import { useMemo } from "react";
import ExperienceCard from "@/components/ExperienceCard";
import { useQuickDateAvailability } from "@/hooks/useQuickDateAvailability";
import { EXPERIENCE_PRICING_TYPES } from "@/types/experience2_addons";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Experience2CardWithPriceProps {
  experience: any;
  primaryHotel: any;
  hyperguestPropertyId?: string | null;
  addons?: Array<{ type: string; value: number; is_active: boolean }>;
  linkPrefix?: string;
  linkSuffix?: string;
}

export default function Experience2CardWithPrice({
  experience,
  primaryHotel,
  hyperguestPropertyId,
  addons,
  linkPrefix = "/experience",
  linkSuffix,
}: Experience2CardWithPriceProps) {
  const propId = hyperguestPropertyId ? parseInt(hyperguestPropertyId) : null;

  // Fetch cheapest room price from HyperGuest (1 night, 2 adults, USD)
  const { data: quickDates } = useQuickDateAvailability({
    propertyId: propId,
    nights: 1,
    adults: 2,
    currency: "USD",
    enabled: !!propId,
  });

  const cheapestRoomPrice = useMemo(() => {
    if (!quickDates || quickDates.length === 0) return null;
    const best = quickDates.reduce((prev, curr) => {
      if (curr.cheapestPrice == null) return prev;
      if (!prev || prev.cheapestPrice == null || curr.cheapestPrice < prev.cheapestPrice) return curr;
      return prev;
    }, null as (typeof quickDates)[0] | null);
    return best?.cheapestPrice ?? null;
  }, [quickDates]);

  // Calculate addon total (experience pricing extras)
  const addonTotal = useMemo(() => {
    if (!addons || addons.length === 0) return 0;
    const minGuests = experience.min_party || 2;
    const minNights = experience.min_nights || 1;
    return addons
      .filter((a) => a.is_active && (EXPERIENCE_PRICING_TYPES as string[]).includes(a.type))
      .reduce((sum, a) => {
        const v = Number(a.value) || 0;
        switch (a.type) {
          case "per_person": return sum + v * minGuests;
          case "per_night": return sum + v * minNights;
          case "per_person_per_night": return sum + v * minGuests * minNights;
          default: return sum + v;
        }
      }, 0);
  }, [addons, experience.min_party, experience.min_nights]);

  // Total = room + addons (same logic as detail page)
  const totalPrice = useMemo(() => {
    if (cheapestRoomPrice != null && cheapestRoomPrice > 0) {
      return Math.round(cheapestRoomPrice + addonTotal);
    }
    // Fallback to addons only if no room data yet
    if (addonTotal > 0) return Math.round(addonTotal);
    return experience.base_price || 0;
  }, [cheapestRoomPrice, addonTotal, experience.base_price]);

  const cardExperience = {
    ...experience,
    hotels: primaryHotel || null,
    experience_highlight_tags: experience.experience2_highlight_tags || [],
    base_price: totalPrice,
  };

  return (
    <ExperienceCard
      experience={cardExperience}
      linkPrefix={linkPrefix}
      linkSuffix={linkSuffix}
    />
  );
}
