/**
 * Composant pour afficher et sélectionner les chambres HyperGuest
 * API HyperGuest : prices.sell / prices.net utilisent "price" (pas "amount")
 * ✅ V4 FIX: Affichage des remarks par rate plan
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Check, Info } from "lucide-react";
import { getBoardTypeLabel } from "@/services/hyperguest";
import { cn } from "@/lib/utils";

interface CancellationPolicy {
  type?: string;
  description?: string;
  deadline?: string;
  penaltyAmount?: number;
  penaltyCurrency?: string;
  penaltyNights?: number;
}

interface RoomRatePlan {
  ratePlanId: number;
  ratePlanName: string;
  board: string;
  remarks?: string[];
  prices?: {
    sell?: { price?: number; amount?: number; currency?: string };
    net?: { price?: number; amount?: number; currency?: string };
  };
  cancellationPolicy?: CancellationPolicy;
  cancellationPolicies?: CancellationPolicy[];
}

interface Room {
  roomId: number;
  roomName: string;
  ratePlans: RoomRatePlan[];
  remarks?: string[]; // ✅ V4 FIX
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
}

export function RoomOptionsV2({
  searchResult,
  isLoading,
  selectedRoomId,
  selectedRatePlanId,
  onSelect,
  lang = "en",
}: RoomOptionsV2Props) {
  const t = {
    en: {
      title: "Available rooms",
      noRooms: "No rooms available for these dates",
      adults: "adult(s)",
      children: "child(ren)",
      freeCancellation: "Free cancellation",
      cancellationTerms: "Cancellation terms apply",
      totalStay: "Total for stay",
    },
    he: {
      title: "חדרים זמינים",
      noRooms: "אין חדרים זמינים לתאריכים אלה",
      adults: "מבוגרים",
      children: "ילדים",
      freeCancellation: "ביטול חינם",
      cancellationTerms: "תנאי ביטול",
      totalStay: 'סה"כ לשהייה',
    },
    fr: {
      title: "Chambres disponibles",
      noRooms: "Aucune chambre disponible pour ces dates",
      adults: "adulte(s)",
      children: "enfant(s)",
      freeCancellation: "Annulation gratuite",
      cancellationTerms: "Conditions d'annulation",
      totalStay: "Total du séjour",
    },
  }[lang];

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  let rooms: Room[] = [];
  if (searchResult?.results && searchResult.results.length > 0) {
    rooms = searchResult.results[0]?.rooms || [];
  } else if (searchResult?.rooms) {
    rooms = searchResult.rooms;
  }

  if (rooms.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">{t.noRooms}</p>
        </CardContent>
      </Card>
    );
  }

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat(lang === "he" ? "he-IL" : lang === "fr" ? "fr-FR" : "en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-base">{t.title}</h3>

      <RadioGroup
        value={selectedRoomId != null && selectedRatePlanId != null ? `${selectedRoomId}-${selectedRatePlanId}` : ""}
        onValueChange={(value) => {
          if (!value) return;
          const [roomId, ratePlanId] = value.split("-").map(Number);
          onSelect(roomId, ratePlanId);
        }}
        className="space-y-3"
      >
        {rooms.map((room) => (
          <Card key={room.roomId} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{room.roomName}</CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>
                  {room.settings?.maxAdultsNumber || 2} {t.adults}
                </span>
                {(room.settings?.maxChildrenNumber || 0) > 0 && (
                  <>
                    <span>•</span>
                    <span>
                      {room.settings?.maxChildrenNumber} {t.children}
                    </span>
                  </>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-2 pt-0">
              {room.ratePlans.map((ratePlan) => {
                const priceObj = ratePlan.prices?.sell || ratePlan.prices?.net;
                const amount = priceObj != null ? Number(priceObj.price ?? priceObj.amount) || 0 : 0;
                const currency = priceObj?.currency ?? "ILS";
                const isSelected = selectedRoomId === room.roomId && selectedRatePlanId === ratePlan.ratePlanId;

                return (
                  <div key={ratePlan.ratePlanId} className="space-y-1">
                    <Label
                      htmlFor={`${room.roomId}-${ratePlan.ratePlanId}`}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem
                          value={`${room.roomId}-${ratePlan.ratePlanId}`}
                          id={`${room.roomId}-${ratePlan.ratePlanId}`}
                        />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{ratePlan.ratePlanName}</p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {getBoardTypeLabel(ratePlan.board)}
                            </Badge>
                            {ratePlan.cancellationPolicy?.type === "FREE_CANCELLATION" && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                                <Check className="h-3 w-3 mr-1" />
                                {t.freeCancellation}
                              </Badge>
                            )}
                            {ratePlan.cancellationPolicy?.type && ratePlan.cancellationPolicy.type !== "FREE_CANCELLATION" && (
                              <Badge variant="outline" className="text-xs">
                                {t.cancellationTerms}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">{amount > 0 ? formatPrice(amount, currency) : "N/A"}</p>
                        {priceObj && <p className="text-xs text-muted-foreground">{t.totalStay}</p>}
                      </div>
                    </Label>

                    {/* ✅ V4 FIX: Display rate plan remarks */}
                    {ratePlan.remarks && ratePlan.remarks.filter(r => !/general message that should be shown/i.test(r)).length > 0 && (
                      <div className="ml-8 space-y-1 px-3 py-2 rounded-md bg-muted/50 border border-border">
                        {ratePlan.remarks.filter(r => !/general message that should be shown/i.test(r)).map((remark, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Info className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                            <p className="text-xs text-muted-foreground leading-relaxed">{remark}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Cancellation policy details */}
                    {ratePlan.cancellationPolicies && ratePlan.cancellationPolicies.length > 0 && (
                      <div className="ml-8 space-y-1 px-3 py-2 rounded-md bg-muted/30 border border-border text-xs">
                        {ratePlan.cancellationPolicies.map((cp, idx) => (
                          <div key={idx} className="text-muted-foreground">
                            {cp.deadline && <span>Deadline: {new Date(cp.deadline).toLocaleDateString()} · </span>}
                            {cp.penaltyAmount != null && <span>Penalty: {cp.penaltyAmount} {cp.penaltyCurrency || ''} · </span>}
                            {cp.penaltyNights != null && <span>{cp.penaltyNights} night(s) penalty · </span>}
                            {cp.description && <span>{cp.description}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </RadioGroup>
    </div>
  );
}
