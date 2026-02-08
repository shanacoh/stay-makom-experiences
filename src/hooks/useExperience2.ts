/**
 * Hook pour récupérer une expérience V2 par son slug
 * Utilise TanStack Query pour le cache et la synchronisation.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useExperience2(slug: string | null) {
  return useQuery({
    queryKey: ["experience2", slug],
    queryFn: async () => {
      if (!slug) throw new Error("Slug is required");

      const { data, error } = await supabase
        .from("experiences2")
        .select("*, hotels2(*), categories(*)")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw new Error(`Experience not found: ${error.message}`);
      if (!data) throw new Error("Experience not found");

      return data;
    },
    enabled: !!slug,
  });
}
