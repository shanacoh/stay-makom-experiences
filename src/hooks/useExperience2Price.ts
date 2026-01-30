/**
 * Hook pour calculer le prix final d'une expérience V2
 * Combine le prix HyperGuest + les ajouts (commissions/taxes)
 * LOGS: pour diagnostiquer les NaN sur les prix
 */

import { useMemo } from "react";
import { useExperienceAddons } from "./useExperience2Addons";
import type { ExperienceAddon } from "@/types/experience2_addons";

export interface PriceBreakdown {
  basePrice: number;
  commissions: Array<{
    name: string;
    amount: number;
    type: "commission" | "per_night";
  }>;
  taxes: Array<{
    name: string;
    amount: number;
  }>;
  subtotal: number;
  totalTaxes: number;
  total: number;
  currency: string;
  nights: number;
}

function safeNumber(value: unknown, fallback: number = 0): number {
  const n = Number(value);
  if (Number.isNaN(n) || !Number.isFinite(n)) return fallback;
  return n;
}

/**
 * Calcule le prix avec les ajouts
 */
function calculatePriceWithAddons(
  basePrice: number,
  addons: ExperienceAddon[],
  nights: number,
  currency: string = "USD",
): PriceBreakdown {
  const safeBase = safeNumber(basePrice, 0);
  const safeNights = Math.max(0, Math.floor(Number(nights)) || 0);

  console.log("[useExperience2Price] calculatePriceWithAddons INPUT", {
    basePrice,
    safeBase,
    nights,
    safeNights,
    addonsCount: addons?.length ?? 0,
    currency,
  });

  if (!addons || addons.length === 0) {
    const result = {
      basePrice: Math.round(safeBase * 100) / 100,
      commissions: [],
      taxes: [],
      subtotal: safeBase,
      totalTaxes: 0,
      total: safeBase,
      currency,
      nights: safeNights,
    };
    console.log("[useExperience2Price] calculatePriceWithAddons NO ADDONS", result);
    return result;
  }

  let subtotal = safeBase;
  const commissions: PriceBreakdown["commissions"] = [];
  const taxes: PriceBreakdown["taxes"] = [];

  const sortedAddons = [...addons].sort((a, b) => (a.calculation_order ?? 0) - (b.calculation_order ?? 0));

  sortedAddons
    .filter((a) => (a.calculation_order ?? 0) === 0 && a.is_active)
    .forEach((addon) => {
      const value = safeNumber(addon.value, 0);
      let amount = 0;

      if (addon.type === "commission") {
        amount = addon.is_percentage ? (subtotal * value) / 100 : value;
      } else if (addon.type === "per_night") {
        amount = addon.is_percentage ? ((subtotal * value) / 100) * safeNights : value * safeNights;
      }

      amount = safeNumber(amount, 0);
      subtotal += amount;
      commissions.push({
        name: addon.name ?? "",
        amount: Math.round(amount * 100) / 100,
        type: addon.type === "per_night" ? "per_night" : "commission",
      });
    });

  sortedAddons
    .filter((a) => (a.calculation_order ?? 0) >= 1 && a.type === "tax" && a.is_active)
    .forEach((addon) => {
      const value = safeNumber(addon.value, 0);
      const amount = addon.is_percentage ? (subtotal * value) / 100 : value;
      const safeAmount = safeNumber(amount, 0);
      subtotal += safeAmount;
      taxes.push({
        name: addon.name ?? "",
        amount: Math.round(safeAmount * 100) / 100,
      });
    });

  const totalTaxes = taxes.reduce((sum, tax) => sum + tax.amount, 0);
  subtotal = safeNumber(subtotal, safeBase);

  const result = {
    basePrice: Math.round(safeBase * 100) / 100,
    commissions,
    taxes,
    subtotal: Math.round((subtotal - totalTaxes) * 100) / 100,
    totalTaxes: Math.round(totalTaxes * 100) / 100,
    total: Math.round(subtotal * 100) / 100,
    currency,
    nights: safeNights,
  };

  console.log("[useExperience2Price] calculatePriceWithAddons OUTPUT", result);
  if (Number.isNaN(result.total)) {
    console.error("[useExperience2Price] NaN total detected!", { result, subtotal, safeBase, addons });
  }
  return result;
}

/** Structure possible des prix HyperGuest (sell/net ou autres clés) */
export interface RatePlanPrices {
  sell?: { amount?: number; currency?: string };
  net?: { amount?: number; currency?: string };
  total?: number;
  amount?: number;
  [key: string]: unknown;
}

/**
 * Extrait le montant et la devise depuis l'objet prices de l'API HyperGuest.
 * L'API peut utiliser sell.amount, net.amount, total, amount, ou d'autres clés.
 */
function extractPriceFromRatePlanPrices(
  ratePlanPrices: RatePlanPrices | null,
): { amount: number; currency: string } | null {
  if (!ratePlanPrices || typeof ratePlanPrices !== "object") return null;

  const sellAmount = ratePlanPrices?.sell?.amount;
  const netAmount = ratePlanPrices?.net?.amount;
  const total = ratePlanPrices?.total;
  const amount = ratePlanPrices?.amount;

  const rawAmount = sellAmount ?? netAmount ?? total ?? amount;
  const num = rawAmount != null ? Number(rawAmount) : NaN;
  if (!Number.isFinite(num)) {
    // Essayer toute clé numérique au premier niveau (ex: totalPrice, sellPrice)
    const keys = Object.keys(ratePlanPrices);
    for (const k of keys) {
      const v = (ratePlanPrices as Record<string, unknown>)[k];
      if (typeof v === "number" && Number.isFinite(v)) {
        console.log("[useExperience2Price] extracted amount from key", k, v);
        const currency =
          ratePlanPrices?.sell?.currency ||
          ratePlanPrices?.net?.currency ||
          ((ratePlanPrices as Record<string, unknown>).currency as string) ||
          "ILS";
        return { amount: v, currency: typeof currency === "string" ? currency : "ILS" };
      }
      if (v && typeof v === "object" && "amount" in (v as object)) {
        const nested = (v as { amount?: number }).amount;
        if (typeof nested === "number" && Number.isFinite(nested)) {
          console.log("[useExperience2Price] extracted amount from nested", k, nested);
          const currency =
            ratePlanPrices?.sell?.currency ||
            ratePlanPrices?.net?.currency ||
            ((ratePlanPrices as Record<string, unknown>).currency as string) ||
            "ILS";
          return { amount: nested, currency: typeof currency === "string" ? currency : "ILS" };
        }
      }
    }
    console.warn("[useExperience2Price] no numeric price found in ratePlanPrices", {
      keys: Object.keys(ratePlanPrices),
      ratePlanPrices,
    });
    return null;
  }

  const currency = ratePlanPrices?.sell?.currency || ratePlanPrices?.net?.currency || "ILS";
  return { amount: num, currency: typeof currency === "string" ? currency : "ILS" };
}

/**
 * Hook pour calculer le prix d'une expérience V2
 */
export function useExperience2Price(
  experienceId: string | null,
  basePrice: number | null,
  currency: string,
  nights: number,
  ratePlanPrices: RatePlanPrices | null,
) {
  const { data: addons = [] } = useExperienceAddons(experienceId);

  const priceBreakdown = useMemo(() => {
    const extracted = extractPriceFromRatePlanPrices(ratePlanPrices);

    console.log("[useExperience2Price] useMemo inputs", {
      experienceId,
      basePrice,
      currency,
      nights,
      ratePlanPricesKeys: ratePlanPrices ? Object.keys(ratePlanPrices) : null,
      extracted,
      addonsCount: addons?.length ?? 0,
    });

    if (!basePrice && !ratePlanPrices) {
      console.log("[useExperience2Price] returning null (no basePrice and no ratePlanPrices)");
      return null;
    }

    const hyperguestPrice = extracted ? safeNumber(extracted.amount, 0) : safeNumber(basePrice, 0);
    const priceCurrency = extracted?.currency ?? currency;

    if (hyperguestPrice === 0 && extracted === null && basePrice == null) {
      console.warn("[useExperience2Price] no price could be extracted", { ratePlanPrices });
    }

    return calculatePriceWithAddons(hyperguestPrice, addons, nights, priceCurrency);
  }, [basePrice, currency, nights, ratePlanPrices, addons]);

  return priceBreakdown;
}
