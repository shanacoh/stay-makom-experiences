import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import ExperienceCard from "@/components/ExperienceCard";
import CompactExperienceCard from "@/components/account/CompactExperienceCard";

interface RecommendedExperiencesProps {
  userId?: string;
  limit?: number;
  title?: string;
  subtitle?: string;
  excludeIds?: string[];
  compact?: boolean;
}

export default function RecommendedExperiences({
  userId,
  limit = 3,
  title = "You might also like",
  subtitle = "Based on your favorites and interests",
  excludeIds = [],
  compact = false,
}: RecommendedExperiencesProps) {
  const navigate = useNavigate();

  // Fetch user's interests and wishlist categories
  const { data: userPreferences } = useQuery({
    queryKey: ["user-preferences", userId],
    queryFn: async () => {
      if (!userId) return { interests: [], wishlistCategoryIds: [] };

      // Get user interests
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("interests")
        .eq("user_id", userId)
        .maybeSingle();

      // Get categories from wishlist
      const { data: wishlist } = await supabase
        .from("wishlist")
        .select("experiences(category_id)")
        .eq("user_id", userId)
        .is("deleted_at", null);

      const wishlistCategoryIds = wishlist
        ?.map((w) => w.experiences?.category_id)
        .filter(Boolean) as string[];

      return {
        interests: (profile?.interests as string[]) || [],
        wishlistCategoryIds: [...new Set(wishlistCategoryIds)],
      };
    },
    enabled: !!userId,
  });

  // Fetch recommended experiences
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["recommended-experiences", userId, userPreferences, excludeIds, limit],
    queryFn: async () => {
      let query = supabase
        .from("experiences")
        .select(`
          id,
          slug,
          title,
          title_he,
          subtitle,
          hero_image,
          photos,
          base_price,
          currency,
          category_id,
          hotels (name, city, hero_image)
        `)
        .eq("status", "published")
        .limit(limit + excludeIds.length);

      // If we have category preferences, prioritize those
      if (userPreferences?.wishlistCategoryIds?.length) {
        query = query.in("category_id", userPreferences.wishlistCategoryIds);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter out excluded IDs
      const filtered = (data || []).filter((exp) => !excludeIds.includes(exp.id));
      return filtered.slice(0, limit);
    },
    enabled: !!userId,
  });

  // Get wishlist IDs to show heart state
  const { data: wishlistIds } = useQuery({
    queryKey: ["wishlist-ids", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from("wishlist")
        .select("experience_id")
        .eq("user_id", userId)
        .is("deleted_at", null);
      return data?.map((w) => w.experience_id) || [];
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 pt-6 border-t border-border/50">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-4 w-4 text-accent" />
        <h3 className="font-serif text-lg text-foreground">{title}</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>

      {compact ? (
        // Compact grid layout
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-muted/30 rounded-xl p-2">
          {recommendations.map((exp) => (
            <CompactExperienceCard
              key={exp.id}
              experience={exp}
              isInWishlist={wishlistIds?.includes(exp.id)}
              userId={userId}
              rating={8.5 + Math.random() * 0.5}
            />
          ))}
        </div>
      ) : (
        // Standard grid layout
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((exp) => (
            <ExperienceCard
              key={exp.id}
              experience={exp}
              isInWishlist={wishlistIds?.includes(exp.id)}
              userId={userId}
              rating={8.5 + Math.random() * 0.5}
              reviewCount={50 + Math.floor(Math.random() * 950)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
