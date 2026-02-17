/**
 * BookingPanel V2 – Hybrid: predefined dates + free calendar
 * Fetches real-time prices/rooms from HyperGuest
 * Max 30 nights (API limit SN.400)
 * ✅ B1: Pre-book before booking + price change detection
 * ✅ V4: Property remarks display
 * ✅ V5: Optional hotel extras (Spice it up) affecting total price
 */

import { useState, useMemo, useEffect } from "react";
import { Users, AlertCircle, CalendarDays, Info, Sparkles, MessageSquare, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import DateRangePicker from "./DateRangePicker";
import { DualPrice } from "@/components/ui/DualPrice";
import { Textarea } from "@/components/ui/textarea";
import { RoomOptionsV2 } from "./RoomOptionsV2";
import { PriceBreakdownV2 } from "./PriceBreakdownV2";
import { useHyperGuestAvailability } from "@/hooks/useHyperGuestAvailability";
import { useQuickDateAvailability } from "@/hooks/useQuickDateAvailability";
import { useExperience2Price } from "@/hooks/useExperience2Price";
import { formatGuests, calculateNights, preBook } from "@/services/hyperguest";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DateOption {
  id: string;
  checkin: string;
  checkout: string;
  label: string | null;
  label_he: string | null;
  price_override: number | null;
  original_price: number | null;
  discount_percent: number | null;
  featured: boolean;
}

interface SelectedExtra {
  id: string;
  name: string;
  name_he: string | null;
  price: number;
  currency: string;
  pricing_type: string;
}

interface BookingPanel2Props {
  experienceId: string;
  hotelId: string;
  hyperguestPropertyId: string | null;
  currency?: string;
  minParty?: number;
  maxParty?: number;
  lang?: "en" | "he" | "fr";
  selectedExtras?: SelectedExtra[];
}

export function BookingPanel2({
  experienceId,
  hotelId,
  hyperguestPropertyId,
  currency = "ILS",
  minParty = 2,
  maxParty = 4,
  lang = "en",
  selectedExtras = [],
}: BookingPanel2Props) {
  const t = {
    en: {
      title: "Book this experience",
      dates: "Dates",
      guests: "Number of guests",
      book: "Book",
      selectDates: "Select dates",
      noHyperguest: "This experience is not available for online booking yet.",
      error: "Error loading availability. Please try again.",
      note: "Prices are calculated in real-time based on HyperGuest availability",
      suggestedDates: "Suggested dates",
      pickDates: "Choose your dates",
      orPickOwn: "Or choose your own dates",
      orSeeSuggested: "See suggested dates",
      verifying: "Verifying price...",
      importantNotices: "Important notices",
      priceChanged: "Price has changed",
    },
    he: {
      title: "הזמן חוויה זו",
      dates: "תאריכים",
      guests: "מספר אורחים",
      book: "הזמן",
      selectDates: "בחר תאריכים",
      noHyperguest: "חוויה זו אינה זמינה עדיין להזמנה מקוונת.",
      error: "שגיאה בטעינת הזמינות. אנא נסה שוב.",
      note: "המחירים מחושבים בזמן אמת על פי זמינות HyperGuest",
      suggestedDates: "תאריכים מוצעים",
      pickDates: "בחר תאריכים",
      orPickOwn: "או בחר תאריכים משלך",
      orSeeSuggested: "ראה תאריכים מוצעים",
      verifying: "בודק מחיר...",
      importantNotices: "הערות חשובות",
      priceChanged: "המחיר השתנה",
    },
    fr: {
      title: "Réserver cette expérience",
      dates: "Dates",
      guests: "Nombre de voyageurs",
      book: "Réserver",
      selectDates: "Sélectionnez des dates",
      noHyperguest: "Cette expérience n'est pas encore disponible pour la réservation en ligne.",
      error: "Erreur lors de la récupération des disponibilités. Veuillez réessayer.",
      note: "Les prix sont calculés en temps réel selon les disponibilités HyperGuest",
      suggestedDates: "Dates suggérées",
      pickDates: "Choisir vos dates",
      orPickOwn: "Ou choisissez vos propres dates",
      orSeeSuggested: "Voir les dates suggérées",
      verifying: "Vérification du prix...",
      importantNotices: "Remarques importantes",
      priceChanged: "Le prix a changé",
    },
  }[lang];

  // Fetch predefined date options
  const { data: dateOptions } = useQuery({
    queryKey: ["experience2-date-options-public", experienceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experience2_date_options" as any)
        .select("*")
        .eq("experience_id", experienceId)
        .eq("is_active", true)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as DateOption[];
    },
  });

  const hasPredefinedDates = (dateOptions ?? []).length > 0;

  type NightsTab = 1 | 2 | 3 | "pick";
  const [selectedTab, setSelectedTab] = useState<NightsTab>(1);
  const [selectedDateOptionId, setSelectedDateOptionId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [adults, setAdults] = useState(minParty);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedRatePlanId, setSelectedRatePlanId] = useState<number | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [specialRequests, setSpecialRequests] = useState("");

  // Fetch real availability for 1/2/3 nights tabs
  const propId = hyperguestPropertyId ? parseInt(hyperguestPropertyId) : null;
  const { data: quickDates, isLoading: isLoadingQuickDates } = useQuickDateAvailability({
    propertyId: propId,
    nights: typeof selectedTab === "number" ? selectedTab : 1,
    adults,
    currency,
    enabled: selectedTab !== "pick",
  });

  // When a quick date option is selected, set the dateRange
  useEffect(() => {
    if (selectedDateOptionId && selectedTab !== "pick" && quickDates) {
      const opt = quickDates.find((d) => d.id === selectedDateOptionId);
      if (opt) {
        setDateRange({ from: opt.checkin, to: opt.checkout });
      }
    }
  }, [selectedDateOptionId, quickDates, selectedTab]);

  // Reset selection when tab changes
  useEffect(() => {
    setSelectedDateOptionId(null);
    setDateRange({});
    setSelectedRoomId(null);
    setSelectedRatePlanId(null);
  }, [selectedTab]);

  const MAX_NIGHTS = 30;

  const searchParams = useMemo(() => {
    if (!dateRange.from || !dateRange.to || !hyperguestPropertyId) return null;
    const checkIn = dateRange.from.toISOString().split("T")[0];
    const rawNights = calculateNights(checkIn, dateRange.to.toISOString().split("T")[0]);
    const nights = Math.min(rawNights, MAX_NIGHTS);
    const guests = formatGuests([{ adults, children: [] }]);
    return { checkIn, nights, guests, hotelIds: [parseInt(hyperguestPropertyId)], customerNationality: "IL", currency };
  }, [dateRange, adults, hyperguestPropertyId, currency]);

  const {
    data: searchResult,
    isLoading: isLoadingAvailability,
    error: availabilityError,
  } = useHyperGuestAvailability(hyperguestPropertyId ? parseInt(hyperguestPropertyId) : null, searchParams);

  const selectedRatePlan = useMemo(() => {
    if (!searchResult || !selectedRoomId || !selectedRatePlanId) return null;
    let rooms: any[] = [];
    if (searchResult.results && searchResult.results.length > 0) {
      rooms = searchResult.results[0]?.rooms || [];
    } else if (searchResult.rooms) {
      rooms = searchResult.rooms;
    }
    const room = rooms.find((r: any) => r.roomId === selectedRoomId);
    return room?.ratePlans?.find((rp: any) => rp.ratePlanId === selectedRatePlanId) || null;
  }, [searchResult, selectedRoomId, selectedRatePlanId]);

  // ✅ V4 FIX: Extract property-level remarks from search result
  const propertyRemarks = useMemo(() => {
    if (!searchResult) return [];
    if (searchResult.results && searchResult.results.length > 0) {
      return searchResult.results[0]?.remarks || [];
    }
    if ((searchResult as any).remarks) {
      return (searchResult as any).remarks;
    }
    return [];
  }, [searchResult]);

  const nights = searchParams?.nights || 0;
  const ratePlanPrices = selectedRatePlan?.prices || null;
  const priceBreakdown = useExperience2Price(experienceId, null, currency, nights, adults, ratePlanPrices);

  useEffect(() => {
    if (searchResult && !selectedRoomId) {
      let rooms: any[] = [];
      if (searchResult.results && searchResult.results.length > 0) {
        rooms = searchResult.results[0]?.rooms || [];
      } else if (searchResult.rooms) {
        rooms = searchResult.rooms;
      }
      if (rooms.length > 0) {
        const firstRoom = rooms[0];
        if (firstRoom.ratePlans?.length > 0) {
          setSelectedRoomId(firstRoom.roomId);
          setSelectedRatePlanId(firstRoom.ratePlans[0].ratePlanId);
        }
      }
    }
  }, [searchResult, selectedRoomId]);

  useEffect(() => {
    setSelectedRoomId(null);
    setSelectedRatePlanId(null);
  }, [dateRange.from, dateRange.to]);

  // ✅ B1 FIX: Pre-book before booking to verify price
  const handleBook = async () => {
    if (!dateRange.from || !dateRange.to || !selectedRoomId || !selectedRatePlanId || !selectedRatePlan) return;

    setIsBooking(true);

    try {
      const checkIn = dateRange.from.toISOString().split("T")[0];
      const checkOut = dateRange.to.toISOString().split("T")[0];

      const preBookData = {
        search: {
          dates: { from: checkIn, to: checkOut },
          propertyId: parseInt(hyperguestPropertyId!),
          nationality: "IL",
          pax: [{ adults, children: [] as number[] }],
        },
        rooms: [{
          roomId: selectedRoomId,
          ratePlanId: selectedRatePlanId,
          expectedPrice: {
            amount: selectedRatePlan.payment?.chargeAmount?.price
                    ?? selectedRatePlan.prices?.sell?.price
                    ?? selectedRatePlan.prices?.sell?.amount
                    ?? 0,
            currency: selectedRatePlan.payment?.chargeAmount?.currency
                      ?? selectedRatePlan.prices?.sell?.currency
                      ?? "EUR",
          },
        }],
      };

      const preBookResult = await preBook(preBookData);

      // Detect price change
      const roomResult = preBookResult.rooms?.[0];
      if (roomResult?.priceChange) {
        const { fromAmount, toAmount } = roomResult.priceChange;
        const priceDiff = toAmount.amount - fromAmount.amount;
        const priceDiffPercent = Math.round((priceDiff / fromAmount.amount) * 100);

        toast.warning(
          `${t.priceChanged}: ${fromAmount.amount} ${fromAmount.currency} → ${toAmount.amount} ${toAmount.currency} (${priceDiff > 0 ? '+' : ''}${priceDiffPercent}%)`,
          { duration: 8000 }
        );

        setIsBooking(false);
        return;
      }

      // Price OK — booking flow to be completed
      toast.info("Pre-book validated! Full booking flow coming soon.");

    } catch (error) {
      console.error("Pre-book/Booking error:", error);
      toast.error(t.error);
    } finally {
      setIsBooking(false);
    }
  };

  // Calculate extras total based on pricing type
  const extrasTotal = useMemo(() => {
    return selectedExtras.reduce((sum, extra) => {
      let multiplier = 1;
      if (extra.pricing_type === "per_guest") multiplier = adults;
      if (extra.pricing_type === "per_night") multiplier = nights;
      return sum + extra.price * multiplier;
    }, 0);
  }, [selectedExtras, adults, nights]);

  const isReadyToBook = dateRange.from && dateRange.to && selectedRoomId && selectedRatePlanId && priceBreakdown;
  const displayTotal = (priceBreakdown?.finalTotal ?? 0) + extrasTotal;
  const totalIsNaN = Number.isNaN(displayTotal);

  if (!hyperguestPropertyId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t.noHyperguest}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Guests */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4" />
            {t.guests}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => setAdults(Math.max(minParty, adults - 1))} disabled={adults <= minParty}>-</Button>
            <span className="text-lg font-medium w-8 text-center">{adults}</span>
            <Button variant="outline" size="sm" onClick={() => setAdults(Math.min(maxParty, adults + 1))} disabled={adults >= maxParty}>+</Button>
          </div>
        </div>

        <Separator />

        {/* Date Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CalendarDays className="h-4 w-4" />
            {t.dates}
          </div>

          {/* Nights tabs: 1 night / 2 nights / 3 nights / Pick dates */}
          <div className="flex gap-1.5">
            {([1, 2, 3] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSelectedTab(n)}
                className={cn(
                  "flex-1 px-1 py-1.5 rounded-lg border-2 transition-all text-xs whitespace-nowrap",
                  "hover:border-primary/50",
                  selectedTab === n
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-border"
                )}
              >
                {n} {n === 1
                  ? (lang === "he" ? "לילה" : lang === "fr" ? "nuit" : "night")
                  : (lang === "he" ? "לילות" : lang === "fr" ? "nuits" : "nights")
                }
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelectedTab("pick")}
              className={cn(
                "flex-1 px-1 py-1.5 rounded-lg border-2 transition-all text-xs whitespace-nowrap",
                "hover:border-primary/50",
                selectedTab === "pick"
                  ? "border-primary bg-primary/5 font-medium"
                  : "border-border"
              )}
            >
              {lang === "he" ? "בחר תאריכים" : lang === "fr" ? "Choisir" : "Pick dates"}
            </button>
          </div>

          {/* Quick date options for 1/2/3 nights — real HyperGuest availability */}
          {selectedTab !== "pick" && (
            <>
              {isLoadingQuickDates && (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {lang === "he" ? "בודק זמינות..." : lang === "fr" ? "Vérification des disponibilités..." : "Checking availability..."}
                </div>
              )}
              {!isLoadingQuickDates && quickDates && quickDates.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  {lang === "he" ? "אין תאריכים זמינים כרגע" : lang === "fr" ? "Aucune date disponible pour le moment" : "No available dates at the moment"}
                </p>
              )}
              {!isLoadingQuickDates && quickDates && quickDates.length > 0 && (
                <RadioGroup
                  value={selectedDateOptionId ?? ""}
                  onValueChange={(val) => setSelectedDateOptionId(val)}
                  className="space-y-1.5"
                >
                  {quickDates.map((opt) => (
                    <label
                      key={opt.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedDateOptionId === opt.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value={opt.id} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {format(opt.checkin, "EEE dd MMM")} → {format(opt.checkout, "EEE dd MMM")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {opt.nights} {opt.nights === 1
                            ? (lang === "he" ? "לילה" : lang === "fr" ? "nuit" : "night")
                            : (lang === "he" ? "לילות" : lang === "fr" ? "nuits" : "nights")
                          }
                        </p>
                      </div>
                      {opt.cheapestPrice != null && (
                        <div className="text-right shrink-0">
                          <DualPrice amount={opt.cheapestPrice} currency={opt.currency} inline className="text-sm font-medium" />
                          <p className="text-[10px] text-muted-foreground">
                            {lang === "he" ? "מ-" : lang === "fr" ? "dès" : "from"}
                          </p>
                        </div>
                      )}
                    </label>
                  ))}
                </RadioGroup>
              )}
            </>
          )}

          {/* Free calendar mode */}
          {selectedTab === "pick" && (
            <div className="space-y-3">
              <DateRangePicker value={dateRange} onChange={(range) => setDateRange(range)} />
            </div>
          )}
        </div>

        <Separator />


        {searchParams && (
          <RoomOptionsV2
            searchResult={searchResult}
            isLoading={isLoadingAvailability}
            selectedRoomId={selectedRoomId}
            selectedRatePlanId={selectedRatePlanId}
            onSelect={(roomId, ratePlanId) => {
              setSelectedRoomId(roomId);
              setSelectedRatePlanId(ratePlanId);
            }}
            lang={lang}
          />
        )}

        {searchParams && <PriceBreakdownV2 breakdown={priceBreakdown} isLoading={isLoadingAvailability} lang={lang} />}

        {/* ✅ V5: Selected extras summary */}
        {selectedExtras.length > 0 && (
          <div className="space-y-2">
            <Separator />
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              {lang === "he" ? "תוספות נבחרות" : lang === "fr" ? "Extras sélectionnés" : "Selected extras"}
            </div>
            {selectedExtras.map((extra) => {
              const name = lang === "he" ? extra.name_he || extra.name : extra.name;
              let multiplier = 1;
              if (extra.pricing_type === "per_guest") multiplier = adults;
              if (extra.pricing_type === "per_night") multiplier = nights;
              const lineTotal = extra.price * multiplier;
              return (
                <div key={extra.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{name}</span>
                  <DualPrice amount={lineTotal} currency={extra.currency} inline className="text-sm" />
                </div>
              );
            })}
            <div className="flex justify-between text-sm font-medium pt-1 border-t border-border">
              <span>{lang === "he" ? "סה\"כ תוספות" : lang === "fr" ? "Total extras" : "Extras total"}</span>
              <DualPrice amount={extrasTotal} currency={currency} inline className="text-sm" />
            </div>
          </div>
        )}

        {availabilityError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t.error}</AlertDescription>
          </Alert>
        )}

        {/* ✅ V4 FIX: Property-level remarks */}
        {propertyRemarks.length > 0 && (
          <div className="space-y-2 p-3 rounded-md bg-muted/50 border border-border">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Info className="h-4 w-4 text-muted-foreground" />
              {t.importantNotices}
            </div>
            {propertyRemarks.map((remark: string, idx: number) => (
              <p key={idx} className="text-xs text-muted-foreground leading-relaxed pl-6">{remark}</p>
            ))}
          </div>
        )}

        {/* ✅ V5: Special requests */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4" />
            {lang === "he" ? "בקשות מיוחדות" : lang === "fr" ? "Demandes spéciales" : "Special requests"}
          </div>
          <Textarea
            placeholder={lang === "he" ? "כתבו כאן בקשות מיוחדות (אופציונלי)..." : lang === "fr" ? "Écrivez vos demandes spéciales ici (optionnel)..." : "Write any special requests here (optional)..."}
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            className="min-h-[60px] text-sm resize-none"
            rows={2}
          />
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={!isReadyToBook || totalIsNaN || isBooking}
          onClick={handleBook}
        >
          {isBooking
            ? t.verifying
            : isReadyToBook && !totalIsNaN
              ? <span className="flex items-center gap-2">
                  {t.book} - <DualPrice amount={displayTotal} currency={priceBreakdown?.currency || "EUR"} inline showSecondary />
                </span>
              : t.selectDates}
        </Button>

        {/* VAT info notice */}
        <div className="flex gap-2 p-3 rounded-md bg-muted/50 border border-border">
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Prices do not include VAT. In accordance with Israeli tax law, Israeli citizens and residents are subject to 18% VAT on top of the listed rates, payable directly at the hotel. Foreign visitors holding a B2/3/4 visa are exempt from VAT.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
