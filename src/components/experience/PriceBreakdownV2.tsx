/**
 * Composant pour afficher le breakdown de prix
 * Affiche : Prix HyperGuest + Commissions + Taxes = Total
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import type { PriceBreakdown } from '@/hooks/useExperience2Price';

interface PriceBreakdownV2Props {
  breakdown: PriceBreakdown | null;
  isLoading?: boolean;
  className?: string;
  lang?: 'en' | 'he' | 'fr';
}

export function PriceBreakdownV2({
  breakdown,
  isLoading = false,
  className = '',
  lang = 'en',
}: PriceBreakdownV2Props) {
  const t = {
    en: {
      title: 'Price breakdown',
      calculating: 'Calculating price...',
      selectDates: 'Select dates to see the price',
      hotelPrice: 'Hotel price',
      subtotal: 'Subtotal',
      total: 'Total',
      nightsLabel: (n: number) => `Price for ${n} night${n > 1 ? 's' : ''}`,
    },
    he: {
      title: 'פירוט מחיר',
      calculating: 'מחשב מחיר...',
      selectDates: 'בחר תאריכים לצפייה במחיר',
      hotelPrice: 'מחיר המלון',
      subtotal: 'סכום ביניים',
      total: 'סה"כ',
      nightsLabel: (n: number) => `מחיר ל-${n} לילות`,
    },
    fr: {
      title: 'Détail du prix',
      calculating: 'Calcul du prix en cours...',
      selectDates: 'Sélectionnez des dates pour voir le prix',
      hotelPrice: 'Prix de l\'hôtel',
      subtotal: 'Sous-total',
      total: 'Total',
      nightsLabel: (n: number) => `Prix pour ${n} nuit${n > 1 ? 's' : ''}`,
    },
  }[lang];

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-full" />
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            {t.calculating}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!breakdown) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            {t.selectDates}
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(lang === 'he' ? 'he-IL' : lang === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: breakdown.currency,
    }).format(amount);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Prix de base HyperGuest */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t.hotelPrice}</span>
          <span>{formatPrice(breakdown.basePrice)}</span>
        </div>

        {/* Commissions */}
        {breakdown.commissions.length > 0 && (
          <>
            <Separator />
            {breakdown.commissions.map((commission, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {commission.name}
                  {commission.type === 'per_night' && ` × ${breakdown.nights} night${breakdown.nights > 1 ? 's' : ''}`}
                </span>
                <span className="text-muted-foreground">
                  +{formatPrice(commission.amount)}
                </span>
              </div>
            ))}
          </>
        )}

        {/* Sous-total */}
        {breakdown.commissions.length > 0 && (
          <div className="flex justify-between text-sm font-medium">
            <span>{t.subtotal}</span>
            <span>{formatPrice(breakdown.subtotal)}</span>
          </div>
        )}

        {/* Taxes */}
        {breakdown.taxes.length > 0 && (
          <>
            <Separator />
            {breakdown.taxes.map((tax, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{tax.name}</span>
                <span className="text-muted-foreground">
                  +{formatPrice(tax.amount)}
                </span>
              </div>
            ))}
          </>
        )}

        {/* Total */}
        <Separator />
        <div className="flex justify-between items-center pt-1">
          <span className="font-semibold">{t.total}</span>
          <span className="text-lg font-bold">
            {formatPrice(breakdown.total)}
          </span>
        </div>

        {/* Note */}
        <p className="text-xs text-muted-foreground text-center pt-2">
          {t.nightsLabel(breakdown.nights)}
        </p>
      </CardContent>
    </Card>
  );
}
