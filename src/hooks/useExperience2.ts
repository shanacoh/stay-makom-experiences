/**
 * Hook pour récupérer une expérience V2 par slug
 * Joins experiences2 → hotels2, categories
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
        .single();

      if (error) {
        throw new Error(`Experience not found: ${error.message}`);
      }

      return data;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}
