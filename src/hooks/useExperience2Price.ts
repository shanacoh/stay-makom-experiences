// =============================================================================
// src/hooks/useExperience2Price.ts
// Hook de calcul de prix V2 — Modèle à 6 couches
// =============================================================================

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  ExperienceAddon,
  PricingConfig,
  PriceBreakdownV2,
  PerPersonAddonLine,
} from "@/types/experience2_addons";

// ---------------------------------------------------------------------------
// Fetch addons for an experience (per_person only for V2 calculation)
// ---------------------------------------------------------------------------

export function useExperienceAddons(experienceId: string | null) {
  return useQuery({
    queryKey: ["experience2-addons", experienceId],
    queryFn: async () => {
      if (!experienceId) return [];
      const { data, error } = await supabase
        .from("experience2_addons")
        .select("*")
        .eq("experience_id", experienceId)
        .eq("is_active", true)
        .order("calculation_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ExperienceAddon[];
    },
    enabled: !!experienceId,
  });
}

// ---------------------------------------------------------------------------
// Fetch pricing config from experiences2 table
// ---------------------------------------------------------------------------

export function useExperiencePricingConfig(experienceId: string | null) {
  return useQuery({
    queryKey: ["experience2-pricing-config", experienceId],
    queryFn: async () => {
      if (!experienceId) return null;
      const { data, error } = await supabase
        .from("experiences2")
        .select("commission_room_pct, commission_addons_pct, tax_pct, promo_type, promo_value, promo_is_percentage")
        .eq("id", experienceId)
        .single();
      if (error) throw error;
      return {
        commission_room_pct: data.commission_room_pct ?? 0,
        commission_addons_pct: data.commission_addons_pct ?? 0,
        tax_pct: data.tax_pct ?? 0,
        promo_type: data.promo_type ?? null,
        promo_value: data.promo_value ?? null,
        promo_is_percentage: data.promo_is_percentage ?? true,
      } as PricingConfig;
    },
    enabled: !!experienceId,
  });
}

// ---------------------------------------------------------------------------
// Extract room price from HyperGuest RatePlanPrices
// ---------------------------------------------------------------------------

export function extractPriceFromRatePlanPrices(ratePlanPrices: unknown): { amount: number; currency: string } | null {
  if (ratePlanPrices == null) return null;

  // Direct number
  if (typeof ratePlanPrices === "number") {
    return { amount: ratePlanPrices, currency: "ILS" };
  }

  const p = ratePlanPrices as Record<string, unknown>;

  // { sell: { price: number, currency } }
  if (p.sell && typeof p.sell === "object") {
    const sell = p.sell as Record<string, unknown>;
    if (typeof sell.price === "number") {
      return {
        amount: sell.price,
        currency: (sell.currency as string) || "ILS",
      };
    }
  }

  // { net: { price: number, currency } }
  if (p.net && typeof p.net === "object") {
    const net = p.net as Record<string, unknown>;
    if (typeof net.price === "number") {
      return {
        amount: net.price,
        currency: (net.currency as string) || "ILS",
      };
    }
  }

  // { total: number }
  if (typeof p.total === "number") {
    return { amount: p.total, currency: (p.currency as string) || "ILS" };
  }

  // { total: { amount: number } }
  if (p.total && typeof p.total === "object") {
    const total = p.total as Record<string, unknown>;
    if (typeof total.amount === "number") {
      return {
        amount: total.amount,
        currency: (total.currency as string) || "ILS",
      };
    }
  }

  // { amount: number }
  if (typeof p.amount === "number") {
    return { amount: p.amount, currency: (p.currency as string) || "ILS" };
  }

  // Array of daily prices → sum
  if (Array.isArray(ratePlanPrices)) {
    const sum = (ratePlanPrices as unknown[]).reduce<number>((s, item: unknown) => {
      if (typeof item === "number") return s + item;
      if (item && typeof item === "object") {
        const i = item as Record<string, unknown>;
        return s + (Number(i.price ?? i.amount ?? i.rate ?? 0));
      }
      return s;
    }, 0);
    return { amount: sum, currency: "ILS" };
  }

  // { perNight: [...] } or { dailyPrices: [...] }
  const arr = (p.perNight ?? p.dailyPrices) as unknown[];
  if (Array.isArray(arr)) {
    const sum = arr.reduce<number>((s, item: unknown) => {
      if (typeof item === "number") return s + item;
      if (item && typeof item === "object") {
        const i = item as Record<string, unknown>;
        return s + (Number(i.price ?? i.amount ?? i.rate ?? 0));
      }
      return s;
    }, 0);
    return { amount: sum, currency: "ILS" };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Core calculation: 6-layer pricing model
// ---------------------------------------------------------------------------

export function calculatePriceV2(
  roomPrice: number,
  guests: number,
  nights: number,
  perPersonAddons: ExperienceAddon[],
  config: PricingConfig,
  currency: string,
): PriceBreakdownV2 {
  // --- Layer 1: Room ---
  // roomPrice is already the full stay price from HyperGuest

  // --- Layer 2: Per-person addons ---
  const addonLines: PerPersonAddonLine[] = perPersonAddons
    .filter((a) => a.type === "per_person" && a.is_active)
    .map((addon) => ({
      name: addon.name,
      pricePerPerson: addon.value,
      guests,
      total: addon.value * guests,
    }));

  const totalAddons = addonLines.reduce((sum, a) => sum + a.total, 0);

  // --- Layer 3: Commissions ---
  const commissionRoomPct = config.commission_room_pct || 0;
  const commissionAddonsPct = config.commission_addons_pct || 0;

  const commissionRoomAmount = (roomPrice * commissionRoomPct) / 100;
  const commissionAddonsAmount = (totalAddons * commissionAddonsPct) / 100;
  const totalCommissions = commissionRoomAmount + commissionAddonsAmount;

  // --- Layer 4: Taxes ---
  const subtotalBeforeTax = roomPrice + totalAddons + totalCommissions;
  const taxPct = config.tax_pct || 0;
  const taxAmount = (subtotalBeforeTax * taxPct) / 100;

  // --- Layer 5: Promo ---
  const totalBeforePromo = subtotalBeforeTax + taxAmount;
  let discountAmount = 0;
  let fakeOriginalPrice: number | null = null;

  if (config.promo_type === "real_discount" && config.promo_value != null && config.promo_value > 0) {
    if (config.promo_is_percentage) {
      discountAmount = (totalBeforePromo * config.promo_value) / 100;
    } else {
      discountAmount = Math.min(config.promo_value, totalBeforePromo); // Can't discount more than total
    }
  } else if (config.promo_type === "fake_markup" && config.promo_value != null && config.promo_value > 0) {
    // Show a higher "original" price as strikethrough
    fakeOriginalPrice = totalBeforePromo * (1 + config.promo_value / 100);
  }

  // --- Final ---
  const finalTotal = Math.max(0, totalBeforePromo - discountAmount);

  return {
    roomPrice,
    perPersonAddons: addonLines,
    totalAddons,
    commissionRoomPct,
    commissionRoomAmount,
    commissionAddonsPct,
    commissionAddonsAmount,
    totalCommissions,
    subtotalBeforeTax,
    taxPct,
    taxAmount,
    promo: {
      type: config.promo_type,
      value: config.promo_value,
      isPercentage: config.promo_is_percentage,
      discountAmount,
      fakeOriginalPrice,
    },
    finalTotal,
    currency,
    nights,
    guests,
  };
}

// ---------------------------------------------------------------------------
// Main hook: useExperience2Price
// ---------------------------------------------------------------------------

export function useExperience2Price(
  experienceId: string | null,
  basePrice: number | null,
  currency: string,
  nights: number,
  numberOfGuests: number,
  ratePlanPrices?: unknown,
): PriceBreakdownV2 | null {
  const { data: addons } = useExperienceAddons(experienceId);
  const { data: pricingConfig } = useExperiencePricingConfig(experienceId);

  return useMemo(() => {
    // Try to extract room price from HyperGuest rate plan
    const extracted = extractPriceFromRatePlanPrices(ratePlanPrices);
    const roomPrice = extracted?.amount ?? basePrice ?? 0;
    const cur = extracted?.currency ?? currency;

    if (roomPrice <= 0 && (!addons || addons.length === 0)) return null;

    const config: PricingConfig = pricingConfig ?? {
      commission_room_pct: 0,
      commission_addons_pct: 0,
      tax_pct: 0,
      promo_type: null,
      promo_value: null,
      promo_is_percentage: true,
    };

    // Filter only per_person addons for V2 calculation
    const perPersonAddons = (addons ?? []).filter((a) => a.type === "per_person");

    return calculatePriceV2(roomPrice, numberOfGuests, nights, perPersonAddons, config, cur);
  }, [addons, pricingConfig, basePrice, currency, nights, numberOfGuests, ratePlanPrices]);
}

// ---------------------------------------------------------------------------
// Legacy compatibility: old PriceBreakdown type
// (for components that haven't been updated yet)
// ---------------------------------------------------------------------------

export interface PriceBreakdown {
  basePrice: number;
  commissions: Array<{ name: string; amount: number; type: "commission" | "per_night" }>;
  taxes: Array<{ name: string; amount: number }>;
  subtotal: number;
  totalTaxes: number;
  total: number;
  currency: string;
  nights: number;
}
