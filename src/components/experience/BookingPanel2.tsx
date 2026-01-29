/**
 * Composant BookingPanel V2 avec intégration HyperGuest
 * Récupère les prix/chambres réels et calcule le prix avec les ajouts
 */

import { useState, useMemo, useEffect } from 'react';
import { Calendar, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DateRangePicker from './DateRangePicker';
import { RoomOptionsV2 } from './RoomOptionsV2';
import { PriceBreakdownV2 } from './PriceBreakdownV2';
import { useHyperGuestAvailability } from '@/hooks/useHyperGuestAvailability';
import { useExperience2Price } from '@/hooks/useExperience2Price';
import { formatGuests, calculateNights } from '@/services/hyperguest';
import { toast } from 'sonner';

interface BookingPanel2Props {
  experienceId: string;
  hotelId: string; // Reserved for future booking flow
  hyperguestPropertyId: string | null;
  currency?: string;
  minParty?: number;
  maxParty?: number;
  lang?: 'en' | 'he' | 'fr';
}

export function BookingPanel2({
  experienceId,
  hotelId,
  hyperguestPropertyId,
  currency = 'ILS',
  minParty = 2,
  maxParty = 4,
  lang = 'en',
}: BookingPanel2Props) {
  const t = {
    en: {
      title: 'Book this experience',
      dates: 'Dates',
      guests: 'Number of guests',
      book: 'Book',
      selectDates: 'Select dates',
      noHyperguest: 'This experience is not available for online booking yet.',
      error: 'Error loading availability. Please try again.',
      note: 'Prices are calculated in real-time based on HyperGuest availability',
    },
    he: {
      title: 'הזמן חוויה זו',
      dates: 'תאריכים',
      guests: 'מספר אורחים',
      book: 'הזמן',
      selectDates: 'בחר תאריכים',
      noHyperguest: 'חוויה זו אינה זמינה עדיין להזמנה מקוונת.',
      error: 'שגיאה בטעינת הזמינות. אנא נסה שוב.',
      note: 'המחירים מחושבים בזמן אמת על פי זמינות HyperGuest',
    },
    fr: {
      title: 'Réserver cette expérience',
      dates: 'Dates',
      guests: 'Nombre de voyageurs',
      book: 'Réserver',
      selectDates: 'Sélectionnez des dates',
      noHyperguest: 'Cette expérience n\'est pas encore disponible pour la réservation en ligne.',
      error: 'Erreur lors de la récupération des disponibilités. Veuillez réessayer.',
      note: 'Les prix sont calculés en temps réel selon les disponibilités HyperGuest',
    },
  }[lang];

  // État des dates
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [adults, setAdults] = useState(minParty);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedRatePlanId, setSelectedRatePlanId] = useState<number | null>(null);

  // Calculer les paramètres de recherche
  const searchParams = useMemo(() => {
    if (!dateRange.from || !dateRange.to || !hyperguestPropertyId) {
      return null;
    }

    const checkIn = dateRange.from.toISOString().split('T')[0];
    const nights = calculateNights(checkIn, dateRange.to.toISOString().split('T')[0]);
    const guests = formatGuests([{ adults, children: [] }]);

    return {
      checkIn,
      nights,
      guests,
      hotelIds: [parseInt(hyperguestPropertyId)],
      customerNationality: 'IL',
      currency,
    };
  }, [dateRange, adults, hyperguestPropertyId, currency]);

  // Récupérer les disponibilités HyperGuest
  const {
    data: searchResult,
    isLoading: isLoadingAvailability,
    error: availabilityError,
  } = useHyperGuestAvailability(
    hyperguestPropertyId ? parseInt(hyperguestPropertyId) : null,
    searchParams
  );

  // Trouver le rate plan sélectionné
  const selectedRatePlan = useMemo(() => {
    if (!searchResult || !selectedRoomId || !selectedRatePlanId) {
      return null;
    }

    // searchResult peut être soit { results: [...] } soit directement { rooms: [...] }
    let rooms: any[] = [];
    if (searchResult.results && searchResult.results.length > 0) {
      rooms = searchResult.results[0]?.rooms || [];
    } else if (searchResult.rooms) {
      rooms = searchResult.rooms;
    }

    const room = rooms.find((r: any) => r.roomId === selectedRoomId);
    return room?.ratePlans?.find((rp: any) => rp.ratePlanId === selectedRatePlanId) || null;
  }, [searchResult, selectedRoomId, selectedRatePlanId]);

  // Calculer le prix avec les ajouts
  const nights = searchParams?.nights || 0;
  const ratePlanPrices = selectedRatePlan?.prices || null;
  const priceBreakdown = useExperience2Price(
    experienceId,
    null,
    currency,
    nights,
    ratePlanPrices
  );

  // Auto-sélectionner la première chambre/rate plan si disponible
  useEffect(() => {
    if (searchResult && !selectedRoomId) {
      // searchResult peut être soit { results: [...] } soit directement { rooms: [...] }
      let rooms: any[] = [];
      if (searchResult.results && searchResult.results.length > 0) {
        rooms = searchResult.results[0]?.rooms || [];
      } else if (searchResult.rooms) {
        rooms = searchResult.rooms;
      }

      if (rooms.length > 0) {
        const firstRoom = rooms[0];
        if (firstRoom.ratePlans?.length > 0) {
          const firstRatePlan = firstRoom.ratePlans[0];
          setSelectedRoomId(firstRoom.roomId);
          setSelectedRatePlanId(firstRatePlan.ratePlanId);
        }
      }
    }
  }, [searchResult, selectedRoomId]);

  // Reset selection when dates change
  useEffect(() => {
    setSelectedRoomId(null);
    setSelectedRatePlanId(null);
  }, [dateRange.from, dateRange.to]);

  const handleBook = () => {
    if (!dateRange.from || !dateRange.to || !selectedRoomId || !selectedRatePlanId) {
      return;
    }

    // TODO: Rediriger vers la page de réservation avec les données
    console.log('Réserver avec:', {
      experienceId,
      dates: dateRange,
      roomId: selectedRoomId,
      ratePlanId: selectedRatePlanId,
      guests: adults,
      priceBreakdown,
    });

    toast.info('Booking flow coming soon!');
  };

  const isReadyToBook =
    dateRange.from &&
    dateRange.to &&
    selectedRoomId &&
    selectedRatePlanId &&
    priceBreakdown;

  // Si pas de hyperguest_property_id
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
        {/* Sélection des dates */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            {t.dates}
          </div>
          <DateRangePicker
            value={dateRange}
            onChange={(range) => setDateRange(range)}
          />
        </div>

        {/* Sélection du nombre de personnes */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4" />
            {t.guests}
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdults(Math.max(minParty, adults - 1))}
              disabled={adults <= minParty}
            >
              -
            </Button>
            <span className="text-lg font-medium w-8 text-center">{adults}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdults(Math.min(maxParty, adults + 1))}
              disabled={adults >= maxParty}
            >
              +
            </Button>
          </div>
        </div>

        <Separator />

        {/* Affichage des chambres disponibles */}
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

        {/* Breakdown de prix */}
        {searchParams && (
          <PriceBreakdownV2
            breakdown={priceBreakdown}
            isLoading={isLoadingAvailability}
            lang={lang}
          />
        )}

        {/* Message d'erreur */}
        {availabilityError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t.error}</AlertDescription>
          </Alert>
        )}

        {/* Bouton de réservation */}
        <Button
          className="w-full"
          size="lg"
          disabled={!isReadyToBook}
          onClick={handleBook}
        >
          {isReadyToBook
            ? `${t.book} - ${new Intl.NumberFormat(lang === 'he' ? 'he-IL' : 'en-US', { style: 'currency', currency: priceBreakdown?.currency || 'ILS' }).format(priceBreakdown?.total || 0)}`
            : t.selectDates}
        </Button>

        {/* Note */}
        <p className="text-xs text-muted-foreground text-center">
          {t.note}
        </p>
      </CardContent>
    </Card>
  );
}
