/**
 * Types TypeScript for experience pricing addons (experience2_addons)
 * Complements Supabase auto-generated types
 * 
 * IMPORTANT: Addons represent your COMMISSIONS and TAXES, not the experience price.
 * Final price = HyperGuest price (dynamic based on dates) + Your addons
 */

import type { Database } from '@/integrations/supabase/types';

// Base types from Supabase
export type Experience2AddonRow = Database['public']['Tables']['experience2_addons']['Row'];
export type Experience2AddonInsert = Database['public']['Tables']['experience2_addons']['Insert'];
export type Experience2AddonUpdate = Database['public']['Tables']['experience2_addons']['Update'];

// Aliases for code compatibility
export type ExperienceAddon = Experience2AddonRow;
export type ExperienceAddonInsert = Experience2AddonInsert;
export type ExperienceAddonUpdate = Experience2AddonUpdate;

// =====================
// UTILITY TYPES
// =====================

// Use the database enum type directly
export type AddonType = Database['public']['Enums']['addon_type'];

// =====================
// FORM TYPES
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
// CONSTANTS
// =====================

export const ADDON_TYPES: Record<AddonType, { label: string; labelHe?: string; description: string }> = {
  commission: {
    label: 'Fixed Commission',
    labelHe: 'עמלה קבועה',
    description: 'Fixed amount added to the HyperGuest price (e.g. +₪50)'
  },
  per_night: {
    label: 'Per Night Fee',
    labelHe: 'מחיר ללילה',
    description: 'Amount multiplied by the number of nights (e.g. +₪20/night)'
  },
  tax: {
    label: 'Tax',
    labelHe: 'מס',
    description: 'Tax applied on the total after commissions (e.g. +10%)'
  }
};

export const ADDON_TYPES_EN: Record<AddonType, { label: string; description: string }> = {
  commission: {
    label: 'Fixed Commission',
    description: 'Fixed amount added to the HyperGuest price (e.g. +₪50)'
  },
  per_night: {
    label: 'Per Night Fee',
    description: 'Amount multiplied by the number of nights (e.g. +₪20/night)'
  },
  tax: {
    label: 'Tax',
    description: 'Tax applied on the total after commissions (e.g. +10%)'
  }
};

export const DEFAULT_CALCULATION_ORDER: Record<AddonType, number> = {
  commission: 0,
  per_night: 0,
  tax: 1
};

// =====================
// UTILITIES
// =====================

/**
 * Format addon value for display
 */
export function formatAddonValue(addon: ExperienceAddon | AddonFormData, currency = '₪'): string {
  if (addon.is_percentage) {
    return `+${addon.value}%`;
  }
  return `+${currency}${Number(addon.value).toFixed(2)}`;
}

/**
 * Get addon type label
 */
export function getAddonTypeLabel(type: AddonType, locale: 'en' | 'he' = 'en'): string {
  const typeInfo = ADDON_TYPES[type];
  if (locale === 'he' && typeInfo.labelHe) {
    return typeInfo.labelHe;
  }
  return typeInfo.label;
}

/**
 * Get English label for addon type
 */
export function getAddonTypeLabelEn(type: AddonType): string {
  return ADDON_TYPES_EN[type]?.label || type;
}

/**
 * Get default calculation order for a type
 */
export function getDefaultCalculationOrder(type: AddonType): number {
  return DEFAULT_CALCULATION_ORDER[type] ?? 0;
}
