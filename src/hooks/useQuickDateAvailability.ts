/**
 * Hook to find the next 3 available dates from HyperGuest for a given nights count.
 * Searches the next 10 upcoming check-in dates in parallel, returns up to 3 with rooms.
 */

import { useQuery } from '@tanstack/react-query';
import { addDays, format } from 'date-fns';
import { searchHotelsRaw, formatGuests } from '@/services/hyperguest';

interface AvailableDate {
  id: string;
  checkin: Date;
  checkout: Date;
  nights: number;
  /** Cheapest sell price found across all rooms/rate plans */
  cheapestPrice: number | null;
  currency: string;
}

interface UseQuickDateAvailabilityOptions {
  propertyId: number | null;
  nights: number;
  adults: number;
  currency?: string;
  enabled?: boolean;
}

async function scanAvailability(
  propertyId: number,
  nights: number,
  adults: number,
  currency: string,
): Promise<AvailableDate[]> {
  const today = new Date();
  // Lead time: start 3 days from now (hotels often need lead time)
  const startOffset = 3;
  const datesToScan = 20; // scan 20 dates to find at least 5 available
  const maxResults = 5;

  const guests = formatGuests([{ adults, children: [] }]);

  // Build all search promises in parallel
  const promises = Array.from({ length: datesToScan }, (_, i) => {
    const checkin = addDays(today, startOffset + i);
    const checkInStr = format(checkin, 'yyyy-MM-dd');

    return searchHotelsRaw({
      checkIn: checkInStr,
      nights,
      guests,
      hotelIds: [propertyId],
      customerNationality: 'IL',
      currency,
    })
      .then((res) => {
        const property = res?.results?.[0];
        const rooms = property?.rooms || [];
        if (rooms.length === 0) return null;

        // Find cheapest sell price
        let cheapest: number | null = null;
        let cur = currency;
        for (const room of rooms) {
          for (const rp of room.ratePlans || []) {
            const sellPrice =
              rp.payment?.chargeAmount?.price ??
              rp.prices?.sell?.price ??
              null;
            const sellCur =
              rp.payment?.chargeAmount?.currency ??
              rp.prices?.sell?.currency ??
              currency;
            if (sellPrice != null && (cheapest === null || sellPrice < cheapest)) {
              cheapest = sellPrice;
              cur = sellCur;
            }
          }
        }

        const checkout = addDays(checkin, nights);
        return {
          id: `avail-${nights}-${checkInStr}`,
          checkin,
          checkout,
          nights,
          cheapestPrice: cheapest,
          currency: cur,
        } satisfies AvailableDate;
      })
      .catch(() => null); // If one date fails, skip it
  });

  const results = await Promise.all(promises);

  // Filter nulls (unavailable), keep order (chronological), take first 3
  return results.filter((r): r is AvailableDate => r !== null).slice(0, maxResults);
}

export function useQuickDateAvailability({
  propertyId,
  nights,
  adults,
  currency = 'ILS',
  enabled = true,
}: UseQuickDateAvailabilityOptions) {
  return useQuery({
    queryKey: ['quick-date-availability', propertyId, nights, adults, currency],
    queryFn: () => scanAvailability(propertyId!, nights, adults, currency),
    enabled: enabled && !!propertyId && nights > 0,
    staleTime: 1000 * 60 * 5, // 5 min cache
    retry: 1,
  });
}
