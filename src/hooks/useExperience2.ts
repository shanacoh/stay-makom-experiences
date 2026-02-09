/**
 * Hook pour récupérer une expérience V2 par son slug
 * Utilise TanStack Query pour le cache et la synchronisation
 * Inclut maintenant les hôtels du parcours via experience2_hotels
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
        .select("*, hotels2(*), categories(*), experience2_hotels(*, hotels2(*))")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw new Error(`Experience not found: ${error.message}`);
      if (!data) throw new Error("Experience not found");

      // Sort experience hotels by position
      if (data.experience2_hotels) {
        data.experience2_hotels.sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0));
      }

      return data;
    },
    enabled: !!slug,
  });
}
