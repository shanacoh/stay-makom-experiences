/**
 * BookingPanel V2 – Hybrid: predefined dates + free calendar
 * Fetches real-time prices/rooms from HyperGuest
 * Max 30 nights (API limit SN.400)
 */

import { useState, useMemo, useEffect } from "react";
import { Calendar, Users, AlertCircle, Globe, CalendarDays, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import DateRangePicker from "./DateRangePicker";
import { RoomOptionsV2 } from "./RoomOptionsV2";
import { PriceBreakdownV2 } from "./PriceBreakdownV2";
import { useHyperGuestAvailability } from "@/hooks/useHyperGuestAvailability";
import { useExperience2Price } from "@/hooks/useExperience2Price";
import { formatGuests, calculateNights } from "@/services/hyperguest";
import { toast } from "sonner";
import { format } from "date-fns";

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

interface BookingPanel2Props {
  experienceId: string;
  hotelId: string;
  hyperguestPropertyId: string | null;
  currency?: string;
  minParty?: number;
  maxParty?: number;
  lang?: "en" | "he" | "fr";
}

export function BookingPanel2({
  experienceId,
  hotelId,
  hyperguestPropertyId,
  currency = "ILS",
  minParty = 2,
  maxParty = 4,
  lang = "en",
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

  const [dateMode, setDateMode] = useState<"suggested" | "free">("suggested");
  const [selectedDateOptionId, setSelectedDateOptionId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [adults, setAdults] = useState(minParty);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedRatePlanId, setSelectedRatePlanId] = useState<number | null>(null);
  const [isIsraeli, setIsIsraeli] = useState(true);

  // Default to free mode if no predefined dates
  useEffect(() => {
    if (dateOptions && !hasPredefinedDates) {
      setDateMode("free");
    }
  }, [dateOptions, hasPredefinedDates]);

  // When a predefined date is selected, set the dateRange
  useEffect(() => {
    if (selectedDateOptionId && dateOptions) {
      const opt = dateOptions.find((d) => d.id === selectedDateOptionId);
      if (opt) {
        setDateRange({
          from: new Date(opt.checkin + "T00:00:00"),
          to: new Date(opt.checkout + "T00:00:00"),
        });
      }
    }
  }, [selectedDateOptionId, dateOptions]);

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

  const nights = searchParams?.nights || 0;
  const ratePlanPrices = selectedRatePlan?.prices || null;
  const priceBreakdown = useExperience2Price(experienceId, null, currency, nights, adults, ratePlanPrices, isIsraeli);

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

  const handleBook = () => {
    if (!dateRange.from || !dateRange.to || !selectedRoomId || !selectedRatePlanId) return;
    toast.info("Booking flow coming soon!");
  };

  const isReadyToBook = dateRange.from && dateRange.to && selectedRoomId && selectedRatePlanId && priceBreakdown;
  const displayTotal = priceBreakdown?.finalTotal ?? 0;
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

          {/* Predefined dates mode */}
          {hasPredefinedDates && dateMode === "suggested" && (
            <div className="space-y-3">
              <RadioGroup
                value={selectedDateOptionId ?? ""}
                onValueChange={(val) => setSelectedDateOptionId(val)}
                className="space-y-2"
              >
                {(dateOptions ?? []).map((opt) => {
                  const checkinDate = new Date(opt.checkin + "T00:00:00");
                  const checkoutDate = new Date(opt.checkout + "T00:00:00");
                  const nightsCount = Math.round((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));

                  return (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedDateOptionId === opt.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={opt.id} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {format(checkinDate, "EEE dd MMM")} → {format(checkoutDate, "EEE dd MMM")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {nightsCount} {nightsCount === 1 ? "night" : "nights"}
                          {opt.label && ` · ${lang === "he" ? (opt.label_he || opt.label) : opt.label}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {opt.original_price != null && (
                          <span className="text-xs text-muted-foreground line-through">₪{opt.original_price}</span>
                        )}
                        {opt.price_override != null && (
                          <span className="text-sm font-bold">₪{opt.price_override}</span>
                        )}
                        {opt.discount_percent != null && (
                          <Badge variant="destructive" className="text-xs">-{opt.discount_percent}%</Badge>
                        )}
                        {opt.featured && (
                          <Badge variant="secondary" className="text-xs">⚡</Badge>
                        )}
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>

              <button
                type="button"
                onClick={() => {
                  setDateMode("free");
                  setSelectedDateOptionId(null);
                  setDateRange({});
                }}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                {t.orPickOwn}
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Free calendar mode */}
          {(dateMode === "free" || !hasPredefinedDates) && (
            <div className="space-y-3">
              <DateRangePicker value={dateRange} onChange={(range) => setDateRange(range)} />

              {hasPredefinedDates && (
                <button
                  type="button"
                  onClick={() => {
                    setDateMode("suggested");
                    setDateRange({});
                    setSelectedDateOptionId(null);
                  }}
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {t.orSeeSuggested}
                  <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Israeli Resident Toggle */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Globe className="h-4 w-4" />
            {lang === "he" ? "תושב ישראל" : lang === "fr" ? "Résident israélien" : "Israeli resident"}
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isIsraeli} onCheckedChange={setIsIsraeli} />
            <Label className="text-xs text-muted-foreground">
              {isIsraeli
                ? (lang === "he" ? "כן" : lang === "fr" ? "Oui" : "Yes")
                : (lang === "he" ? "לא - תייר" : lang === "fr" ? "Non - touriste" : "No - tourist")}
            </Label>
          </div>
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

        {availabilityError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t.error}</AlertDescription>
          </Alert>
        )}

        <Button className="w-full" size="lg" disabled={!isReadyToBook || totalIsNaN} onClick={handleBook}>
          {isReadyToBook && !totalIsNaN
            ? `${t.book} - ${new Intl.NumberFormat(lang === "he" ? "he-IL" : "en-US", {
                style: "currency",
                currency: priceBreakdown?.currency || "ILS",
              }).format(displayTotal)}`
            : t.selectDates}
        </Button>

        <p className="text-xs text-muted-foreground text-center">{t.note}</p>
      </CardContent>
    </Card>
  );
}
