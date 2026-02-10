/**
 * Types pour les add-ons d'expérience (experience2_addons)
 * Compatible Supabase. Prix final = prix HyperGuest + addons.
 */

export type AddonType = "commission" | "per_night" | "tax" | "per_person";

export interface ExperienceAddon {
  id: string;
  experience_id: string;
  type: AddonType;
  name: string;
  name_he?: string | null;
  description?: string | null;
  description_he?: string | null;
  value: number;
  is_percentage: boolean;
  calculation_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExperienceAddonInsert {
  experience_id: string;
  type: AddonType;
  name: string;
  name_he?: string | null;
  description?: string | null;
  description_he?: string | null;
  value: number;
  is_percentage: boolean;
  calculation_order?: number;
  is_active?: boolean;
}

export interface ExperienceAddonUpdate {
  type?: AddonType;
  name?: string;
  name_he?: string | null;
  description?: string | null;
  description_he?: string | null;
  value?: number;
  is_percentage?: boolean;
  calculation_order?: number;
  is_active?: boolean;
}

export interface AddonFormData {
  type: AddonType;
  name: string;
  name_he?: string | null;
  description?: string | null;
  description_he?: string | null;
  value: number;
  is_percentage: boolean;
  calculation_order: number;
}

// ---------------------------------------------------------------------------
// Pricing V2 types
// ---------------------------------------------------------------------------

export interface PricingConfig {
  commission_room_pct: number;
  commission_addons_pct: number;
  tax_pct: number;
  promo_type: string | null;
  promo_value: number | null;
  promo_is_percentage: boolean;
}

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  commission_room_pct: 0,
  commission_addons_pct: 0,
  tax_pct: 0,
  promo_type: null,
  promo_value: null,
  promo_is_percentage: true,
};

export interface PerPersonAddonLine {
  name: string;
  pricePerPerson: number;
  guests: number;
  total: number;
}

export interface PriceBreakdownV2 {
  roomPrice: number;
  perPersonAddons: PerPersonAddonLine[];
  totalAddons: number;
  commissionRoomPct: number;
  commissionRoomAmount: number;
  commissionAddonsPct: number;
  commissionAddonsAmount: number;
  totalCommissions: number;
  subtotalBeforeTax: number;
  taxPct: number;
  taxAmount: number;
  promo: {
    type: string | null;
    value: number | null;
    isPercentage: boolean;
    discountAmount: number;
    fakeOriginalPrice: number | null;
  };
  finalTotal: number;
  currency: string;
  nights: number;
  guests: number;
}

export const ADDON_TYPES: Record<AddonType, { label: string; labelHe?: string; description: string }> = {
  commission: {
    label: "Fixed Commission",
    labelHe: "עמלה קבועה",
    description: "Fixed amount added to the HyperGuest price (e.g. +₪50)",
  },
  per_night: {
    label: "Per Night Fee",
    labelHe: "מחיר ללילה",
    description: "Amount multiplied by the number of nights (e.g. +₪20/night)",
  },
  per_person: {
    label: "Per Person Fee",
    labelHe: "מחיר לאדם",
    description: "Amount multiplied by the number of guests (e.g. +₪30/person)",
  },
  tax: {
    label: "Tax",
    labelHe: "מס",
    description: "Tax applied on the total after commissions (e.g. +10%)",
  },
};

export const ADDON_TYPES_EN: Record<AddonType, { label: string; description: string }> = {
  commission: {
    label: "Fixed Commission",
    description: "Fixed amount added to the HyperGuest price (e.g. +₪50)",
  },
  per_night: {
    label: "Per Night Fee",
    description: "Amount multiplied by the number of nights (e.g. +₪20/night)",
  },
  per_person: {
    label: "Per Person Fee",
    description: "Amount multiplied by the number of guests (e.g. +₪30/person)",
  },
  tax: {
    label: "Tax",
    description: "Tax applied on the total after commissions (e.g. +10%)",
  },
};

export const DEFAULT_CALCULATION_ORDER: Record<AddonType, number> = {
  commission: 0,
  per_night: 0,
  per_person: 0,
  tax: 1,
};

export function formatAddonValue(addon: ExperienceAddon | AddonFormData, currency = "₪"): string {
  if (addon.is_percentage) {
    return `+${addon.value}%`;
  }
  return `+${currency}${Number(addon.value).toFixed(2)}`;
}

export function getAddonTypeLabel(type: AddonType, locale: "en" | "he" = "en"): string {
  const typeInfo = ADDON_TYPES[type];
  if (locale === "he" && typeInfo.labelHe) {
    return typeInfo.labelHe;
  }
  return typeInfo.label;
}

export function getAddonTypeLabelEn(type: AddonType): string {
  return ADDON_TYPES_EN[type]?.label || type;
}

export function getDefaultCalculationOrder(type: AddonType): number {
  return DEFAULT_CALCULATION_ORDER[type] ?? 0;
}

const ADDON_TYPES_ORDER: AddonType[] = ["commission", "per_night", "per_person", "tax"];

export function getDefaultDraftAddons(): AddonFormData[] {
  return ADDON_TYPES_ORDER.map((type) => ({
    type,
    name: ADDON_TYPES[type]?.label ?? type,
    name_he: ADDON_TYPES[type]?.labelHe ?? undefined,
    description: undefined,
    description_he: undefined,
    value: 0,
    is_percentage: false,
    calculation_order: DEFAULT_CALCULATION_ORDER[type] ?? 0,
  }));
}
