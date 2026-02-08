/**
 * Types TypeScript pour les add-ons d'expérience (experience2_addons)
 * Compatible Supabase. Si tu utilises les types générés (Database), tu peux
 * remplacer ExperienceAddon / ExperienceAddonInsert / ExperienceAddonUpdate
 * par les alias vers Database['public']['Tables']['experience2_addons'].
 *
 * Addons = commissions et taxes. Prix final = prix HyperGuest + addons.
 */

// =====================
// TYPES DE BASE
// =====================

export type AddonType = "commission" | "per_night" | "tax";

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

// =====================
// TYPES POUR LE FORMULAIRE
// =====================

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

// =====================
// CONSTANTES
// =====================

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
  tax: {
    label: "Tax",
    description: "Tax applied on the total after commissions (e.g. +10%)",
  },
};

export const DEFAULT_CALCULATION_ORDER: Record<AddonType, number> = {
  commission: 0,
  per_night: 0,
  tax: 1,
};

// =====================
// UTILITAIRES
// =====================

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

const ADDON_TYPES_ORDER: AddonType[] = ["commission", "per_night", "tax"];

/**
 * Retourne les 3 add-ons "brouillon" par défaut (commission, per_night, tax) à 0.
 * À utiliser en mode création d'expérience (avant d'avoir un experience_id).
 */
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
