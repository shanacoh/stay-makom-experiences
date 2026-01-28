/**
 * Hook personnalisé pour gérer les ajouts d'expérience
 * Utilise TanStack Query pour le cache et la synchronisation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ExperienceAddon, ExperienceAddonInsert, ExperienceAddonUpdate } from '@/types/experience2_addons';

// =====================
// QUERY KEYS
// =====================

export const experienceAddonsKeys = {
  all: ['experience2-addons'] as const,
  byExperience: (experienceId: string) => 
    [...experienceAddonsKeys.all, 'experience', experienceId] as const,
  detail: (id: string) => 
    [...experienceAddonsKeys.all, 'detail', id] as const,
};

// =====================
// FONCTIONS API
// =====================

/**
 * Récupère tous les ajouts d'une expérience
 */
async function fetchExperienceAddons(experienceId: string): Promise<ExperienceAddon[]> {
  const { data, error } = await supabase
    .from('experience2_addons')
    .select('*')
    .eq('experience_id', experienceId)
    .order('calculation_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Erreur lors de la récupération des ajouts: ${error.message}`);
  }

  return data || [];
}

/**
 * Crée un nouvel ajout
 */
async function createExperienceAddon(addon: ExperienceAddonInsert): Promise<ExperienceAddon> {
  const { data, error } = await supabase
    .from('experience2_addons')
    .insert(addon)
    .select()
    .single();

  if (error) {
    throw new Error(`Erreur lors de la création de l'ajout: ${error.message}`);
  }

  return data;
}

/**
 * Met à jour un ajout existant
 */
async function updateExperienceAddon(
  id: string,
  updates: ExperienceAddonUpdate
): Promise<ExperienceAddon> {
  const { data, error } = await supabase
    .from('experience2_addons')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Erreur lors de la mise à jour de l'ajout: ${error.message}`);
  }

  return data;
}

/**
 * Supprime un ajout
 */
async function deleteExperienceAddon(id: string): Promise<void> {
  const { error } = await supabase
    .from('experience2_addons')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Erreur lors de la suppression de l'ajout: ${error.message}`);
  }
}

// =====================
// HOOKS
// =====================

/**
 * Hook pour récupérer les ajouts d'une expérience
 */
export function useExperienceAddons(experienceId: string | null) {
  return useQuery({
    queryKey: experienceAddonsKeys.byExperience(experienceId || ''),
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
      // Invalider la liste des ajouts pour cette expérience
      queryClient.invalidateQueries({
        queryKey: experienceAddonsKeys.byExperience(data.experience_id)
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
    mutationFn: ({ id, updates }: { id: string; updates: ExperienceAddonUpdate }) =>
      updateExperienceAddon(id, updates),
    onSuccess: (data) => {
      // Invalider la liste des ajouts pour cette expérience
      queryClient.invalidateQueries({
        queryKey: experienceAddonsKeys.byExperience(data.experience_id)
      });
      // Invalider aussi le détail de cet ajout
      queryClient.invalidateQueries({
        queryKey: experienceAddonsKeys.detail(data.id)
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
    onSuccess: () => {
      // Invalider toutes les queries liées aux ajouts
      queryClient.invalidateQueries({
        queryKey: experienceAddonsKeys.all
      });
    },
  });
}
