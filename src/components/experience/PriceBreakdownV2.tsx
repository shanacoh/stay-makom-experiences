// =============================================================================
// src/components/experience/PriceBreakdownV2.tsx
// Affichage du détail prix V3 — Addons-only model
// =============================================================================

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Hotel, Percent, Receipt, Tag, DollarSign } from "lucide-react";
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
    experiencePricing: "Experience pricing",
    subtotalPricing: "Subtotal extras",
    commissions: "Commissions",
    subtotalBeforeTax: "Subtotal before tax",
    tax: "Tax",
    taxExemptNote: "Room tax exempt for foreign visitors",
    promo: "Promo",
    discount: "Discount",
    originalPrice: "Original price",
    total: "TOTAL",
    nights: "nights",
    travelers: "travelers",
    noData: "Select a room and rate plan to see the price breakdown.",
  },
  he: {
    title: "פירוט מחיר",
    room: "חדר (HyperGuest)",
    roomPrice: "מחיר חדר",
    experiencePricing: "מחיר חוויה",
    subtotalPricing: 'סה"כ תוספות',
    commissions: "עמלות",
    subtotalBeforeTax: 'סה"כ לפני מס',
    tax: "מס",
    taxExemptNote: "חדר פטור ממס לתיירים זרים",
    promo: "מבצע",
    discount: "הנחה",
    originalPrice: "מחיר מקורי",
    total: 'סה"כ',
    nights: "לילות",
    travelers: "מטיילים",
    noData: "בחר חדר ותכנית תעריף כדי לראות פירוט מחירים.",
  },
  fr: {
    title: "Détail du prix",
    room: "Chambre (HyperGuest)",
    roomPrice: "Prix chambre",
    experiencePricing: "Tarification expérience",
    subtotalPricing: "Sous-total extras",
    commissions: "Commissions",
    subtotalBeforeTax: "Sous-total avant taxe",
    tax: "Taxe",
    taxExemptNote: "Chambre exonérée de taxe pour visiteurs étrangers",
    promo: "Promo",
    discount: "Remise",
    originalPrice: "Prix original",
    total: "TOTAL",
    nights: "nuits",
    travelers: "voyageurs",
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
  const hasPricingAddons = b.pricingAddonLines.length > 0;
  const hasCommissions = b.totalCommissions > 0;
  
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

        {/* ─── Layer 2: Experience Pricing Addons ─── */}
        {hasPricingAddons && (
          <>
            <Separator />
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                {t.experiencePricing}
              </div>
              {b.pricingAddonLines.map((line, i) => (
                <div key={i} className="flex justify-between text-sm pl-5">
                  <span className="text-muted-foreground">
                    {line.name}{" "}
                    <span className="text-xs">
                      ({fmt(line.unitPrice, b.currency)} {line.description})
                    </span>
                  </span>
                  <span>{fmt(line.total, b.currency)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm pl-5 font-medium pt-1">
                <span>{t.subtotalPricing}</span>
                <span>{fmt(b.totalPricingAddons, b.currency)}</span>
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
              {b.commissionLines.map((comm, i) => (
                <div key={i} className="flex justify-between text-sm pl-5">
                  <span className="text-muted-foreground">
                    {comm.name}{" "}
                    <span className="text-xs">
                      ({comm.isPercentage ? `${comm.value}%` : fmt(comm.value, b.currency)})
                    </span>
                  </span>
                  <span>{fmt(comm.total, b.currency)}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ─── Subtotal ─── */}
        <Separator />
        <div className="flex justify-between text-sm font-medium">
          <span>{t.subtotalBeforeTax}</span>
          <span>{fmt(b.subtotalBeforeTax, b.currency)}</span>
        </div>

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
