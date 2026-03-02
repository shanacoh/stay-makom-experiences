/**
 * BookingPanel V2 – 3-step wizard: Dates/Room → Guest Info → Summary & Confirm
 * Fetches real-time prices/rooms from HyperGuest
 * Max 30 nights (API limit SN.400)
 */

import { useState, useMemo, useEffect, useRef } from "react";
import { Users, AlertCircle, CalendarDays, Info, Sparkles, MessageSquare, Loader2, Clock, Baby, Minus, Plus, Check, ChevronLeft, ChevronRight } from "lucide-react";
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

type WizardStep = 1 | 2 | 3;

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
      book: "Confirm booking",
      selectDates: "Select dates",
      noHyperguest: "This experience is not available for online booking yet.",
      error: "Error loading availability. Please try again.",
      suggestedDates: "Suggested dates",
      pickDates: "Choose your dates",
      verifying: "Verifying price...",
      booking: "Booking...",
      bookingLong: "Confirmation in progress, please wait...",
      bookingVeryLong: "Taking longer than expected. Do not close this page...",
      importantNotices: "Important notices",
      priceChanged: "Price has changed",
      fillGuestInfo: "Please fill in guest information (name, email, phone, birth date)",
      bookingError: "Booking failed. Your information has been saved — please try again.",
      onRequestWarning: "This booking is subject to hotel confirmation. You will be notified of the status.",
      next: "Continue",
      back: "Back",
      step1Title: "Select your dates",
      step2Title: "Guest information",
      step3Title: "Review & confirm",
      summary: "Booking summary",
      guestDetails: "Guest details",
      stayDetails: "Stay details",
      room: "Room",
      nightsLabel: "Nights",
      guestsLabel: "Guests",
      total: "Total",
      specialRequests: "Special requests",
    },
    he: {
      title: "הזמן חוויה זו",
      dates: "תאריכים",
      guests: "מספר אורחים",
      adults: "מבוגרים",
      children: "ילדים (2-12)",
      infants: "תינוקות (0-1)",
      childAge: "גיל",
      book: "אשר הזמנה",
      selectDates: "בחר תאריכים",
      noHyperguest: "חוויה זו אינה זמינה עדיין להזמנה מקוונת.",
      error: "שגיאה בטעינת הזמינות. אנא נסה שוב.",
      suggestedDates: "תאריכים מוצעים",
      pickDates: "בחר תאריכים",
      verifying: "בודק מחיר...",
      booking: "...מזמין",
      bookingLong: "...אישור בתהליך, אנא המתן",
      bookingVeryLong: "...לוקח יותר זמן מהצפוי. אל תסגור את הדף",
      importantNotices: "הערות חשובות",
      priceChanged: "המחיר השתנה",
      fillGuestInfo: "אנא מלא פרטי אורח (שם, אימייל, טלפון, תאריך לידה)",
      bookingError: "ההזמנה נכשלה. הפרטים שלך נשמרו — אנא נסה שוב.",
      onRequestWarning: "הזמנה זו כפופה לאישור המלון. תקבל/י עדכון על הסטטוס.",
      next: "המשך",
      back: "חזרה",
      step1Title: "בחר תאריכים",
      step2Title: "פרטי אורח",
      step3Title: "סיכום ואישור",
      summary: "סיכום הזמנה",
      guestDetails: "פרטי אורח",
      stayDetails: "פרטי שהייה",
      room: "חדר",
      nightsLabel: "לילות",
      guestsLabel: "אורחים",
      total: "סה\"כ",
      specialRequests: "בקשות מיוחדות",
    },
    fr: {
      title: "Réserver cette expérience",
      dates: "Dates",
      guests: "Nombre de voyageurs",
      adults: "Adultes",
      children: "Enfants (2-12 ans)",
      infants: "Bébés (0-1 an)",
      childAge: "Âge",
      book: "Confirmer la réservation",
      selectDates: "Sélectionnez des dates",
      noHyperguest: "Cette expérience n'est pas encore disponible pour la réservation en ligne.",
      error: "Erreur lors de la récupération des disponibilités. Veuillez réessayer.",
      suggestedDates: "Dates suggérées",
      pickDates: "Choisir vos dates",
      verifying: "Vérification du prix...",
      booking: "Réservation en cours...",
      bookingLong: "Confirmation en cours, veuillez patienter...",
      bookingVeryLong: "La réservation prend plus de temps que prévu. Ne fermez pas cette page...",
      importantNotices: "Remarques importantes",
      priceChanged: "Le prix a changé",
      fillGuestInfo: "Veuillez remplir les informations voyageur (nom, email, téléphone, date de naissance)",
      bookingError: "La réservation a échoué. Vos informations ont été conservées — veuillez réessayer.",
      onRequestWarning: "Cette réservation est soumise à confirmation par l'hôtel. Vous serez notifié du statut.",
      next: "Continuer",
      back: "Retour",
      step1Title: "Choisir vos dates",
      step2Title: "Informations voyageur",
      step3Title: "Résumé & confirmation",
      summary: "Résumé de la réservation",
      guestDetails: "Détails voyageur",
      stayDetails: "Détails du séjour",
      room: "Chambre",
      nightsLabel: "Nuits",
      guestsLabel: "Voyageurs",
      total: "Total",
      specialRequests: "Demandes spéciales",
    },
  }[lang];

  // ── Wizard state ──
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);

  // ── Existing state ──
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

  // Progressive booking timer
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

  // Extract property-level remarks for Step 3
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

  const isGuestValid = leadGuest.firstName.trim() !== "" &&
    leadGuest.lastName.trim() !== "" &&
    leadGuest.email.trim() !== "" &&
    leadGuest.phone.trim() !== "" &&
    leadGuest.birthDate !== "";

  useEffect(() => {
    if (user && pendingBookAfterAuth.current) {
      pendingBookAfterAuth.current = false;
      setTimeout(() => handleBookInternal(), 300);
    }
  }, [user]);

  const handleBook = () => {
    if (!user) {
      pendingBookAfterAuth.current = true;
      setShowAuthPrompt(true);
      return;
    }
    handleBookInternal();
  };

  // ── Full booking flow ──
  const handleBookInternal = async () => {
    if (!dateRange.from || !dateRange.to || !selectedRoomId || !selectedRatePlanId || !selectedRatePlan) return;

    if (!isGuestValid) {
      setShowGuestErrors(true);
      setWizardStep(2);
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

      setBookingStep("booking");

      const staymakomRef = `SM-${experienceId.substring(0, 8).toUpperCase()}-${Date.now()}`;
      const safe = sanitizeLeadGuest(leadGuest);

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
        title: "C" as const,
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

      const hgBookingId = bookingResult.id || bookingResult.bookingId || "";
      const hgStatus = bookingResult.status || "Confirmed";
      const sellPrice = bookingResult.totalPrice?.amount ?? expectedAmount;
      const bookingCurrency = bookingResult.totalPrice?.currency ?? expectedCurrency;

      const currentSession = await supabase.auth.getSession();
      const currentUserId = currentSession.data.session?.user?.id || null;

      const confirmationToken = crypto.randomUUID();

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
        confirmation_token: confirmationToken,
      } as any);

      if (dbError) {
        console.error("Failed to save booking to DB:", dbError);
      }

      const taxBreakdown = extractTaxBreakdown(selectedRatePlan);

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
        confirmationToken,
      });
      setShowConfirmation(true);

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
            confirmationToken,
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

  // ── Step indicator ──
  const stepLabels = [t.step1Title, t.step2Title, t.step3Title];

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t.title}</CardTitle>
          {/* Progress bar */}
          <div className="flex items-center gap-2 mt-3">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-full h-1.5 rounded-full transition-colors",
                    step <= wizardStep ? "bg-primary" : "bg-muted"
                  )}
                />
                <span className={cn(
                  "text-[10px]",
                  step === wizardStep ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {stepLabels[step - 1]}
                </span>
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* ════════════ STEP 1: Dates / Room / Extras ════════════ */}
          {wizardStep === 1 && (
            <>
              {/* Guests */}
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

                {/* Children */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t.children}</span>
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

                <div className="flex gap-1.5">
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

              {/* Price breakdown */}
              {searchParams && <PriceBreakdownV2 breakdown={priceBreakdown} isLoading={isLoadingAvailability} lang={lang} ratePlanPrices={ratePlanPrices} />}

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

              {/* Next button */}
              <Button
                className="w-full"
                size="lg"
                disabled={!isStep1Complete}
                onClick={() => setWizardStep(2)}
              >
                {isStep1Complete ? (
                  <span className="flex items-center gap-2">
                    {t.next}
                    <ChevronRight className="h-4 w-4" />
                  </span>
                ) : t.selectDates}
              </Button>
            </>
          )}

          {/* ════════════ STEP 2: Guest Information ════════════ */}
          {wizardStep === 2 && (
            <>
              <LeadGuestForm value={leadGuest} onChange={setLeadGuest} lang={lang} showErrors={showGuestErrors} />

              <Separator />

              {/* Special requests */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="h-4 w-4" />
                  {t.specialRequests}
                </div>
                <Textarea
                  placeholder={lang === "he" ? "כתבו כאן בקשות מיוחדות (אופציונלי)..." : lang === "fr" ? "Écrivez vos demandes spéciales ici (optionnel)..." : "Write any special requests here (optional)..."}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="min-h-[60px] text-sm resize-none"
                  rows={2}
                />
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setWizardStep(1)}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t.back}
                </Button>
                <Button
                  className="flex-1"
                  disabled={!isGuestValid}
                  onClick={() => {
                    if (!isGuestValid) {
                      setShowGuestErrors(true);
                      toast.error(t.fillGuestInfo);
                      return;
                    }
                    setWizardStep(3);
                  }}
                >
                  {t.next}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </>
          )}

          {/* ════════════ STEP 3: Summary & Confirm ════════════ */}
          {wizardStep === 3 && (
            <>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">{t.summary}</h3>

                {/* Stay details */}
                <div className="space-y-2 p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs font-medium text-foreground">{t.stayDetails}</p>
                  {experienceTitle && (
                    <p className="text-sm font-medium">{experienceTitle}</p>
                  )}
                  {hotelName && (
                    <p className="text-xs text-muted-foreground">{hotelName}</p>
                  )}
                  <Separator className="my-2" />
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">{t.dates}</span>
                      <p className="font-medium">
                        {dateRange.from && format(dateRange.from, "dd MMM")} → {dateRange.to && format(dateRange.to, "dd MMM yyyy")}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t.nightsLabel}</span>
                      <p className="font-medium">{nights}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t.guestsLabel}</span>
                      <p className="font-medium">{totalPartySize}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t.room}</span>
                      <p className="font-medium truncate">{selectedRoomName}</p>
                    </div>
                  </div>
                </div>

                {/* Guest details */}
                <div className="space-y-2 p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs font-medium text-foreground">{t.guestDetails}</p>
                  <div className="text-xs space-y-1">
                    <p>{leadGuest.firstName} {leadGuest.lastName}</p>
                    <p className="text-muted-foreground">{leadGuest.email}</p>
                    <p className="text-muted-foreground">{leadGuest.phone}</p>
                  </div>
                  {specialRequests && (
                    <>
                      <Separator className="my-2" />
                      <p className="text-xs text-muted-foreground italic">"{specialRequests}"</p>
                    </>
                  )}
                </div>

                {/* Price breakdown */}
                {priceBreakdown && (
                  <PriceBreakdownV2 breakdown={priceBreakdown} isLoading={false} lang={lang} ratePlanPrices={ratePlanPrices} />
                )}

                {/* Extras recap */}
                {selectedExtras.length > 0 && (
                  <div className="space-y-1">
                    {selectedExtras.map((extra) => {
                      const name = lang === "he" ? extra.name_he || extra.name : extra.name;
                      let multiplier = 1;
                      if (extra.pricing_type === "per_guest") multiplier = adults;
                      if (extra.pricing_type === "per_night") multiplier = nights;
                      const lineTotal = extra.price * multiplier;
                      return (
                        <div key={extra.id} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{name}</span>
                          <DualPrice amount={lineTotal} currency={extra.currency} inline className="text-xs" />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Total */}
                {!totalIsNaN && (
                  <div className="flex justify-between items-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <span className="text-sm font-semibold">{t.total}</span>
                    <DualPrice amount={displayTotal} currency={priceBreakdown?.currency || "EUR"} inline className="text-lg font-bold text-primary" showSecondary />
                  </div>
                )}

                {/* Cancellation policy */}
                {selectedRatePlan?.cancellationPolicies && searchParams?.checkIn && (() => {
                  const cancellation = analyzeCancellationPolicies(
                    selectedRatePlan.cancellationPolicies,
                    searchParams.checkIn,
                    lang,
                  );
                  if (!cancellation.badgeText) return null;

                  if (cancellation.isFreeCancellation) {
                    return (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                        <Check className="h-3.5 w-3.5 shrink-0" />
                        <span>{cancellation.badgeText}</span>
                      </div>
                    );
                  }

                  return (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {cancellation.detailLines.length > 0 && <Info className="h-3.5 w-3.5 shrink-0" />}
                      <span>{cancellation.isNonRefundable ? cancellation.badgeText : cancellation.summaryText}</span>
                    </div>
                  );
                })()}

                {/* On-request warning */}
                {isOnRequest && selectedRatePlan && (
                  <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700 dark:text-amber-400">
                      {t.onRequestWarning}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Hotel remarks (pets, taxes, visa info) */}
                {propertyRemarks.length > 0 && (
                  <div className="space-y-1.5 p-3 rounded-md bg-muted/50 border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs font-medium text-foreground">{t.importantNotices}</p>
                    </div>
                    {propertyRemarks.map((remark: string, idx: number) => (
                      <p key={idx} className="text-xs text-muted-foreground leading-relaxed">{remark}</p>
                    ))}
                  </div>
                )}

                {/* VAT info notice */}
                <div className="flex gap-2 p-3 rounded-md bg-muted/50 border border-border">
                  <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {lang === "he"
                      ? "המחירים אינם כוללים מע\"מ. בהתאם לחוק המס הישראלי, אזרחי ותושי ישראל חייבים ב-18% מע\"מ, לתשלום ישיר במלון. מבקרים זרים עם אשרת B2/3/4 פטורים ממע\"מ."
                      : lang === "fr"
                        ? "Les prix n'incluent pas la TVA. Conformément à la législation fiscale israélienne, les citoyens et résidents israéliens sont soumis à 18% de TVA, payable directement à l'hôtel. Les visiteurs étrangers munis d'un visa B2/3/4 en sont exemptés."
                        : "Prices do not include VAT. In accordance with Israeli tax law, Israeli citizens and residents are subject to 18% VAT on top of the listed rates, payable directly at the hotel. Foreign visitors holding a B2/3/4 visa are exempt from VAT."
                    }
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <Button variant="outline" className="shrink-0" onClick={() => setWizardStep(2)}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t.back}
                </Button>
                <Button
                  className="flex-1"
                  size="lg"
                  disabled={totalIsNaN || isBooking}
                  onClick={handleBook}
                >
                  {isBooking ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {getBookingMessage()}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {t.book} — <DualPrice amount={displayTotal} currency={priceBreakdown?.currency || "EUR"} inline showSecondary />
                    </span>
                  )}
                </Button>
              </div>
            </>
          )}

        </CardContent>
      </Card>

      {/* Confirmation dialog */}
      <BookingConfirmationDialog
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        data={confirmationData}
        lang={lang}
      />

      {/* Auth prompt */}
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
