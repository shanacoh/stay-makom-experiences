/**
 * Admin: Price / availability preview for an experience.
 * Mini calendar + "Check price" button → HyperGuest room search.
 * Shows rooms and price breakdown (HyperGuest + add-ons) as the guest will see it.
 *
 * Integrated into UnifiedExperience2Form (section after Pricing).
 * Reuses: useHyperGuestAvailability, RoomOptionsV2, PriceBreakdownV2, useExperience2Price.
 */

import { useState, useMemo, useEffect } from "react";
import { Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DateRangePicker from "@/components/experience/DateRangePicker";
import { RoomOptionsV2 } from "@/components/experience/RoomOptionsV2";
import { PriceBreakdownV2 } from "@/components/experience/PriceBreakdownV2";
import { useHyperGuestAvailability } from "@/hooks/useHyperGuestAvailability";
import { useExperience2Price } from "@/hooks/useExperience2Price";
import type { RatePlanPrices } from "@/hooks/useExperience2Price";
import { formatGuests, calculateNights } from "@/services/hyperguest";

export interface ExperienceAvailabilityPreviewProps {
  /** HyperGuest property ID of the selected hotel (required for search) */
  hyperguestPropertyId: string | null;
  /** Hotel name (display only) */
  hotelName?: string;
  /** Experience ID to apply add-ons (optional: if null, only HyperGuest price is shown) */
  experienceId: string | null;
  currency?: string;
  lang?: "en" | "he" | "fr";
}

/** Normalise API response for RoomOptionsV2 (results[0].rooms or .rooms) */
function toSearchResult(
  data: unknown
): { results?: { rooms: unknown[] }[]; rooms?: unknown[] } | null {
  if (data == null) return null;
  const d = data as Record<string, unknown>;
  if (Array.isArray(d.results) && d.results.length > 0) {
    const first = d.results[0] as Record<string, unknown>;
    return {
      results: [{ rooms: Array.isArray(first.rooms) ? first.rooms : [] }],
    };
  }
  if (Array.isArray(d.rooms)) return { rooms: d.rooms };
  return null;
}

const translations = {
  en: {
    title: "Price / availability preview",
    subtitle: "Check what guests will see for a sample stay",
    selectDates: "Select dates",
    checkPrice: "Check price",
    noHotel: "Select a hotel with HyperGuest to preview prices.",
    noDates: 'Select check-in and check-out, then click "Check price".',
    adults: "Adults",
    errorMsg: "Error loading availability.",
  },
  he: {
    title: "תצוגת מחיר / זמינות",
    subtitle: "בדוק מה יראו האורחים לדוגמה",
    selectDates: "בחר תאריכים",
    checkPrice: "בדוק מחיר",
    noHotel: "בחר מלון עם HyperGuest לתצוגת מחירים.",
    noDates: 'בחר תאריכי כניסה ויציאה ולחץ "בדוק מחיר".',
    adults: "מבוגרים",
    errorMsg: "שגיאה בטעינת הזמינות.",
  },
  fr: {
    title: "Aperçu prix / disponibilités",
    subtitle: "Vérifiez ce que verront les voyageurs pour un séjour exemple",
    selectDates: "Sélectionnez les dates",
    checkPrice: "Vérifier le prix",
    noHotel:
      "Sélectionnez un hôtel avec HyperGuest pour prévisualiser les prix.",
    noDates:
      'Sélectionnez arrivée et départ, puis cliquez sur "Vérifier le prix".',
    adults: "Adultes",
    errorMsg: "Erreur lors de la récupération des disponibilités.",
  },
};

export function ExperienceAvailabilityPreview({
  hyperguestPropertyId,
  hotelName,
  experienceId,
  currency = "ILS",
  lang = "en",
}: ExperienceAvailabilityPreviewProps) {
  const t = translations[lang];

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [adults] = useState(2);
  /** Params sent to API only after "Check price" click */
  const [submittedRange, setSubmittedRange] = useState<{
    from: Date;
    to: Date;
  } | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedRatePlanId, setSelectedRatePlanId] = useState<number | null>(
    null
  );

  const searchParams = useMemo(() => {
    if (!submittedRange?.from || !submittedRange?.to || !hyperguestPropertyId)
      return null;
    const checkIn = submittedRange.from.toISOString().split("T")[0];
    const checkOut = submittedRange.to.toISOString().split("T")[0];
    const nights = calculateNights(checkIn, checkOut);
    if (nights < 1) return null;
    return {
      checkIn,
      nights,
      guests: formatGuests([{ adults, children: [] }]),
      hotelIds: [parseInt(hyperguestPropertyId, 10)],
      customerNationality: "IL",
      currency,
    };
  }, [submittedRange, hyperguestPropertyId, adults, currency]);

  const {
    data: rawResult,
    isLoading: isLoadingAvailability,
    error: availabilityError,
  } = useHyperGuestAvailability(
    hyperguestPropertyId ? parseInt(hyperguestPropertyId, 10) : null,
    searchParams
  );

  const searchResult = useMemo(() => toSearchResult(rawResult), [rawResult]);
  const nights = searchParams?.nights ?? 0;

  /** Get the selected rate plan for price calculation */
  const selectedRatePlan = useMemo(() => {
    if (!rawResult || !selectedRoomId || !selectedRatePlanId) return null;
    const d = rawResult as Record<string, unknown>;
    let rooms: unknown[] = [];
    if (Array.isArray(d.results) && d.results.length > 0) {
      const first = d.results[0] as Record<string, unknown>;
      rooms = Array.isArray(first.rooms) ? first.rooms : [];
    } else if (Array.isArray(d.rooms)) {
      rooms = d.rooms;
    }
    const room = rooms.find(
      (r: unknown) => (r as { roomId?: number }).roomId === selectedRoomId
    ) as
      | {
          ratePlans?: {
            ratePlanId: number;
            prices?: unknown;
          }[];
        }
      | undefined;
    const plan = room?.ratePlans?.find(
      (rp) => rp.ratePlanId === selectedRatePlanId
    );
    return plan ?? null;
  }, [rawResult, selectedRoomId, selectedRatePlanId]);

  const ratePlanPrices = (selectedRatePlan?.prices ?? null) as RatePlanPrices | null;
  const priceBreakdown = useExperience2Price(
    experienceId,
    null,
    currency,
    nights,
    ratePlanPrices
  );

  const roomsList =
    searchResult?.results?.[0]?.rooms ?? searchResult?.rooms ?? [];

  /** Auto-select the first room when results arrive */
  useEffect(() => {
    if (!searchResult || selectedRoomId !== null) return;
    if (roomsList.length === 0) return;
    const first = roomsList[0] as {
      roomId: number;
      ratePlans?: { ratePlanId: number }[];
    };
    if (first?.ratePlans?.length) {
      setSelectedRoomId(first.roomId);
      setSelectedRatePlanId(first.ratePlans[0].ratePlanId);
    }
  }, [searchResult, roomsList.length, selectedRoomId]);

  const handleCheckPrice = () => {
    if (dateRange.from && dateRange.to) {
      setSubmittedRange({ from: dateRange.from, to: dateRange.to });
      setSelectedRoomId(null);
      setSelectedRatePlanId(null);
    }
  };

  const canCheckPrice =
    !!hyperguestPropertyId &&
    !!dateRange.from &&
    !!dateRange.to &&
    dateRange.from < dateRange.to;

  // No HyperGuest property selected
  if (!hyperguestPropertyId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>{t.noHotel}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4" />
          {t.title}
        </CardTitle>
        {hotelName && (
          <p className="text-sm text-muted-foreground">{hotelName}</p>
        )}
        <p className="text-xs text-muted-foreground">{t.subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date picker + check button */}
        <div className="space-y-3">
          <p className="text-sm font-medium">{t.selectDates}</p>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={handleCheckPrice}
              disabled={!canCheckPrice || isLoadingAvailability}
              size="sm"
            >
              <Search className="h-4 w-4 mr-2" />
              {t.checkPrice}
            </Button>
            {!submittedRange && dateRange.from && dateRange.to && (
              <span className="text-xs text-muted-foreground">{t.noDates}</span>
            )}
          </div>
        </div>

        {/* Prompt before first search */}
        {!submittedRange && (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t.noDates}
          </p>
        )}

        {/* Results */}
        {searchParams && (
          <div className="space-y-6">
            <RoomOptionsV2
              searchResult={searchResult as any}
              isLoading={isLoadingAvailability}
              selectedRoomId={selectedRoomId}
              selectedRatePlanId={selectedRatePlanId}
              onSelect={(roomId, ratePlanId) => {
                setSelectedRoomId(roomId);
                setSelectedRatePlanId(ratePlanId);
              }}
              lang={lang}
            />

            <PriceBreakdownV2
              breakdown={priceBreakdown}
              isLoading={isLoadingAvailability}
              lang={lang}
            />

            {availabilityError && (
              <Alert variant="destructive">
                <AlertDescription>{t.errorMsg}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
