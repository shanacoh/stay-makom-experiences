// =============================================================================
// src/components/experience/PriceBreakdownV2.tsx
// Affichage du détail prix V3 — Addons-only model
// ✅ #2a: HyperGuest display/included taxes
// =============================================================================

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Hotel, Percent, Receipt, Tag, DollarSign, AlertTriangle, Info } from "lucide-react";
import type { PriceBreakdownV2 as PriceBreakdownType } from "@/types/experience2_addons";
import { DualPrice } from "@/components/ui/DualPrice";

interface PriceBreakdownV2Props {
  breakdown: PriceBreakdownType | null;
  isLoading?: boolean;
  className?: string;
  lang?: "en" | "he" | "fr";
  /** Raw rate plan for extracting HyperGuest taxes */
  ratePlanPrices?: any;
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
    displayTaxes: "Taxes & fees payable at the hotel",
    includedTaxes: "Including taxes",
    notInTotal: "Not included in online total",
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
    displayTaxes: "מסים ועמלות לתשלום במלון",
    includedTaxes: "כולל מסים",
    notInTotal: "לא כלול בסה\"כ המקוון",
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
    displayTaxes: "Taxes et frais payés à l'hôtel",
    includedTaxes: "Dont taxes incluses",
    notInTotal: "Non inclus dans le total en ligne",
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

export function PriceBreakdownV2({ breakdown, isLoading = false, className = "", lang = "en", ratePlanPrices }: PriceBreakdownV2Props) {
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

  // ✅ #2a: Extract HyperGuest display/included taxes from ratePlanPrices
  const sellTaxes = ratePlanPrices?.sell?.taxes || [];
  const fees = ratePlanPrices?.fees || [];
  const displayItems = [...sellTaxes, ...fees].filter((t: any) => t.relation === 'display');
  const includedItems = [...sellTaxes, ...fees].filter((t: any) => t.relation === 'included');
  const totalDisplay = displayItems.reduce((s: number, t: any) => s + Number(t.amount || 0), 0);
  const totalIncluded = includedItems.reduce((s: number, t: any) => s + Number(t.amount || 0), 0);

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
            <DualPrice amount={b.roomPrice} currency={b.currency} inline className="font-medium text-sm" />
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
                  <DualPrice amount={line.total} currency={b.currency} inline className="text-sm" />
                </div>
              ))}
              <div className="flex justify-between text-sm pl-5 font-medium pt-1">
                <span>{t.subtotalPricing}</span>
                <DualPrice amount={b.totalPricingAddons} currency={b.currency} inline className="text-sm font-medium" />
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
                  <DualPrice amount={comm.total} currency={b.currency} inline className="text-sm" />
                </div>
              ))}
            </div>
          </>
        )}

        {/* ─── Subtotal ─── */}
        <Separator />
        <div className="flex justify-between text-sm font-medium">
          <span>{t.subtotalBeforeTax}</span>
          <DualPrice amount={b.subtotalBeforeTax} currency={b.currency} inline className="text-sm font-medium" />
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
            <DualPrice amount={b.finalTotal} currency={b.currency} className="text-primary text-lg items-end" />
          </div>
        </div>

        {/* ✅ #2a: Display taxes — payable at hotel */}
        {totalDisplay > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-orange-50 border border-orange-200 dark:bg-orange-950/30 dark:border-orange-800">
            <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
                {t.displayTaxes}: {fmt(totalDisplay, b.currency)}
              </p>
              <p className="text-xs text-orange-600/80 dark:text-orange-400/70">{t.notInTotal}</p>
            </div>
          </div>
        )}

        {/* ✅ #2a: Included taxes — informational */}
        {totalIncluded > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pl-1">
            <Info className="h-3 w-3" />
            <span>{t.includedTaxes}: {fmt(totalIncluded, b.currency)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
