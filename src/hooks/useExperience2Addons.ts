/**
 * Hook personnalisé pour gérer les ajouts d'expérience
 * Utilise TanStack Query pour le cache et la synchronisation
 * À intégrer dans votre projet React
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ExperienceAddon, ExperienceAddonInsert, ExperienceAddonUpdate, AddonFormData } from "@/types/experience2_addons";
import { ADDON_TYPES, DEFAULT_CALCULATION_ORDER, type AddonType } from "@/types/experience2_addons";

// =====================
// QUERY KEYS
// =====================

export const experienceAddonsKeys = {
  all: ["experience-addons"] as const,
  byExperience: (experienceId: string) => [...experienceAddonsKeys.all, "experience", experienceId] as const,
  detail: (id: string) => [...experienceAddonsKeys.all, "detail", id] as const,
};

// =====================
// FONCTIONS API
// =====================

/**
 * Récupère tous les ajouts d'une expérience
 */
async function fetchExperienceAddons(experienceId: string): Promise<ExperienceAddon[]> {
  const { data, error } = await supabase
    .from("experience2_addons")
    .select("*")
    .eq("experience_id", experienceId)
    .order("calculation_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Erreur lors de la récupération des ajouts: ${error.message}`);
  }

  return data || [];
}

/**
 * Crée un nouvel ajout
 */
async function createExperienceAddon(addon: ExperienceAddonInsert): Promise<ExperienceAddon> {
  const { data, error } = await supabase.from("experience2_addons").insert(addon).select().single();

  if (error) {
    throw new Error(`Erreur lors de la création de l'ajout: ${error.message}`);
  }

  return data;
}

/** Types d'add-on à créer par défaut (commission, per_night, tax) */
const ADDON_TYPES_ORDER: AddonType[] = ["commission", "per_night", "tax"];

/**
 * Crée en une fois les 3 add-ons par défaut (commission, per_night, tax) à 0
 */
async function createAllDefaultAddons(experienceId: string): Promise<ExperienceAddon[]> {
  const rows: ExperienceAddonInsert[] = ADDON_TYPES_ORDER.map((type) => ({
    experience_id: experienceId,
    type,
    name: ADDON_TYPES[type]?.label ?? type,
    name_he: ADDON_TYPES[type]?.labelHe ?? null,
    description: null,
    description_he: null,
    value: 0,
    is_percentage: false,
    calculation_order: DEFAULT_CALCULATION_ORDER[type] ?? 0,
    is_active: true,
  }));

  const { data, error } = await supabase.from("experience2_addons").insert(rows).select();

  if (error) {
    throw new Error(`Erreur lors de la création des ajouts: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Met à jour un ajout existant
 */
async function updateExperienceAddon(id: string, updates: ExperienceAddonUpdate): Promise<ExperienceAddon> {
  const { data, error } = await supabase.from("experience2_addons").update(updates).eq("id", id).select().single();

  if (error) {
    throw new Error(`Erreur lors de la mise à jour de l'ajout: ${error.message}`);
  }

  return data;
}

/**
 * Supprime un ajout
 */
async function deleteExperienceAddon(id: string): Promise<void> {
  const { error } = await supabase.from("experience2_addons").delete().eq("id", id);

  if (error) {
    throw new Error(`Erreur lors de la suppression de l'ajout: ${error.message}`);
  }
}

/** Crée les 3 add-ons (commission, per_night, tax) avec les valeurs fournies. */
async function createAddonsWithValues(experienceId: string, addons: AddonFormData[]): Promise<ExperienceAddon[]> {
  const rows: ExperienceAddonInsert[] = addons.map((a) => ({
    experience_id: experienceId,
    type: a.type,
    name: a.name,
    name_he: a.name_he ?? null,
    description: a.description ?? null,
    description_he: a.description_he ?? null,
    value: a.value,
    is_percentage: a.is_percentage,
    calculation_order: a.calculation_order ?? 0,
    is_active: true,
  }));

  const { data, error } = await supabase.from("experience2_addons").insert(rows).select();

  if (error) {
    throw new Error(`Erreur lors de la création des ajouts: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Active/désactive un ajout
 */
async function toggleExperienceAddon(id: string, isActive: boolean): Promise<ExperienceAddon> {
  return updateExperienceAddon(id, { is_active: isActive });
}

// =====================
// HOOKS
// =====================

/**
 * Hook pour récupérer les ajouts d'une expérience
 */
export function useExperienceAddons(experienceId: string | null) {
  return useQuery({
    queryKey: experienceAddonsKeys.byExperience(experienceId || ""),
    queryFn: () => fetchExperienceAddons(experienceId!),
    enabled: !!experienceId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook pour créer un ajout
 */
export function useCreateExperienceAddon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExperienceAddon,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: experienceAddonsKeys.byExperience(data.experience_id),
      });
    },
  });
}

/**
 * Hook pour créer en une fois les 3 add-ons par défaut (commission, per_night, tax) à 0
 */
export function useCreateAllDefaultAddons() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAllDefaultAddons,
    onSuccess: (_, experienceId) => {
      queryClient.invalidateQueries({
        queryKey: experienceAddonsKeys.byExperience(experienceId),
      });
    },
  });
}

/** Crée les 3 add-ons avec les valeurs saisies. */
export function useCreateAddonsWithValues() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ experienceId, addons }: { experienceId: string; addons: AddonFormData[] }) =>
      createAddonsWithValues(experienceId, addons),
    onSuccess: (_, { experienceId }) => {
      queryClient.invalidateQueries({
        queryKey: experienceAddonsKeys.byExperience(experienceId),
      });
    },
  });
}

/**
 * Hook pour mettre à jour un ajout
 */
export function useUpdateExperienceAddon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ExperienceAddonUpdate }) => updateExperienceAddon(id, updates),
    onSuccess: (data) => {
      // Invalider la liste des ajouts pour cette expérience
      queryClient.invalidateQueries({
        queryKey: experienceAddonsKeys.byExperience(data.experience_id),
      });
      // Invalider aussi le détail de cet ajout
      queryClient.invalidateQueries({
        queryKey: experienceAddonsKeys.detail(data.id),
      });
    },
  });
}

/**
 * Hook pour supprimer un ajout
 */
export function useDeleteExperienceAddon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExperienceAddon,
    onSuccess: (_, deletedId) => {
      // Invalider toutes les queries liées aux ajouts
      // (on ne connaît pas l'experience_id ici, donc on invalide tout)
      queryClient.invalidateQueries({
        queryKey: experienceAddonsKeys.all,
      });
    },
  });
}

/**
 * Hook pour activer/désactiver un ajout
 */
export function useToggleExperienceAddon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleExperienceAddon(id, isActive),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: experienceAddonsKeys.byExperience(data.experience_id),
      });
    },
  });
}
