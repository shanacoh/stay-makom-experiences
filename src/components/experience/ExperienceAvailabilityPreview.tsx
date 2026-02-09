/**
 * Admin : Aperçu prix / disponibilités pour une expérience
 * Mini calendrier + bouton "Vérifier prix" → recherche chambres HyperGuest
 * Affiche les chambres et le détail prix (HyperGuest + add-ons) comme le verra l'utilisateur.
 *
 * À intégrer dans UnifiedExperience2Form (section "Aperçu prix / disponibilités").
 * Réutilise : useHyperGuestAvailability, RoomOptionsV2, PriceBreakdownV2, useExperience2Price.
 */

import { useState, useMemo, useEffect } from "react";
import { Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DateRangePicker from "./DateRangePicker";
import { RoomOptionsV2 } from "./RoomOptionsV2";
import { PriceBreakdownV2 } from "./PriceBreakdownV2";
import { useHyperGuestAvailability } from "@/hooks/useHyperGuestAvailability";
import { useExperience2Price } from "@/hooks/useExperience2Price";
import { formatGuests, calculateNights } from "@/services/hyperguest";

export interface ExperienceAvailabilityPreviewProps {
  /** ID propriété HyperGuest de l'hôtel sélectionné (obligatoire pour la recherche) */
  hyperguestPropertyId: string | null;
  /** Nom de l'hôtel (affichage) */
  hotelName?: string;
  /** ID expérience pour appliquer les add-ons (optionnel : si null, seul le prix HyperGuest est affiché) */
  experienceId: string | null;
  currency?: string;
  lang?: "en" | "he" | "fr";
}

/** Normalise la réponse API pour RoomOptionsV2 (results[0].rooms ou .rooms) */
function toSearchResult(data: unknown): { results?: { rooms: unknown[] }[]; rooms?: unknown[] } | null {
  if (data == null) return null;
  const d = data as Record<string, unknown>;
  if (Array.isArray(d.results) && d.results.length > 0) {
    const first = d.results[0] as Record<string, unknown>;
    return { results: [{ rooms: Array.isArray(first.rooms) ? first.rooms : [] }] };
  }
  if (Array.isArray(d.rooms)) return { rooms: d.rooms };
  return null;
}

export function ExperienceAvailabilityPreview({
  hyperguestPropertyId,
  hotelName,
  experienceId,
  currency = "ILS",
  lang = "en",
}: ExperienceAvailabilityPreviewProps) {
  const t = {
    en: {
      title: "Price / availability preview",
      subtitle: "Check what guests will see for a sample stay",
      selectDates: "Select dates",
      checkPrice: "Check price",
      noHotel: "Select a hotel with HyperGuest to preview prices.",
      noDates: 'Select check-in and check-out, then click "Check price".',
      maxNights: "Max 30 nights for HyperGuest search; this range was capped.",
      adults: "Adults",
    },
    he: {
      title: "תצוגת מחיר / זמינות",
      subtitle: "בדוק מה יראו האורחים לדוגמה",
      selectDates: "בחר תאריכים",
      checkPrice: "בדוק מחיר",
      noHotel: "בחר מלון עם HyperGuest לתצוגת מחירים.",
      noDates: 'בחר תאריכי כניסה ויציאה ולחץ "בדוק מחיר".',
      maxNights: "מקסימום 30 לילות לחיפוש HyperGuest; הטווח הוגבל.",
      adults: "מבוגרים",
    },
    fr: {
      title: "Aperçu prix / disponibilités",
      subtitle: "Vérifiez ce que verront les voyageurs pour un séjour exemple",
      selectDates: "Sélectionnez les dates",
      checkPrice: "Vérifier le prix",
      noHotel: "Sélectionnez un hôtel avec HyperGuest pour prévisualiser les prix.",
      noDates: 'Sélectionnez arrivée et départ, puis cliquez sur "Vérifier le prix".',
      maxNights: "Maximum 30 nuits pour la recherche HyperGuest ; la plage a été plafonnée.",
      adults: "Adultes",
    },
  }[lang];

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [adults] = useState(2);
  /** Params envoyés à l'API uniquement après clic sur "Vérifier prix" */
  const [submittedRange, setSubmittedRange] = useState<{ from: Date; to: Date } | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedRatePlanId, setSelectedRatePlanId] = useState<number | null>(null);

  /** HyperGuest Search API : nombre de nuits limité à 30 (SN.400) */
  const MAX_NIGHTS = 30;

  const searchParams = useMemo(() => {
    if (!submittedRange?.from || !submittedRange?.to || !hyperguestPropertyId) return null;
    const checkIn = submittedRange.from.toISOString().split("T")[0];
    const checkOut = submittedRange.to.toISOString().split("T")[0];
    const rawNights = calculateNights(checkIn, checkOut);
    if (rawNights < 1) return null;
    const nights = Math.min(rawNights, MAX_NIGHTS);
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
  } = useHyperGuestAvailability(hyperguestPropertyId ? parseInt(hyperguestPropertyId, 10) : null, searchParams);

  const searchResult = useMemo(() => toSearchResult(rawResult), [rawResult]);
  const nights = searchParams?.nights ?? 0;

  /** Pour afficher un message si la plage sélectionnée dépassait 30 nuits */
  const exceededMaxNights =
    submittedRange?.from &&
    submittedRange?.to &&
    calculateNights(submittedRange.from.toISOString().split("T")[0], submittedRange.to.toISOString().split("T")[0]) >
      MAX_NIGHTS;

  /** Récupère le rate plan sélectionné pour le calcul du prix */
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
    const room = rooms.find((r: unknown) => (r as { roomId?: number }).roomId === selectedRoomId) as
      | { ratePlans?: { ratePlanId: number; prices?: unknown }[] }
      | undefined;
    const plan = room?.ratePlans?.find((rp) => rp.ratePlanId === selectedRatePlanId);
    return plan ?? null;
  }, [rawResult, selectedRoomId, selectedRatePlanId]);

  const ratePlanPrices = selectedRatePlan?.prices ?? null;
  const priceBreakdown = useExperience2Price(
    experienceId,
    null,
    currency,
    nights,
    ratePlanPrices as Parameters<typeof useExperience2Price>[4],
  );

  const roomsList = searchResult?.results?.[0]?.rooms ?? searchResult?.rooms ?? [];

  /** Sélection auto de la première chambre quand les résultats arrivent */
  useEffect(() => {
    if (!searchResult || selectedRoomId !== null) return;
    if (roomsList.length === 0) return;
    const first = roomsList[0] as { roomId: number; ratePlans?: { ratePlanId: number }[] };
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

  const canCheckPrice = !!hyperguestPropertyId && !!dateRange.from && !!dateRange.to && dateRange.from < dateRange.to;

  if (!hyperguestPropertyId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
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
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {t.title}
        </CardTitle>
        {hotelName && <p className="text-sm text-muted-foreground">{hotelName}</p>}
        <p className="text-xs text-muted-foreground">{t.subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">{t.selectDates}</p>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="default"
              onClick={handleCheckPrice}
              disabled={!canCheckPrice || isLoadingAvailability}
            >
              <Search className="h-4 w-4 mr-2" />
              {t.checkPrice}
            </Button>
            {!submittedRange && dateRange.from && dateRange.to && (
              <span className="text-xs text-muted-foreground">{t.noDates}</span>
            )}
          </div>
        </div>

        {!submittedRange && <p className="text-sm text-muted-foreground italic">{t.noDates}</p>}

        {exceededMaxNights && (
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
            <AlertDescription>{t.maxNights}</AlertDescription>
          </Alert>
        )}

        {searchParams && (
          <>
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

            {searchParams && (
              <PriceBreakdownV2 breakdown={priceBreakdown} isLoading={isLoadingAvailability} lang={lang} />
            )}

            {availabilityError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {lang === "fr"
                    ? "Erreur lors de la récupération des disponibilités."
                    : lang === "he"
                      ? "שגיאה בטעינת הזמינות."
                      : "Error loading availability."}
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
