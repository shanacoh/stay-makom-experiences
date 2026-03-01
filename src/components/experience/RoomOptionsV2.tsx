/**
 * Room selection component — filter chips for room types + rate plans for selected room
 * Matches the visual style of the nights selector tabs in BookingPanel2
 * ✅ #1: BAR price check — never display sell < BAR
 * ✅ #3a: isImmediate badge for on-request rate plans
 * ✅ #6: No fallback to net price
 */

import { useState, useEffect, useMemo } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Info, BedDouble, X, AlertTriangle, Clock } from "lucide-react";
import { getBoardTypeLabel } from "@/services/hyperguest";
import { cn } from "@/lib/utils";
import { analyzeCancellationPolicies } from "@/utils/cancellationPolicy";
import { extractTaxBreakdown, formatTaxAmount } from "@/utils/taxesDisplay";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface RoomRatePlan {
  ratePlanId: number;
  ratePlanName: string;
  board: string;
  remarks?: string[];
  isImmediate?: boolean;
  prices?: {
    sell?: { price?: number; amount?: number; currency?: string; taxes?: any[] };
    net?: { price?: number; amount?: number; currency?: string };
    bar?: { price?: number; amount?: number; currency?: string };
    fees?: any[];
  };
  cancellationPolicies?: any[];
}

interface Room {
  roomId: number;
  roomName: string;
  ratePlans: RoomRatePlan[];
  remarks?: string[];
  settings?: { maxAdultsNumber?: number; maxChildrenNumber?: number };
}

interface Property {
  rooms: Room[];
}

interface SearchResult {
  results?: Property[];
  rooms?: Room[];
}

interface RoomOptionsV2Props {
  searchResult: SearchResult | null;
  isLoading: boolean;
  selectedRoomId: number | null;
  selectedRatePlanId: number | null;
  onSelect: (roomId: number, ratePlanId: number) => void;
  lang?: "en" | "he" | "fr";
  checkInDate?: string;
}

const filterGenericRemarks = (remarks: string[]) =>
  remarks.filter((r) => !/general message that should be shown/i.test(r));

/**
 * ✅ #1 BAR check: returns true if rate plan should be hidden
 * ✅ #6: returns true if no sell price
 */
function shouldHideRatePlan(ratePlan: RoomRatePlan): boolean {
  const sellPrice = ratePlan.prices?.sell;
  if (!sellPrice) return true; // #6: no sell → hide

  const sellAmount = Number(sellPrice.price ?? sellPrice.amount) || 0;
  if (sellAmount <= 0) return true;

  // #1 BAR check
  const barPrice = ratePlan.prices?.bar;
  if (barPrice) {
    const barAmount = Number(barPrice.price ?? barPrice.amount) || 0;
    if (barAmount > 0 && sellAmount < barAmount) return true;
  }

  return false;
}

export function RoomOptionsV2({
  searchResult,
  isLoading,
  selectedRoomId,
  selectedRatePlanId,
  onSelect,
  lang = "en",
  checkInDate,
}: RoomOptionsV2Props) {
  const t = {
    en: {
      title: "Room type",
      noRooms: "No rooms available for these dates",
      noRates: "No available rates for this room",
      totalStay: "Total for stay",
      seeDetails: "See details",
      onRequest: "Subject to confirmation",
      taxesAtHotel: "taxes at hotel",
    },
    he: {
      title: "סוג חדר",
      noRooms: "אין חדרים זמינים לתאריכים אלה",
      noRates: "אין תעריפים זמינים לחדר זה",
      totalStay: 'סה"כ לשהייה',
      seeDetails: "פרטים",
      onRequest: "בכפוף לאישור",
      taxesAtHotel: "מסים במלון",
    },
    fr: {
      title: "Type de chambre",
      noRooms: "Aucune chambre disponible pour ces dates",
      noRates: "Aucun tarif disponible pour cette chambre",
      totalStay: "Total du séjour",
      seeDetails: "Voir détails",
      onRequest: "Confirmation sous réserve",
      taxesAtHotel: "taxes à l'hôtel",
    },
  }[lang];

  // Extract rooms from search result
  const rooms: Room[] = useMemo(() => {
    if (!searchResult) return [];
    if (searchResult.results && searchResult.results.length > 0) {
      return searchResult.results[0]?.rooms || [];
    }
    if (searchResult.rooms) return searchResult.rooms;
    return [];
  }, [searchResult]);

  // Track which room tab is active (by roomId)
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);

  // Auto-select first room tab when rooms change
  useEffect(() => {
    if (rooms.length > 0 && (activeRoomId === null || !rooms.find((r) => r.roomId === activeRoomId))) {
      setActiveRoomId(rooms[0].roomId);
    }
  }, [rooms, activeRoomId]);

  const activeRoom = rooms.find((r) => r.roomId === activeRoomId) ?? null;

  // Filter visible rate plans for active room
  const visibleRatePlans = useMemo(() => {
    if (!activeRoom) return [];
    return activeRoom.ratePlans.filter(rp => !shouldHideRatePlan(rp));
  }, [activeRoom]);

  const formatPrice = (amount: number, currency: string) =>
    new Intl.NumberFormat(lang === "he" ? "he-IL" : lang === "fr" ? "fr-FR" : "en-US", {
      style: "currency",
      currency,
    }).format(amount);

  // Get cheapest price for a room (for display on chip) — sell only
  const getCheapestPrice = (room: Room) => {
    let cheapest: { amount: number; currency: string } | null = null;
    for (const rp of room.ratePlans) {
      if (shouldHideRatePlan(rp)) continue;
      const priceObj = rp.prices?.sell;
      if (!priceObj) continue;
      const amount = Number(priceObj.price ?? priceObj.amount) || 0;
      const currency = priceObj.currency ?? "ILS";
      if (amount > 0 && (!cheapest || amount < cheapest.amount)) {
        cheapest = { amount, currency };
      }
    }
    return cheapest;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-24" />
        <div className="flex gap-1.5">
          <Skeleton className="h-14 flex-1 rounded-lg" />
          <Skeleton className="h-14 flex-1 rounded-lg" />
        </div>
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">{t.noRooms}</p>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Section title */}
        <div className="flex items-center gap-2 text-sm font-medium">
          <BedDouble className="h-4 w-4" />
          {t.title}
        </div>

        {/* Room type chips — same style as nights tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {rooms.map((room) => {
            const cheapest = getCheapestPrice(room);
            const isActive = activeRoomId === room.roomId;

            return (
              <button
                key={room.roomId}
                type="button"
                onClick={() => setActiveRoomId(room.roomId)}
                className={cn(
                  "flex-1 min-w-0 px-2 py-2 rounded-lg border-2 transition-all text-center",
                  "hover:border-primary/50",
                  isActive
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-border"
                )}
              >
                <p className="text-xs font-medium truncate">{room.roomName}</p>
                {cheapest && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatPrice(cheapest.amount, cheapest.currency)}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* Rate plans for selected room */}
        {activeRoom && visibleRatePlans.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">{t.noRates}</p>
        )}

        {activeRoom && visibleRatePlans.length > 0 && (
          <RadioGroup
            value={selectedRoomId === activeRoom.roomId && selectedRatePlanId != null
              ? `${activeRoom.roomId}-${selectedRatePlanId}`
              : ""}
            onValueChange={(value) => {
              if (!value) return;
              const [roomId, ratePlanId] = value.split("-").map(Number);
              onSelect(roomId, ratePlanId);
            }}
            className="space-y-1.5"
          >
            {visibleRatePlans.map((ratePlan) => {
              // ✅ #6: Only use sell price
              const priceObj = ratePlan.prices?.sell!;
              const amount = Number(priceObj.price ?? priceObj.amount) || 0;
              const currency = priceObj.currency ?? "ILS";
              const isSelected = selectedRoomId === activeRoom.roomId && selectedRatePlanId === ratePlan.ratePlanId;
              const filteredRemarks = filterGenericRemarks(ratePlan.remarks || []);

              // ✅ #2b: Display taxes under price
              const taxBreakdown = extractTaxBreakdown(ratePlan);

              // ✅ #3a: isImmediate badge
              const isOnRequest = ratePlan.isImmediate === false;

              // Dynamic cancellation badge
              const cancellation = analyzeCancellationPolicies(
                ratePlan.cancellationPolicies,
                checkInDate,
                lang,
              );

              return (
                <div key={ratePlan.ratePlanId} className="space-y-1">
                  <label
                    htmlFor={`${activeRoom.roomId}-${ratePlan.ratePlanId}`}
                    className={cn(
                      "flex items-start justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                      isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                    )}
                  >
                    {/* Left: radio + name + board type + on-request badge */}
                    <div className="flex items-start gap-3">
                      <RadioGroupItem
                        value={`${activeRoom.roomId}-${ratePlan.ratePlanId}`}
                        id={`${activeRoom.roomId}-${ratePlan.ratePlanId}`}
                        className="mt-0.5"
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{ratePlan.ratePlanName}</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {getBoardTypeLabel(ratePlan.board)}
                          </Badge>
                          {isOnRequest && (
                            <Badge variant="outline" className="text-xs text-blue-600 border-blue-300 bg-blue-50">
                              <Clock className="h-3 w-3 mr-1" />
                              {t.onRequest}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: price + taxes + cancellation badge below */}
                    <div className="text-right shrink-0 space-y-1.5">
                      <div>
                        <p className="font-semibold">{formatPrice(amount, currency)}</p>
                        <p className="text-xs text-muted-foreground">{t.totalStay}</p>
                        {/* ✅ #2b: Display taxes at hotel */}
                        {taxBreakdown.totalDisplayAmount > 0 && (
                          <p className="text-[10px] text-orange-600">
                            + {formatTaxAmount(taxBreakdown.totalDisplayAmount, taxBreakdown.currency)} {t.taxesAtHotel}
                          </p>
                        )}
                      </div>

                      {/* Cancellation badge — right-aligned under price */}
                      {cancellation.badgeText && (
                        <CancellationBadge cancellation={cancellation} lang={lang} seeDetailsLabel={t.seeDetails} />
                      )}
                    </div>
                  </label>

                  {/* Rate plan remarks */}
                  {filteredRemarks.length > 0 && (
                    <div className="ml-8 space-y-1 px-3 py-2 rounded-md bg-muted/50 border border-border">
                      {filteredRemarks.map((remark, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Info className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="text-xs text-muted-foreground leading-relaxed">{remark}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </RadioGroup>
        )}
      </div>
    </>
  );
}

/** Cancellation badge sub-component — renders right-aligned under price */
function CancellationBadge({
  cancellation,
  lang,
  seeDetailsLabel,
}: {
  cancellation: ReturnType<typeof analyzeCancellationPolicies>;
  lang: string;
  seeDetailsLabel: string;
}) {
  if (cancellation.isNonRefundable) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-destructive">
        <X className="h-3 w-3" />
        {cancellation.badgeText}
      </span>
    );
  }

  if (cancellation.isFreeCancellation) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600">
        <Check className="h-3 w-3" />
        {cancellation.badgeText}
      </span>
    );
  }

  // Intermediate case: short badge + tooltip/popover for details
  if (cancellation.detailLines.length > 0) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-orange-600 hover:underline cursor-pointer text-right"
          >
            <AlertTriangle className="h-3 w-3 shrink-0" />
            <span>{cancellation.badgeText}</span>
            <Info className="h-3 w-3 shrink-0 opacity-60" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          className="w-64 p-3"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-xs font-medium mb-2 text-foreground">
            {lang === "he" ? "תנאי ביטול" : lang === "fr" ? "Conditions d'annulation" : "Cancellation terms"}
          </p>
          <ul className="space-y-1">
            {cancellation.detailLines.map((line, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                • {line}
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    );
  }

  // Fallback: simple text
  return (
    <span className="inline-flex items-center gap-1 text-xs text-orange-600">
      <AlertTriangle className="h-3 w-3" />
      {cancellation.badgeText}
    </span>
  );
}
