/**
 * Détail du prix : Prix HyperGuest + addons (commissions/taxes) = Total
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { PriceBreakdown } from "@/hooks/useExperience2Price";

interface PriceBreakdownV2Props {
  breakdown: PriceBreakdown | null;
  isLoading?: boolean;
  className?: string;
  lang?: "en" | "he" | "fr";
}

export function PriceBreakdownV2({ breakdown, isLoading = false, className = "", lang = "en" }: PriceBreakdownV2Props) {
  const t = {
    en: {
      title: "Price breakdown",
      calculating: "Calculating price...",
      selectDates: "Select dates to see the price",
      hyperguestPrice: "HyperGuest price",
      yourAddons: "Your addons",
      noAddons: "No addons configured",
      commission: "Commission",
      perNight: "per night",
      tax: "Tax",
      subtotal: "Subtotal (HyperGuest + addons)",
      total: "Total (with addons)",
      nightsLabel: (n: number) => `Price for ${n} night${n > 1 ? "s" : ""}`,
    },
    he: {
      title: "פירוט מחיר",
      calculating: "מחשב מחיר...",
      selectDates: "בחר תאריכים לצפייה במחיר",
      hyperguestPrice: "מחיר HyperGuest",
      yourAddons: "התוספות שלך",
      noAddons: "אין תוספות מוגדרות",
      commission: "עמלה",
      perNight: "ללילה",
      tax: "מס",
      subtotal: "סכום ביניים (HyperGuest + תוספות)",
      total: 'סה"כ (עם תוספות)',
      nightsLabel: (n: number) => `מחיר ל-${n} לילות`,
    },
    fr: {
      title: "Détail du prix",
      calculating: "Calcul du prix en cours...",
      selectDates: "Sélectionnez des dates pour voir le prix",
      hyperguestPrice: "Prix HyperGuest",
      yourAddons: "Vos addons",
      noAddons: "Aucun addon configuré",
      commission: "Commission",
      perNight: "par nuit",
      tax: "Taxe",
      subtotal: "Sous-total (HyperGuest + addons)",
      total: "Total (avec addons)",
      nightsLabel: (n: number) => `Prix pour ${n} nuit${n > 1 ? "s" : ""}`,
    },
  }[lang];

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(lang === "he" ? "he-IL" : lang === "fr" ? "fr-FR" : "en-US", {
      style: "currency",
      currency: breakdown!.currency,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-full" />
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">{t.calculating}</p>
        </CardContent>
      </Card>
    );
  }

  if (!breakdown) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">{t.selectDates}</p>
        </CardContent>
      </Card>
    );
  }

  const hasAddons = breakdown.commissions.length > 0 || breakdown.taxes.length > 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground font-medium">{t.hyperguestPrice}</span>
          <span>{formatPrice(breakdown.basePrice)}</span>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{t.yourAddons}</p>
          {!hasAddons ? (
            <p className="text-xs text-muted-foreground italic">{t.noAddons}</p>
          ) : (
            <>
              {breakdown.commissions.map((commission, index) => (
                <div key={`comm-${index}`} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {commission.name}
                    {commission.type === "per_night" && ` × ${breakdown.nights} ${t.perNight}`}
                  </span>
                  <span className="text-muted-foreground">+{formatPrice(commission.amount)}</span>
                </div>
              ))}
              {breakdown.taxes.map((tax, index) => (
                <div key={`tax-${index}`} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{tax.name}</span>
                  <span className="text-muted-foreground">+{formatPrice(tax.amount)}</span>
                </div>
              ))}
            </>
          )}
        </div>

        {hasAddons && (
          <div className="flex justify-between text-sm font-medium">
            <span>{t.subtotal}</span>
            <span>{formatPrice(breakdown.subtotal)}</span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between items-center pt-1">
          <span className="font-semibold">{t.total}</span>
          <span className="text-lg font-bold">{formatPrice(breakdown.total)}</span>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">{t.nightsLabel(breakdown.nights)}</p>
      </CardContent>
    </Card>
  );
}
