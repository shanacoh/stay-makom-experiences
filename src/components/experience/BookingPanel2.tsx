/**
 * BookingPanel V2 – Step 1 only: Dates/Room selection
 * Then navigates to /checkout for guest info + confirmation
 * Fetches real-time prices/rooms from HyperGuest
 * Max 30 nights (API limit SN.400)
 */

import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, AlertCircle, CalendarDays, Sparkles, Loader2, Clock, Baby, Minus, Plus, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DateRangePicker from "./DateRangePicker";
import { DualPrice } from "@/components/ui/DualPrice";
import { RoomOptionsV2 } from "./RoomOptionsV2";
import { PriceBreakdownV2 } from "./PriceBreakdownV2";
import { useHyperGuestAvailability } from "@/hooks/useHyperGuestAvailability";
import { useQuickDateAvailability } from "@/hooks/useQuickDateAvailability";
import { useExperience2Price } from "@/hooks/useExperience2Price";
import { formatGuests, calculateNights } from "@/services/hyperguest";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { CheckoutState } from "@/pages/Checkout";

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
  experienceTitle?: string;
  experienceSlug?: string;
  hotelId: string;
  hotelName?: string;
  hyperguestPropertyId: string | null;
  currency?: string;
  minParty?: number;
  maxParty?: number;
  lang?: "en" | "he" | "fr";
  selectedExtras?: SelectedExtra[];
}

export function BookingPanel2({
  experienceId,
  experienceTitle = "",
  experienceSlug = "",
  hotelId,
  hotelName = "",
  hyperguestPropertyId,
  currency = "ILS",
  minParty = 2,
  maxParty = 4,
  lang = "en",
  selectedExtras = [],
}: BookingPanel2Props) {
  const navigate = useNavigate();

  const t = {
    en: {
      title: "Book this experience",
      dates: "Dates",
      guests: "Number of guests",
      adults: "Adults",
      children: "Children (2-12)",
      infants: "Infants (0-1)",
      childAge: "Age",
      selectDates: "Select dates",
      noHyperguest: "This experience is not available for online booking yet.",
      error: "Error loading availability. Please try again.",
      next: "Book this stay",
      onRequestWarning: "This booking is subject to hotel confirmation. You will be notified of the status.",
    },
    he: {
      title: "הזמן חוויה זו",
      dates: "תאריכים",
      guests: "מספר אורחים",
      adults: "מבוגרים",
      children: "ילדים (2-12)",
      infants: "תינוקות (0-1)",
      childAge: "גיל",
      selectDates: "בחר תאריכים",
      noHyperguest: "חוויה זו אינה זמינה עדיין להזמנה מקוונת.",
      error: "שגיאה בטעינת הזמינות. אנא נסה שוב.",
      next: "הזמן שהייה זו",
      onRequestWarning: "הזמנה זו כפופה לאישור המלון. תקבל/י עדכון על הסטטוס.",
    },
    fr: {
      title: "Réserver cette expérience",
      dates: "Dates",
      guests: "Nombre de voyageurs",
      adults: "Adultes",
      children: "Enfants (2-12 ans)",
      infants: "Bébés (0-1 an)",
      childAge: "Âge",
      selectDates: "Sélectionnez des dates",
      noHyperguest: "Cette expérience n'est pas encore disponible pour la réservation en ligne.",
      error: "Erreur lors de la récupération des disponibilités. Veuillez réessayer.",
      next: "Réserver ce séjour",
      onRequestWarning: "Cette réservation est soumise à confirmation par l'hôtel. Vous serez notifié du statut.",
    },
  }[lang];

  // ── State ──
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

  type NightsTab = 1 | 2 | 3 | "pick";
  const [selectedTab, setSelectedTab] = useState<NightsTab>(1);
  const [selectedDateOptionId, setSelectedDateOptionId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [adults, setAdults] = useState(minParty);
  const [childrenAges, setChildrenAges] = useState<number[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedRatePlanId, setSelectedRatePlanId] = useState<number | null>(null);

  // Fetch real availability for 1/2/3 nights tabs
  const propId = hyperguestPropertyId ? parseInt(hyperguestPropertyId) : null;
  const { data: quickDates, isLoading: isLoadingQuickDates } = useQuickDateAvailability({
    propertyId: propId,
    nights: typeof selectedTab === "number" ? selectedTab : 1,
    adults,
    currency,
    enabled: selectedTab !== "pick",
  });

  // Auto-select the cheapest available date when quickDates load
  useEffect(() => {
    if (selectedTab !== "pick" && quickDates && quickDates.length > 0 && !selectedDateOptionId) {
      // Find the cheapest date option
      const cheapest = quickDates.reduce((best, curr) => {
        if (curr.cheapestPrice == null) return best;
        if (!best || best.cheapestPrice == null || curr.cheapestPrice < best.cheapestPrice) return curr;
        return best;
      }, null as typeof quickDates[0] | null);
      if (cheapest) {
        setSelectedDateOptionId(cheapest.id);
      }
    }
  }, [quickDates, selectedTab, selectedDateOptionId]);

  useEffect(() => {
    if (selectedDateOptionId && selectedTab !== "pick" && quickDates) {
      const opt = quickDates.find((d) => d.id === selectedDateOptionId);
      if (opt) {
        setDateRange({ from: opt.checkin, to: opt.checkout });
      }
    }
  }, [selectedDateOptionId, quickDates, selectedTab]);

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
    const guests = formatGuests([{ adults, children: childrenAges }]);
    return { checkIn, nights, guests, hotelIds: [parseInt(hyperguestPropertyId)], customerNationality: "IL", currency };
  }, [dateRange, adults, childrenAges, hyperguestPropertyId, currency]);

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

  const selectedRoomName = useMemo(() => {
    if (!searchResult || !selectedRoomId) return "";
    let rooms: any[] = [];
    if (searchResult.results && searchResult.results.length > 0) {
      rooms = searchResult.results[0]?.rooms || [];
    } else if (searchResult.rooms) {
      rooms = searchResult.rooms;
    }
    return rooms.find((r: any) => r.roomId === selectedRoomId)?.roomName || "";
  }, [searchResult, selectedRoomId]);

  // Extract property-level remarks for checkout
  const propertyRemarks = useMemo(() => {
    let raw: string[] = [];
    if (!searchResult) return raw;
    if (searchResult.results && searchResult.results.length > 0) {
      raw = searchResult.results[0]?.remarks || [];
    } else if ((searchResult as any).remarks) {
      raw = (searchResult as any).remarks;
    }
    return raw.filter((r: string) => !/general message that should be shown/i.test(r));
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

  const extrasTotal = useMemo(() => {
    return selectedExtras.reduce((sum, extra) => {
      let multiplier = 1;
      if (extra.pricing_type === "per_guest") multiplier = adults;
      if (extra.pricing_type === "per_night") multiplier = nights;
      return sum + extra.price * multiplier;
    }, 0);
  }, [selectedExtras, adults, nights]);

  const isStep1Complete = !!(dateRange.from && dateRange.to && selectedRoomId && selectedRatePlanId);
  const displayTotal = (priceBreakdown?.finalTotal ?? 0) + extrasTotal;
  const totalIsNaN = Number.isNaN(displayTotal);
  const isOnRequest = selectedRatePlan?.isImmediate === false;

  const handleContinue = () => {
    if (!dateRange.from || !dateRange.to || !selectedRoomId || !selectedRatePlanId || !selectedRatePlan) return;

    const checkoutState: CheckoutState = {
      experienceId,
      experienceTitle,
      hotelId,
      hotelName,
      hyperguestPropertyId: hyperguestPropertyId!,
      currency,
      lang,
      adults,
      childrenAges,
      dateRange: {
        from: dateRange.from.toISOString().split("T")[0],
        to: dateRange.to.toISOString().split("T")[0],
      },
      nights,
      selectedRoomId,
      selectedRatePlanId,
      selectedRoomName,
      selectedRatePlan,
      propertyRemarks,
      selectedExtras,
      searchParams,
      experienceSlug,
    };

    navigate("/checkout", { state: checkoutState });
  };

  if (!hyperguestPropertyId) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Button
            className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium uppercase tracking-wide py-6 text-base"
            onClick={() => {
              // Navigate to contact with pre-filled experience info
              window.location.href = `/contact?subject=Stay Request: ${experienceTitle}&experience=${experienceSlug}`;
            }}
          >
            {lang === 'he' ? 'בקשו שהייה זו' : lang === 'fr' ? 'Demander ce séjour' : 'Request this stay'}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            {lang === 'he' ? 'נאשר זמינות תוך 24 שעות' : lang === 'fr' ? 'Nous confirmerons la disponibilité sous 24h' : "We'll confirm availability within 24h"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 overflow-x-hidden">
        {/* Guests */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4" />
            {t.guests}
          </div>

           {/* Adults */}
          <div className="flex items-center justify-between" dir="ltr">
            <span className="text-sm" dir={lang === "he" ? "rtl" : "ltr"}>{t.adults}</span>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setAdults(Math.max(minParty, adults - 1))} disabled={adults <= minParty}>
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-lg font-medium w-8 text-center">{adults}</span>
              <Button variant="outline" size="sm" onClick={() => setAdults(Math.min(maxParty, adults + 1))} disabled={adults >= maxParty}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Children */}
          <div className="flex items-center justify-between" dir="ltr">
            <span className="text-sm" dir={lang === "he" ? "rtl" : "ltr"}>{t.children}</span>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setChildrenAges(prev => prev.slice(0, -1))} disabled={childrenAges.length === 0}>
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-lg font-medium w-8 text-center">{childrenAges.filter(a => a >= 2).length}</span>
              <Button variant="outline" size="sm" onClick={() => setChildrenAges(prev => [...prev, 5])} disabled={childrenAges.length >= 4}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Age selectors */}
          {childrenAges.length > 0 && (
            <div className="pl-4 space-y-2">
              {childrenAges.map((age, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Baby className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground w-16">
                    {age < 2 ? (lang === "he" ? "תינוק" : lang === "fr" ? "Bébé" : "Infant") : (lang === "he" ? `ילד ${idx + 1}` : lang === "fr" ? `Enfant ${idx + 1}` : `Child ${idx + 1}`)}
                  </span>
                  <Select
                    value={String(age)}
                    onValueChange={(v) => {
                      const newAges = [...childrenAges];
                      newAges[idx] = parseInt(v);
                      setChildrenAges(newAges);
                    }}
                  >
                    <SelectTrigger className="w-20 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 13 }, (_, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {i} {lang === "he" ? "שנים" : lang === "fr" ? "ans" : i === 1 ? "yr" : "yrs"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Date Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CalendarDays className="h-4 w-4" />
            {t.dates}
          </div>

          <div className="flex gap-1.5" dir="ltr">
            {([1, 2, 3] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSelectedTab(n)}
                className={cn(
                  "flex-1 px-1 py-1.5 rounded-lg border-2 transition-all text-xs whitespace-nowrap",
                  "hover:border-primary/50",
                  selectedTab === n ? "border-primary bg-primary/5 font-medium" : "border-border"
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
                selectedTab === "pick" ? "border-primary bg-primary/5 font-medium" : "border-border"
              )}
            >
              {lang === "he" ? "בחר תאריכים" : lang === "fr" ? "Choisir" : "Pick dates"}
            </button>
          </div>

          {/* Quick date options */}
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
                          <p className="text-[10px] text-muted-foreground">
                            {lang === "he" ? "מ-" : lang === "fr" ? "à partir de" : "from"}
                          </p>
                          <DualPrice amount={opt.cheapestPrice} currency={opt.currency} inline className="text-sm font-semibold text-primary" />
                        </div>
                      )}
                    </label>
                  ))}
                </RadioGroup>
              )}
            </>
          )}

          {selectedTab === "pick" && (
            <div className="space-y-3">
              <DateRangePicker value={dateRange} onChange={(range) => setDateRange(range)} />
            </div>
          )}
        </div>

        <Separator />

        {/* Room options */}
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
            checkInDate={searchParams?.checkIn}
          />
        )}




        {/* On-request warning */}
        {isOnRequest && selectedRatePlan && (
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
            <Clock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 dark:text-amber-400">
              {t.onRequestWarning}
            </AlertDescription>
          </Alert>
        )}

        {/* Selected extras summary */}
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

        {/* Continue to checkout */}
        <Button
          className="w-full"
          size="lg"
          disabled={!isStep1Complete}
          onClick={handleContinue}
        >
          {isStep1Complete ? t.next : t.selectDates}
        </Button>
      </CardContent>
    </Card>
  );
}
