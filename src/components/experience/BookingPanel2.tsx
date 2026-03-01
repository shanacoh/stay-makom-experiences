/**
 * BookingPanel V2 – Hybrid: predefined dates + free calendar
 * Fetches real-time prices/rooms from HyperGuest
 * Max 30 nights (API limit SN.400)
 * ✅ B1: Pre-book before booking + price change detection
 * ✅ V4: Property remarks display
 * ✅ V5: Optional hotel extras (Spice it up) affecting total price
 * ✅ V6: Full booking flow — pre-book → create-booking → save DB → confirmation
 * ✅ #3b: isImmediate warning for on-request bookings
 * ✅ #5b: Progressive booking messages
 * ✅ #7: Children/infants selector
 * ✅ #10b: Structured error codes
 */

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Users, AlertCircle, CalendarDays, Info, Sparkles, MessageSquare, Loader2, Clock, Baby, Minus, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DateRangePicker from "./DateRangePicker";
import { DualPrice } from "@/components/ui/DualPrice";
import { Textarea } from "@/components/ui/textarea";
import { RoomOptionsV2 } from "./RoomOptionsV2";
import { PriceBreakdownV2 } from "./PriceBreakdownV2";
import { LeadGuestForm, EMPTY_LEAD_GUEST, sanitizeLeadGuest, type LeadGuestData } from "./LeadGuestForm";
import { BookingConfirmationDialog, type BookingConfirmationData } from "./BookingConfirmationDialog";
import AuthPromptDialog from "@/components/auth/AuthPromptDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useHyperGuestAvailability } from "@/hooks/useHyperGuestAvailability";
import { useQuickDateAvailability } from "@/hooks/useQuickDateAvailability";
import { useExperience2Price } from "@/hooks/useExperience2Price";
import { formatGuests, calculateNights, preBook, createBooking } from "@/services/hyperguest";
import { extractTaxBreakdown } from "@/utils/taxesDisplay";
import { analyzeCancellationPolicies } from "@/utils/cancellationPolicy";
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
  experienceTitle?: string;
  hotelId: string;
  hotelName?: string;
  hyperguestPropertyId: string | null;
  currency?: string;
  minParty?: number;
  maxParty?: number;
  lang?: "en" | "he" | "fr";
  selectedExtras?: SelectedExtra[];
}

// ✅ #10b: Structured error messages by HG error code
const hgErrorMessages: Record<string, Record<string, string>> = {
  'BN.402': {
    en: "The price has changed since your search. Please search again.",
    he: "המחיר השתנה מאז החיפוש שלך. אנא חפש שוב.",
    fr: "Le prix a changé depuis votre recherche. Veuillez relancer une recherche.",
  },
  'BN.502': {
    en: "This room is no longer available. Please choose another option.",
    he: "החדר אינו זמין עוד. אנא בחר אפשרות אחרת.",
    fr: "Cette chambre n'est plus disponible. Veuillez choisir une autre option.",
  },
  'BN.506': {
    en: "Processing error. Please try again or contact support.",
    he: "שגיאת עיבוד. אנא נסה שוב או פנה לתמיכה.",
    fr: "Erreur de traitement. Veuillez réessayer ou contacter le support.",
  },
  'BN.507': {
    en: "Payment could not be processed. Please check your card details.",
    he: "התשלום לא בוצע. אנא בדק את פרטי הכרטיס.",
    fr: "Le paiement n'a pas pu être traité. Vérifiez vos informations de carte.",
  },
};

export function BookingPanel2({
  experienceId,
  experienceTitle = "",
  hotelId,
  hotelName = "",
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
      adults: "Adults",
      children: "Children (2-12)",
      infants: "Infants (0-1)",
      childAge: "Age",
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
      booking: "Booking...",
      bookingLong: "Confirmation in progress, please wait...",
      bookingVeryLong: "Taking longer than expected. Do not close this page...",
      importantNotices: "Important notices",
      priceChanged: "Price has changed",
      priceChangedConfirm: "The price changed. Do you want to continue with the new price?",
      fillGuestInfo: "Please fill in guest information (name, email, phone, birth date)",
      bookingError: "Booking failed. Your information has been saved — please try again.",
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
      booking: "...מזמין",
      bookingLong: "...אישור בתהליך, אנא המתן",
      bookingVeryLong: "...לוקח יותר זמן מהצפוי. אל תסגור את הדף",
      importantNotices: "הערות חשובות",
      priceChanged: "המחיר השתנה",
      priceChangedConfirm: "המחיר השתנה. האם תרצה להמשיך עם המחיר החדש?",
      fillGuestInfo: "אנא מלא פרטי אורח (שם, אימייל, טלפון, תאריך לידה)",
      bookingError: "ההזמנה נכשלה. הפרטים שלך נשמרו — אנא נסה שוב.",
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
      booking: "Réservation en cours...",
      bookingLong: "Confirmation en cours, veuillez patienter...",
      bookingVeryLong: "La réservation prend plus de temps que prévu. Ne fermez pas cette page...",
      importantNotices: "Remarques importantes",
      priceChanged: "Le prix a changé",
      priceChangedConfirm: "Le prix a changé. Voulez-vous continuer avec le nouveau prix ?",
      fillGuestInfo: "Veuillez remplir les informations voyageur (nom, email, téléphone, date de naissance)",
      bookingError: "La réservation a échoué. Vos informations ont été conservées — veuillez réessayer.",
      onRequestWarning: "Cette réservation est soumise à confirmation par l'hôtel. Vous serez notifié du statut.",
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
  // ✅ #7: Children ages array
  const [childrenAges, setChildrenAges] = useState<number[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedRatePlanId, setSelectedRatePlanId] = useState<number | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState<"idle" | "prebook" | "booking">("idle");
  const [bookingElapsed, setBookingElapsed] = useState(0);
  const [specialRequests, setSpecialRequests] = useState("");
  const [leadGuest, setLeadGuest] = useState<LeadGuestData>(EMPTY_LEAD_GUEST);
  const [confirmationData, setConfirmationData] = useState<BookingConfirmationData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showGuestErrors, setShowGuestErrors] = useState(false);
  const pendingBookAfterAuth = useRef(false);
  const bookingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { user } = useAuth();

  // ✅ #5b: Progressive booking timer
  useEffect(() => {
    if (isBooking) {
      setBookingElapsed(0);
      bookingTimerRef.current = setInterval(() => {
        setBookingElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (bookingTimerRef.current) {
        clearInterval(bookingTimerRef.current);
        bookingTimerRef.current = null;
      }
      setBookingElapsed(0);
    }
    return () => {
      if (bookingTimerRef.current) clearInterval(bookingTimerRef.current);
    };
  }, [isBooking]);

  const getBookingMessage = () => {
    if (bookingStep === "prebook") return t.verifying;
    if (bookingElapsed > 30) return t.bookingVeryLong;
    if (bookingElapsed > 10) return t.bookingLong;
    return t.booking;
  };

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
    // ✅ #7: Include children ages in guest format
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

  // Get selected room name
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

  // ✅ V4 FIX: Extract property-level remarks from search result
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
  const totalPartySize = adults + childrenAges.length;
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

  // Validate lead guest data
  const isGuestValid = leadGuest.firstName.trim() !== "" &&
    leadGuest.lastName.trim() !== "" &&
    leadGuest.email.trim() !== "" &&
    leadGuest.phone.trim() !== "" &&
    leadGuest.birthDate !== "";

  // Auto-trigger booking after auth
  useEffect(() => {
    if (user && pendingBookAfterAuth.current) {
      pendingBookAfterAuth.current = false;
      setTimeout(() => handleBookInternal(), 300);
    }
  }, [user]);

  // ✅ Auth gate: check login before booking
  const handleBook = () => {
    if (!user) {
      pendingBookAfterAuth.current = true;
      setShowAuthPrompt(true);
      return;
    }
    handleBookInternal();
  };

  // ✅ V6: Full booking flow — Pre-book → Create booking → Save to DB
  const handleBookInternal = async () => {
    if (!dateRange.from || !dateRange.to || !selectedRoomId || !selectedRatePlanId || !selectedRatePlan) return;

    if (!isGuestValid) {
      setShowGuestErrors(true);
      toast.error(t.fillGuestInfo);
      return;
    }

    setIsBooking(true);
    setBookingStep("prebook");

    try {
      const checkIn = dateRange.from.toISOString().split("T")[0];
      const checkOut = dateRange.to.toISOString().split("T")[0];

      const expectedAmount = selectedRatePlan.payment?.chargeAmount?.price
        ?? selectedRatePlan.prices?.sell?.price
        ?? selectedRatePlan.prices?.sell?.amount
        ?? 0;
      const expectedCurrency = selectedRatePlan.payment?.chargeAmount?.currency
        ?? selectedRatePlan.prices?.sell?.currency
        ?? "EUR";

      // ── Step 1: Pre-book ──
      const preBookData = {
        search: {
          dates: { from: checkIn, to: checkOut },
          propertyId: parseInt(hyperguestPropertyId!),
          nationality: leadGuest.country || "IL",
          pax: [{ adults, children: childrenAges }],
        },
        rooms: [{
          roomId: selectedRoomId,
          ratePlanId: selectedRatePlanId,
          expectedPrice: { amount: expectedAmount, currency: expectedCurrency },
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
        setBookingStep("idle");
        return;
      }

      // ── Step 2: Create Booking ──
      setBookingStep("booking");

      const staymakomRef = `SM-${experienceId.substring(0, 8).toUpperCase()}-${Date.now()}`;

      const safe = sanitizeLeadGuest(leadGuest);

      // ✅ #7: Build guests list with children
      const adultGuests = [
        {
          birthDate: safe.birthDate,
          title: safe.title,
          name: { first: safe.firstName, last: safe.lastName },
        },
        ...Array.from({ length: Math.max(0, adults - 1) }, (_, i) => ({
          birthDate: "1990-01-01",
          title: "MR" as const,
          name: { first: `Guest`, last: `${i + 2}` },
        })),
      ];

      const childGuests = childrenAges.map((age, i) => ({
        birthDate: `${new Date().getFullYear() - age}-01-01`,
        title: "C" as const, // ✅ Children and infants always use "C"
        name: { first: `Child`, last: `${i + 1}` },
      }));

      const bookingData = {
        dates: { from: checkIn, to: checkOut },
        propertyId: parseInt(hyperguestPropertyId!),
        leadGuest: {
          birthDate: safe.birthDate,
          title: safe.title,
          name: { first: safe.firstName, last: safe.lastName },
          contact: {
            address: safe.address,
            city: safe.city,
            country: safe.country,
            email: safe.email,
            phone: safe.phone,
            state: "N/A",
            zip: "00000",
          },
        },
        reference: { agency: staymakomRef },
        rooms: [{
          roomId: selectedRoomId,
          ratePlanId: selectedRatePlanId,
          expectedPrice: { amount: expectedAmount, currency: expectedCurrency },
          specialRequests: specialRequests || undefined,
          guests: [...adultGuests, ...childGuests],
        }],
      };

      console.log("[Book] body:", JSON.stringify(bookingData, null, 2));
      const bookingResult = await createBooking(bookingData);

      // ── Step 3: Save to bookings_hg ──
      const hgBookingId = bookingResult.id || bookingResult.bookingId || "";
      const hgStatus = bookingResult.status || "Confirmed";
      const sellPrice = bookingResult.totalPrice?.amount ?? expectedAmount;
      const bookingCurrency = bookingResult.totalPrice?.currency ?? expectedCurrency;

      const currentSession = await supabase.auth.getSession();
      const currentUserId = currentSession.data.session?.user?.id || null;

      const { error: dbError } = await supabase.from("bookings_hg").insert({
        hg_booking_id: hgBookingId,
        hotel_id: hotelId,
        experience_id: experienceId,
        checkin: checkIn,
        checkout: checkOut,
        nights,
        party_size: totalPartySize,
        sell_price: sellPrice,
        net_price: 0,
        commission_amount: priceBreakdown?.totalCommissions ?? 0,
        currency: bookingCurrency,
        status: hgStatus.toLowerCase(),
        hg_status: hgStatus,
        board_type: selectedRatePlan?.board || "RO",
        room_code: String(selectedRoomId),
        room_name: selectedRoomName,
        rate_plan: String(selectedRatePlanId),
        customer_name: `${leadGuest.firstName} ${leadGuest.lastName}`,
        customer_email: leadGuest.email,
        hg_raw_data: bookingResult,
        user_id: currentUserId,
      } as any);

      if (dbError) {
        console.error("Failed to save booking to DB:", dbError);
      }

      // ✅ #2: Extract display taxes for confirmation
      const taxBreakdown = extractTaxBreakdown(selectedRatePlan);

      // ── Step 4: Show confirmation ──
      const allRemarks = [
        ...propertyRemarks,
        ...(selectedRatePlan?.remarks || []),
      ].filter((r: string) => !/general message that should be shown/i.test(r));

      setConfirmationData({
        hgBookingId,
        status: hgStatus,
        hotelName: hotelName || "Hotel",
        roomName: selectedRoomName,
        boardType: selectedRatePlan?.board || "RO",
        checkIn,
        checkOut,
        nights,
        partySize: totalPartySize,
        sellPrice,
        currency: bookingCurrency,
        remarks: allRemarks,
        specialRequests,
        experienceTitle: experienceTitle || "Experience",
        staymakomRef,
        displayTaxesTotal: taxBreakdown.totalDisplayAmount,
        isOnRequest: selectedRatePlan?.isImmediate === false,
      });
      setShowConfirmation(true);

      // ── Step 5: Send confirmation email ──
      try {
        const emailCancellation = analyzeCancellationPolicies(
          selectedRatePlan?.cancellationPolicies,
          checkIn,
          lang,
        );

        await supabase.functions.invoke("send-booking-confirmation", {
          body: {
            to: leadGuest.email,
            guestName: `${leadGuest.firstName} ${leadGuest.lastName}`,
            experienceTitle: experienceTitle,
            hotelName: hotelName,
            roomName: selectedRoomName,
            boardType: selectedRatePlan?.board || "RO",
            checkIn,
            checkOut,
            nights,
            partySize: totalPartySize,
            totalPrice: sellPrice,
            currency: bookingCurrency,
            bookingRef: staymakomRef,
            hgBookingId,
            remarks: allRemarks,
            specialRequests,
            lang,
            displayTaxesTotal: taxBreakdown.totalDisplayAmount,
            cancellationPolicy: {
              summaryText: emailCancellation.summaryText,
              isNonRefundable: emailCancellation.isNonRefundable,
              deadline: emailCancellation.effectiveDeadline?.toISOString() || null,
            },
          },
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }

    } catch (error: any) {
      console.error("Pre-book/Booking error:", error);
      const detail = error?.message || "";

      // ✅ #10b: Parse structured error code
      const codeMatch = detail.match(/BN\.\d+/);
      const errorCode = codeMatch?.[0] || "";
      const friendlyMsg = hgErrorMessages[errorCode]?.[lang];

      toast.error(t.bookingError, {
        description: friendlyMsg || (detail.length > 120 ? detail.substring(0, 120) + "…" : detail || undefined),
        duration: 8000,
      });
    } finally {
      setIsBooking(false);
      setBookingStep("idle");
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

  const isReadyToBook = dateRange.from && dateRange.to && selectedRoomId && selectedRatePlanId && priceBreakdown && isGuestValid;
  const displayTotal = (priceBreakdown?.finalTotal ?? 0) + extrasTotal;
  const totalIsNaN = Number.isNaN(displayTotal);

  // ✅ #3b: Check if selected rate plan is on-request
  const isOnRequest = selectedRatePlan?.isImmediate === false;

  if (!hyperguestPropertyId) {
    console.log("[BookingPanel2] ⛔ No hyperguestPropertyId — props received:", {
      experienceId,
      hotelId,
      hyperguestPropertyId,
    });
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Guests — ✅ #7: Adults + Children + Infants */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              {t.guests}
            </div>

            {/* Adults */}
            <div className="flex items-center justify-between">
              <span className="text-sm">{t.adults}</span>
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

            {/* Children (2-12) */}
            <div className="flex items-center justify-between">
              <span className="text-sm">{t.children}</span>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChildrenAges(prev => prev.slice(0, -1))}
                  disabled={childrenAges.length === 0}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-lg font-medium w-8 text-center">{childrenAges.filter(a => a >= 2).length}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChildrenAges(prev => [...prev, 5])}
                  disabled={childrenAges.length >= 4}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Age selectors for children */}
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
                            {i} {lang === "he" ? (i < 2 ? "שנים" : "שנים") : lang === "fr" ? "ans" : i === 1 ? "yr" : "yrs"}
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
              checkInDate={searchParams?.checkIn}
            />
          )}

          {searchParams && <PriceBreakdownV2 breakdown={priceBreakdown} isLoading={isLoadingAvailability} lang={lang} ratePlanPrices={ratePlanPrices} />}

          {/* ✅ #3b: On-request warning */}
          {isOnRequest && selectedRatePlan && (
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
              <Clock className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700 dark:text-blue-400">
                {t.onRequestWarning}
              </AlertDescription>
            </Alert>
          )}

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
            <div className="space-y-1.5 p-3 rounded-md bg-muted/50 border border-border">
              {propertyRemarks.map((remark: string, idx: number) => (
                <p key={idx} className="text-xs text-muted-foreground leading-relaxed">{remark}</p>
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

          {/* ✅ V6: Lead guest form — shown when room is selected */}
          {selectedRoomId && selectedRatePlanId && (
            <>
              <Separator />
              <LeadGuestForm value={leadGuest} onChange={setLeadGuest} lang={lang} showErrors={showGuestErrors} />

              {/* Cancellation policy recap */}
              {selectedRatePlan?.cancellationPolicies && searchParams?.checkIn && (() => {
                const cancellation = analyzeCancellationPolicies(
                  selectedRatePlan.cancellationPolicies,
                  searchParams.checkIn,
                  lang,
                );
                if (!cancellation.summaryText) return null;
                return (
                  <div className={cn(
                    "flex items-start gap-2 p-3 rounded-md border text-sm",
                    cancellation.isFreeCancellation && "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400",
                    cancellation.isNonRefundable && "bg-destructive/10 border-destructive/30 text-destructive",
                    !cancellation.isFreeCancellation && !cancellation.isNonRefundable && "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/30 dark:border-orange-800 dark:text-orange-400",
                  )}>
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>{cancellation.summaryText}</p>
                  </div>
                );
              })()}
            </>
          )}

          <Button
            className="w-full"
            size="lg"
            disabled={!isReadyToBook || totalIsNaN || isBooking}
            onClick={handleBook}
          >
            {isBooking
              ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {getBookingMessage()}
                </span>
              )
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

      {/* ✅ V6: Booking confirmation dialog */}
      <BookingConfirmationDialog
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        data={confirmationData}
        lang={lang}
      />

      {/* Auth prompt for unauthenticated booking */}
      <AuthPromptDialog
        open={showAuthPrompt}
        onOpenChange={(open) => {
          setShowAuthPrompt(open);
          if (!open && !user) {
            pendingBookAfterAuth.current = false;
          }
        }}
        lang={lang as "en" | "he" | "fr"}
        defaultTab="login"
        context="account"
      />
    </>
  );
}
