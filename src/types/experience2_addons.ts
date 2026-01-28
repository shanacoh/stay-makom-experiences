/**
 * Types TypeScript pour les ajouts d'expérience (experience2_addons)
 * Complément aux types auto-générés de Supabase
 */

import type { Database } from '@/integrations/supabase/types';

// Type de base depuis Supabase
export type Experience2AddonRow = Database['public']['Tables']['experience2_addons']['Row'];
export type Experience2AddonInsert = Database['public']['Tables']['experience2_addons']['Insert'];
export type Experience2AddonUpdate = Database['public']['Tables']['experience2_addons']['Update'];

// Alias pour compatibilité avec le code
export type ExperienceAddon = Experience2AddonRow;
export type ExperienceAddonInsert = Experience2AddonInsert;
export type ExperienceAddonUpdate = Experience2AddonUpdate;

// =====================
// TYPES UTILITAIRES
// =====================

export type AddonType = 'commission' | 'per_night' | 'tax';

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
    label: 'Commission fixe',
    labelHe: 'עמלה קבועה',
    description: 'Montant fixe ajouté au prix de l\'hôtel'
  },
  per_night: {
    label: 'Prix par nuit',
    labelHe: 'מחיר ללילה',
    description: 'Montant multiplié par le nombre de nuits'
  },
  tax: {
    label: 'Taxe',
    labelHe: 'מס',
    description: 'Taxe appliquée sur le total (après commissions)'
  }
};

export const DEFAULT_CALCULATION_ORDER: Record<AddonType, number> = {
  commission: 0,
  per_night: 0,
  tax: 1
};

// =====================
// UTILITAIRES
// =====================

/**
 * Formate la valeur d'un ajout pour l'affichage
 */
export function formatAddonValue(addon: ExperienceAddon | AddonFormData, currency = '€'): string {
  if (addon.is_percentage) {
    return `+${addon.value}%`;
  }
  return `+${Number(addon.value).toFixed(2)}${currency}`;
}

/**
 * Obtient le label d'un type d'ajout
 */
export function getAddonTypeLabel(type: AddonType, locale: 'en' | 'he' = 'en'): string {
  const typeInfo = ADDON_TYPES[type];
  if (locale === 'he' && typeInfo.labelHe) {
    return typeInfo.labelHe;
  }
  return typeInfo.label;
}

/**
 * Obtient l'ordre de calcul par défaut selon le type
 */
export function getDefaultCalculationOrder(type: AddonType): number {
  return DEFAULT_CALCULATION_ORDER[type];
}
