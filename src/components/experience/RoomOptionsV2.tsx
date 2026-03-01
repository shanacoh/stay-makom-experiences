/**
 * Room selection component — filter chips for room types + rate plans for selected room
 * Matches the visual style of the nights selector tabs in BookingPanel2
 */

import { useState, useEffect, useMemo } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Info, BedDouble, X, AlertTriangle } from "lucide-react";
import { getBoardTypeLabel } from "@/services/hyperguest";
import { cn } from "@/lib/utils";
import { analyzeCancellationPolicies } from "@/utils/cancellationPolicy";
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
  prices?: {
    sell?: { price?: number; amount?: number; currency?: string };
    net?: { price?: number; amount?: number; currency?: string };
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
      totalStay: "Total for stay",
      seeDetails: "See details",
    },
    he: {
      title: "סוג חדר",
      noRooms: "אין חדרים זמינים לתאריכים אלה",
      totalStay: 'סה"כ לשהייה',
      seeDetails: "פרטים",
    },
    fr: {
      title: "Type de chambre",
      noRooms: "Aucune chambre disponible pour ces dates",
      totalStay: "Total du séjour",
      seeDetails: "Voir détails",
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

  const formatPrice = (amount: number, currency: string) =>
    new Intl.NumberFormat(lang === "he" ? "he-IL" : lang === "fr" ? "fr-FR" : "en-US", {
      style: "currency",
      currency,
    }).format(amount);

  // Get cheapest price for a room (for display on chip)
  const getCheapestPrice = (room: Room) => {
    let cheapest: { amount: number; currency: string } | null = null;
    for (const rp of room.ratePlans) {
      const priceObj = rp.prices?.sell || rp.prices?.net;
      const amount = priceObj != null ? Number(priceObj.price ?? priceObj.amount) || 0 : 0;
      const currency = priceObj?.currency ?? "ILS";
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
        {activeRoom && (
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
            {activeRoom.ratePlans.map((ratePlan) => {
              const priceObj = ratePlan.prices?.sell || ratePlan.prices?.net;
              const amount = priceObj != null ? Number(priceObj.price ?? priceObj.amount) || 0 : 0;
              const currency = priceObj?.currency ?? "ILS";
              const isSelected = selectedRoomId === activeRoom.roomId && selectedRatePlanId === ratePlan.ratePlanId;
              const filteredRemarks = filterGenericRemarks(ratePlan.remarks || []);

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
                    {/* Left: radio + name + board type */}
                    <div className="flex items-start gap-3">
                      <RadioGroupItem
                        value={`${activeRoom.roomId}-${ratePlan.ratePlanId}`}
                        id={`${activeRoom.roomId}-${ratePlan.ratePlanId}`}
                        className="mt-0.5"
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{ratePlan.ratePlanName}</p>
                        <Badge variant="secondary" className="text-xs">
                          {getBoardTypeLabel(ratePlan.board)}
                        </Badge>
                      </div>
                    </div>

                    {/* Right: price + cancellation badge below */}
                    <div className="text-right shrink-0 space-y-1.5">
                      <div>
                        <p className="font-semibold">{amount > 0 ? formatPrice(amount, currency) : "N/A"}</p>
                        {priceObj && <p className="text-xs text-muted-foreground">{t.totalStay}</p>}
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
