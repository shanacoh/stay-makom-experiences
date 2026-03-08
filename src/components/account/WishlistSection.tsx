import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Heart } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import ExperienceCard from "@/components/ExperienceCard";

interface WishlistSectionProps {
  userId?: string;
}

export default function WishlistSection({ userId }: WishlistSectionProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: wishlist, isLoading } = useQuery({
    queryKey: ["wishlist", userId],
    queryFn: async () => {
      if (!userId) return [];

      // Fetch wishlist entries
      const { data: wishlistData, error } = await supabase
        .from("wishlist")
        .select("id, experience_id, created_at")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!wishlistData || wishlistData.length === 0) return [];

      // Fetch V2 experiences
      const expIds = wishlistData.map((w) => w.experience_id).filter(Boolean);
      if (expIds.length === 0) return [];

      const { data: experiences } = await supabase
        .from("experiences2")
        .select(`
          id, slug, title, title_he, subtitle, hero_image, thumbnail_image, photos, base_price, currency,
          experience2_hotels(
            position,
            hotel:hotels2(id, name, name_he, city, city_he, hero_image)
          )
        `)
        .in("id", expIds)
        .eq("status", "published");

      // Map to card-compatible shape
      const mapped = (experiences || []).map((exp: any) => {
        const primaryHotel = exp.experience2_hotels
          ?.sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
          ?.[0]?.hotel;
        return { ...exp, hotels: primaryHotel || null };
      });

      const expMap = new Map(mapped.map((e) => [e.id, e]));

      return wishlistData
        .map((w) => ({ ...w, experience: expMap.get(w.experience_id) || null }))
        .filter((w) => w.experience);
    },
    enabled: !!userId,
  });

  const removeMutation = useMutation({
    mutationFn: async (wishlistId: string) => {
      const { error } = await supabase
        .from("wishlist")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", wishlistId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Removed from wishlist");
      queryClient.invalidateQueries({ queryKey: ["wishlist", userId] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove from wishlist");
    },
  });

  const handleRemove = (wishlistId: string) => {
    removeMutation.mutate(wishlistId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-16">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-2">
              <Heart className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="font-serif text-xl mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Explore our curated experiences and save your favorites to plan your next extraordinary getaway.
              </p>
            </div>
            <Button onClick={() => navigate("/")} variant="cta" className="mt-2">
              Discover Experiences
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleWishlistRemove = (experienceId: string) => {
    const wishlistItem = wishlist?.find((item) => item.experience?.id === experienceId);
    if (wishlistItem) {
      removeMutation.mutate(wishlistItem.id);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wishlist.map((item) => {
        const exp = item.experience;
        if (!exp) return null;

        return (
          <ExperienceCard
            key={item.id}
            experience={exp}
            isInWishlist={true}
            onWishlistToggle={handleWishlistRemove}
            userId={userId}
            rating={8.5 + Math.random() * 0.5}
            reviewCount={50 + Math.floor(Math.random() * 950)}
          />
        );
      })}
    </div>
  );
}
