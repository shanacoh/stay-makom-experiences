/**
 * Custom hook for managing experience addons
 * Uses TanStack Query for caching and sync
 *
 * IMPORTANT: Addons are your commissions and taxes, not the experience price
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ExperienceAddon, ExperienceAddonInsert, ExperienceAddonUpdate } from "@/types/experience2_addons";

// =====================
// QUERY KEYS
// =====================

export const experienceAddonsKeys = {
  all: ["experience2-addons"] as const,
  byExperience: (experienceId: string) => [...experienceAddonsKeys.all, "experience", experienceId] as const,
  detail: (id: string) => [...experienceAddonsKeys.all, "detail", id] as const,
};

// =====================
// API FUNCTIONS
// =====================

/**
 * Fetch all addons for an experience
 */
async function fetchExperienceAddons(experienceId: string): Promise<ExperienceAddon[]> {
  const { data, error } = await supabase
    .from("experience2_addons")
    .select("*")
    .eq("experience_id", experienceId)
    .order("calculation_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[useExperience2Addons] fetchExperienceAddons error:", error);
    throw new Error(`Error fetching addons: ${error.message}`);
  }

  console.log("[useExperience2Addons] fetchExperienceAddons OK", {
    experienceId,
    count: (data || []).length,
    addons: data,
  });
  return data || [];
}

/**
 * Create a new addon
 */
async function createExperienceAddon(addon: ExperienceAddonInsert): Promise<ExperienceAddon> {
  const { data, error } = await supabase.from("experience2_addons").insert(addon).select().single();

  if (error) {
    throw new Error(`Error creating addon: ${error.message}`);
  }

  return data;
}

/**
 * Update an existing addon
 */
async function updateExperienceAddon(id: string, updates: ExperienceAddonUpdate): Promise<ExperienceAddon> {
  const { data, error } = await supabase.from("experience2_addons").update(updates).eq("id", id).select().single();

  if (error) {
    throw new Error(`Error updating addon: ${error.message}`);
  }

  return data;
}

/**
 * Delete an addon
 */
async function deleteExperienceAddon(id: string): Promise<void> {
  const { error } = await supabase.from("experience2_addons").delete().eq("id", id);

  if (error) {
    throw new Error(`Error deleting addon: ${error.message}`);
  }
}

// =====================
// HOOKS
// =====================

/**
 * Hook to fetch addons for an experience
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
 * Hook to create an addon
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
 * Hook to update an addon
 */
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

/**
 * Hook to delete an addon
 */
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
