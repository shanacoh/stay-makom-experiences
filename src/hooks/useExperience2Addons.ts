/**
 * Hook pour gérer les add-ons d'expérience (table experience2_addons)
 * TanStack Query. Exporte useExperienceAddons (utilisé par Experience2AddonsManager).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ExperienceAddon, ExperienceAddonInsert, ExperienceAddonUpdate } from "@/types/experience2_addons";
import type { AddonFormData } from "@/types/experience2_addons";
import { ADDON_TYPES, DEFAULT_CALCULATION_ORDER, type AddonType } from "@/types/experience2_addons";

const TABLE = "experience2_addons";

export const experienceAddonsKeys = {
  all: ["experience-addons"] as const,
  byExperience: (experienceId: string) => [...experienceAddonsKeys.all, "experience", experienceId] as const,
  detail: (id: string) => [...experienceAddonsKeys.all, "detail", id] as const,
};

async function fetchExperienceAddons(experienceId: string): Promise<ExperienceAddon[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("experience_id", experienceId)
    .order("calculation_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Erreur lors de la récupération des ajouts: ${error.message}`);
  }
  return data || [];
}

async function createExperienceAddon(addon: ExperienceAddonInsert): Promise<ExperienceAddon> {
  const { data, error } = await supabase.from(TABLE).insert(addon).select().single();

  if (error) {
    throw new Error(`Erreur lors de la création de l'ajout: ${error.message}`);
  }
  return data;
}

const ADDON_TYPES_ORDER: AddonType[] = ["commission", "per_night", "tax"];

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

  const { data, error } = await supabase.from(TABLE).insert(rows).select();

  if (error) {
    throw new Error(`Erreur lors de la création des ajouts: ${error.message}`);
  }
  return data ?? [];
}

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

  const { data, error } = await supabase.from(TABLE).insert(rows).select();
  if (error) {
    throw new Error(`Erreur lors de la création des ajouts: ${error.message}`);
  }
  return data ?? [];
}

async function updateExperienceAddon(id: string, updates: ExperienceAddonUpdate): Promise<ExperienceAddon> {
  const { data, error } = await supabase.from(TABLE).update(updates).eq("id", id).select().single();

  if (error) {
    throw new Error(`Erreur lors de la mise à jour de l'ajout: ${error.message}`);
  }
  return data;
}

async function deleteExperienceAddon(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);

  if (error) {
    throw new Error(`Erreur lors de la suppression de l'ajout: ${error.message}`);
  }
}

async function toggleExperienceAddon(id: string, isActive: boolean): Promise<ExperienceAddon> {
  return updateExperienceAddon(id, { is_active: isActive });
}

export function useExperienceAddons(experienceId: string | null) {
  return useQuery({
    queryKey: experienceAddonsKeys.byExperience(experienceId || ""),
    queryFn: () => fetchExperienceAddons(experienceId!),
    enabled: !!experienceId,
    staleTime: 1000 * 60 * 5,
  });
}

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

export function useUpdateExperienceAddon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ExperienceAddonUpdate }) => updateExperienceAddon(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: experienceAddonsKeys.byExperience(data.experience_id),
      });
      queryClient.invalidateQueries({
        queryKey: experienceAddonsKeys.detail(data.id),
      });
    },
  });
}

export function useDeleteExperienceAddon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExperienceAddon,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: experienceAddonsKeys.all,
      });
    },
  });
}

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
