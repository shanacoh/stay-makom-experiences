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

/**
 * Structure des prix HyperGuest (API Search).
 * L'API utilise "price" (pas "amount") dans sell/net — voir api-response-*.json et DOC_SUPPLEMENTS_HYPERGUEST.md
 */
export interface RatePlanPrices {
  sell?: { price?: number; amount?: number; currency?: string; [key: string]: unknown };
  net?: { price?: number; amount?: number; currency?: string; [key: string]: unknown };
  total?: number;
  amount?: number;
  [key: string]: unknown;
}

/** Convertit une valeur en nombre (accepte string "123.45") */
function toNumber(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * Extrait le montant et la devise depuis l'objet prices de l'API HyperGuest.
 * Accepte: sell.amount, net.amount, total, amount, strings "123.45", objets imbriqués avec .amount/.value/.total
 */
function extractPriceFromRatePlanPrices(
  ratePlanPrices: RatePlanPrices | null,
): { amount: number; currency: string } | null {
  if (!ratePlanPrices || typeof ratePlanPrices !== "object") return null;

  const R = ratePlanPrices as Record<string, unknown>;

  const tryAmount = (val: unknown): number | null => toNumber(val);
  const getCurrency = (): string => {
    const sell = ratePlanPrices?.sell as { currency?: string } | undefined;
    const net = ratePlanPrices?.net as { currency?: string } | undefined;
    const c = sell?.currency || net?.currency || (R.currency as string) || "ILS";
    return typeof c === "string" ? c : "ILS";
  };

  // 1) Chemins connus — HyperGuest API utilise "price" dans sell/net (pas "amount")
  const sellObj = ratePlanPrices?.sell as { price?: unknown; amount?: unknown } | undefined;
  const netObj = ratePlanPrices?.net as { price?: unknown; amount?: unknown } | undefined;
  const sellAmount = tryAmount(sellObj?.price ?? sellObj?.amount);
  const netAmount = tryAmount(netObj?.price ?? netObj?.amount);
  const total = tryAmount(R.total);
  const amount = tryAmount(R.amount);
  const first = sellAmount ?? netAmount ?? total ?? amount;
  if (first != null && first >= 0) {
    console.log("[useExperience2Price] extracted amount (known path)", { first, currency: getCurrency() });
    return { amount: first, currency: getCurrency() };
  }

  // 2) Toute valeur numérique ou string numérique au premier niveau
  for (const k of Object.keys(R)) {
    const v = R[k];
    const n = tryAmount(v);
    if (n != null && n >= 0) {
      console.log("[useExperience2Price] extracted amount from key", k, n);
      return { amount: n, currency: getCurrency() };
    }
  }

  // 3) Objets imbriqués: .price, .amount, .value, .total (HyperGuest utilise "price")
  for (const k of Object.keys(R)) {
    const v = R[k];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const obj = v as Record<string, unknown>;
      const nestedAmount = tryAmount(obj.price ?? obj.amount ?? obj.value ?? obj.total);
      if (nestedAmount != null && nestedAmount >= 0) {
        console.log("[useExperience2Price] extracted amount from nested", k, nestedAmount);
        return { amount: nestedAmount, currency: getCurrency() };
      }
    }
  }

  console.warn("[useExperience2Price] no numeric price found in ratePlanPrices", {
    keys: Object.keys(ratePlanPrices),
    structure: JSON.stringify(ratePlanPrices),
  });
  return null;
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
