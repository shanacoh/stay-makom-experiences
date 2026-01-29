/**
 * Hook pour récupérer une expérience V2 par slug
 * Utilise TanStack Query avec Supabase
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const experience2Keys = {
  all: ['experiences2'] as const,
  bySlug: (slug: string) => [...experience2Keys.all, 'slug', slug] as const,
  byId: (id: string) => [...experience2Keys.all, 'id', id] as const,
};

/**
 * Récupère une expérience V2 par slug avec ses relations
 */
async function fetchExperience2BySlug(slug: string) {
  const { data, error } = await supabase
    .from('experiences2')
    .select(`
      *,
      hotels2 (
        id,
        name,
        name_he,
        slug,
        city,
        city_he,
        region,
        region_he,
        hero_image,
        photos,
        latitude,
        longitude,
        hyperguest_property_id,
        hyperguest_imported_at
      ),
      categories (
        id,
        name,
        name_he,
        slug
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error) {
    throw new Error(`Erreur lors de la récupération de l'expérience: ${error.message}`);
  }

  if (!data) {
    throw new Error('Expérience non trouvée ou non publiée');
  }

  return data;
}

/**
 * Hook pour récupérer une expérience V2 par slug
 */
export function useExperience2(slug: string | null) {
  return useQuery({
    queryKey: experience2Keys.bySlug(slug || ''),
    queryFn: () => fetchExperience2BySlug(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
