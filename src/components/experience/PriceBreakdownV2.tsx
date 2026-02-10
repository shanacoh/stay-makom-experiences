// =============================================================================
// src/components/experience/PriceBreakdownV2.tsx
// Affichage du détail prix V2 — 6 couches
// =============================================================================

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Hotel, Users, Percent, Receipt, Tag } from "lucide-react";
import type { PriceBreakdownV2 as PriceBreakdownType } from "@/types/experience2_addons";

interface PriceBreakdownV2Props {
  breakdown: PriceBreakdownType | null;
  isLoading?: boolean;
  className?: string;
  lang?: "en" | "he" | "fr";
}

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------

const translations = {
  en: {
    title: "Price Breakdown",
    room: "Room (HyperGuest)",
    roomPrice: "Room price",
    addonsTitle: "Experience addons",
    travelers: "travelers",
    perPerson: "/ person",
    subtotalAddons: "Subtotal addons",
    commissions: "Commissions",
    commRoom: "Room commission",
    commAddons: "Addons commission",
    subtotalBeforeTax: "Subtotal before tax",
    tax: "Tax",
    promo: "Promo",
    discount: "Discount",
    originalPrice: "Original price",
    total: "TOTAL",
    nights: "nights",
    noData: "Select a room and rate plan to see the price breakdown.",
  },
  he: {
    title: "פירוט מחיר",
    room: "חדר (HyperGuest)",
    roomPrice: "מחיר חדר",
    addonsTitle: "תוספות חוויה",
    travelers: "מטיילים",
    perPerson: "/ אדם",
    subtotalAddons: 'סה"כ תוספות',
    commissions: "עמלות",
    commRoom: "עמלת חדר",
    commAddons: "עמלת תוספות",
    subtotalBeforeTax: 'סה"כ לפני מס',
    tax: "מס",
    promo: "מבצע",
    discount: "הנחה",
    originalPrice: "מחיר מקורי",
    total: 'סה"כ',
    nights: "לילות",
    noData: "בחר חדר ותכנית תעריף כדי לראות פירוט מחירים.",
  },
  fr: {
    title: "Détail du prix",
    room: "Chambre (HyperGuest)",
    roomPrice: "Prix chambre",
    addonsTitle: "Addons expérience",
    travelers: "voyageurs",
    perPerson: "/ pers.",
    subtotalAddons: "Sous-total addons",
    commissions: "Commissions",
    commRoom: "Commission chambre",
    commAddons: "Commission addons",
    subtotalBeforeTax: "Sous-total avant taxe",
    tax: "Taxe",
    promo: "Promo",
    discount: "Remise",
    originalPrice: "Prix original",
    total: "TOTAL",
    nights: "nuits",
    noData: "Sélectionnez une chambre et un plan tarifaire pour voir le détail du prix.",
  },
};

// ---------------------------------------------------------------------------
// Format currency
// ---------------------------------------------------------------------------

function fmt(amount: number, currency: string): string {
  const symbol = currency === "ILS" ? "₪" : currency === "EUR" ? "€" : currency === "USD" ? "$" : currency;
  return `${symbol}${amount.toLocaleString("en-IL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PriceBreakdownV2({ breakdown, isLoading = false, className = "", lang = "en" }: PriceBreakdownV2Props) {
  const t = translations[lang];

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!breakdown) {
    return (
      <Card className={className}>
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground italic">{t.noData}</p>
        </CardContent>
      </Card>
    );
  }

  const b = breakdown;
  const hasAddons = b.perPersonAddons.length > 0;
  const hasCommissions = b.totalCommissions > 0;
  const hasTax = b.taxAmount > 0;
  const hasPromo = b.promo.type !== null;
  const hasDiscount = b.promo.discountAmount > 0;
  const hasFakeMarkup = b.promo.type === "fake_markup" && b.promo.fakeOriginalPrice != null;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          {t.title}
          <Badge variant="outline" className="ml-auto text-xs">
            {b.nights} {t.nights} · {b.guests} {t.travelers}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* ─── Layer 1: Room ─── */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Hotel className="h-3.5 w-3.5 text-blue-600" />
            {t.room}
          </div>
          <div className="flex justify-between text-sm pl-5">
            <span className="text-muted-foreground">{t.roomPrice}</span>
            <span className="font-medium">{fmt(b.roomPrice, b.currency)}</span>
          </div>
        </div>

        {/* ─── Layer 2: Per-person addons ─── */}
        {hasAddons && (
          <>
            <Separator />
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-3.5 w-3.5 text-emerald-600" />
                {t.addonsTitle}
                <span className="text-xs text-muted-foreground">
                  ({b.guests} {t.travelers})
                </span>
              </div>
              {b.perPersonAddons.map((addon, i) => (
                <div key={i} className="flex justify-between text-sm pl-5">
                  <span className="text-muted-foreground">
                    {addon.name}{" "}
                    <span className="text-xs">
                      ({fmt(addon.pricePerPerson, b.currency)} {t.perPerson} × {addon.guests})
                    </span>
                  </span>
                  <span>{fmt(addon.total, b.currency)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm pl-5 font-medium pt-1">
                <span>{t.subtotalAddons}</span>
                <span>{fmt(b.totalAddons, b.currency)}</span>
              </div>
            </div>
          </>
        )}

        {/* ─── Layer 3: Commissions ─── */}
        {hasCommissions && (
          <>
            <Separator />
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Percent className="h-3.5 w-3.5 text-orange-600" />
                {t.commissions}
              </div>
              {b.commissionRoomAmount > 0 && (
                <div className="flex justify-between text-sm pl-5">
                  <span className="text-muted-foreground">
                    {t.commRoom} ({b.commissionRoomPct}%)
                  </span>
                  <span>{fmt(b.commissionRoomAmount, b.currency)}</span>
                </div>
              )}
              {b.commissionAddonsAmount > 0 && (
                <div className="flex justify-between text-sm pl-5">
                  <span className="text-muted-foreground">
                    {t.commAddons} ({b.commissionAddonsPct}%)
                  </span>
                  <span>{fmt(b.commissionAddonsAmount, b.currency)}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── Subtotal before tax ─── */}
        <Separator />
        <div className="flex justify-between text-sm font-medium">
          <span>{t.subtotalBeforeTax}</span>
          <span>{fmt(b.subtotalBeforeTax, b.currency)}</span>
        </div>

        {/* ─── Layer 4: Taxes ─── */}
        {hasTax && (
          <div className="flex justify-between text-sm pl-2">
            <span className="text-muted-foreground">
              {t.tax} ({b.taxPct}%)
            </span>
            <span>{fmt(b.taxAmount, b.currency)}</span>
          </div>
        )}

        {/* ─── Layer 5: Promo ─── */}
        {hasPromo && (
          <>
            <Separator />
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Tag className="h-3.5 w-3.5 text-purple-600" />
                {t.promo}
              </div>
              {hasDiscount && (
                <div className="flex justify-between text-sm pl-5 text-green-600">
                  <span>
                    {t.discount}
                    {b.promo.isPercentage ? ` (-${b.promo.value}%)` : ` (-${fmt(b.promo.value ?? 0, b.currency)})`}
                  </span>
                  <span>-{fmt(b.promo.discountAmount, b.currency)}</span>
                </div>
              )}
              {hasFakeMarkup && (
                <div className="flex justify-between text-sm pl-5">
                  <span className="text-muted-foreground">{t.originalPrice}</span>
                  <span className="line-through text-muted-foreground">
                    {fmt(b.promo.fakeOriginalPrice!, b.currency)}
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── TOTAL ─── */}
        <Separator className="border-primary/30" />
        <div className="flex justify-between items-center text-base font-bold">
          <span>{t.total}</span>
          <div className="flex items-center gap-2">
            {hasFakeMarkup && (
              <span className="text-sm font-normal line-through text-muted-foreground">
                {fmt(b.promo.fakeOriginalPrice!, b.currency)}
              </span>
            )}
            <span className="text-primary text-lg">{fmt(b.finalTotal, b.currency)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
