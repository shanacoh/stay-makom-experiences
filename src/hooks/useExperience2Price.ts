/**
 * Hook pour calculer le prix final d'une expérience V2
 * Combine le prix HyperGuest + les ajouts (commissions/taxes)
 */

import { useMemo } from 'react';
import { useExperienceAddons } from './useExperience2Addons';
import type { ExperienceAddon } from '@/types/experience2_addons';

export interface PriceBreakdown {
  basePrice: number;           // Prix HyperGuest
  commissions: Array<{
    name: string;
    amount: number;
    type: 'commission' | 'per_night';
  }>;
  taxes: Array<{
    name: string;
    amount: number;
  }>;
  subtotal: number;            // Base + Commissions
  totalTaxes: number;          // Total taxes
  total: number;               // Prix final
  currency: string;
  nights: number;
}

/**
 * Calcule le prix avec les ajouts
 */
function calculatePriceWithAddons(
  basePrice: number,
  addons: ExperienceAddon[],
  nights: number,
  currency: string = 'USD'
): PriceBreakdown {
  if (!addons || addons.length === 0) {
    return {
      basePrice,
      commissions: [],
      taxes: [],
      subtotal: basePrice,
      totalTaxes: 0,
      total: basePrice,
      currency,
      nights,
    };
  }

  let subtotal = basePrice;
  const commissions: PriceBreakdown['commissions'] = [];
  const taxes: PriceBreakdown['taxes'] = [];

  // Trier les ajouts par ordre de calcul
  const sortedAddons = [...addons].sort(
    (a, b) => (a.calculation_order || 0) - (b.calculation_order || 0)
  );

  // Calculer les commissions (ordre 0)
  sortedAddons
    .filter((a) => (a.calculation_order || 0) === 0 && a.is_active)
    .forEach((addon) => {
      let amount = 0;

      if (addon.type === 'commission') {
        // Commission fixe
        amount = addon.is_percentage
          ? (subtotal * addon.value) / 100
          : addon.value;
      } else if (addon.type === 'per_night') {
        // Commission par nuit
        amount = addon.is_percentage
          ? ((subtotal * addon.value) / 100) * nights
          : addon.value * nights;
      }

      subtotal += amount;
      commissions.push({
        name: addon.name,
        amount: Math.round(amount * 100) / 100,
        type: addon.type === 'per_night' ? 'per_night' : 'commission',
      });
    });

  // Calculer les taxes (ordre 1+)
  sortedAddons
    .filter(
      (a) => (a.calculation_order || 0) >= 1 && a.type === 'tax' && a.is_active
    )
    .forEach((addon) => {
      const amount = addon.is_percentage
        ? (subtotal * addon.value) / 100
        : addon.value;

      subtotal += amount;
      taxes.push({
        name: addon.name,
        amount: Math.round(amount * 100) / 100,
      });
    });

  const totalTaxes = taxes.reduce((sum, tax) => sum + tax.amount, 0);

  return {
    basePrice: Math.round(basePrice * 100) / 100,
    commissions,
    taxes,
    subtotal: Math.round((subtotal - totalTaxes) * 100) / 100,
    totalTaxes: Math.round(totalTaxes * 100) / 100,
    total: Math.round(subtotal * 100) / 100,
    currency,
    nights,
  };
}

interface RatePlanPrices {
  sell?: { amount: number; currency: string };
  net?: { amount: number; currency: string };
}

/**
 * Hook pour calculer le prix d'une expérience V2
 */
export function useExperience2Price(
  experienceId: string | null,
  basePrice: number | null,
  currency: string,
  nights: number,
  ratePlanPrices: RatePlanPrices | null
) {
  const { data: addons = [] } = useExperienceAddons(experienceId);

  const priceBreakdown = useMemo(() => {
    if (!basePrice && !ratePlanPrices) {
      return null;
    }

    // Utiliser le prix du rate plan HyperGuest
    const hyperguestPrice = ratePlanPrices?.sell?.amount || ratePlanPrices?.net?.amount || basePrice || 0;
    const priceCurrency = ratePlanPrices?.sell?.currency || ratePlanPrices?.net?.currency || currency;

    return calculatePriceWithAddons(hyperguestPrice, addons, nights, priceCurrency);
  }, [basePrice, currency, nights, ratePlanPrices, addons]);

  return priceBreakdown;
}
