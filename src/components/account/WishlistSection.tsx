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
      
      const { data, error } = await supabase
        .from("wishlist")
        .select(`
          id,
          created_at,
          experiences (
            id,
            slug,
            title,
            title_he,
            subtitle,
            hero_image,
            photos,
            base_price,
            currency,
            hotel_id,
            hotels (
              name,
              city,
              hero_image
            )
          )
        `)
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
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

  const handleBookNow = (experienceSlug: string) => {
    navigate(`/experience/${experienceSlug}`);
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
      <Card>
        <CardContent className="py-16">
          <div className="text-center space-y-4">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground">
                Start exploring extraordinary stays and add your favorites here!
              </p>
            </div>
            <Button onClick={() => navigate("/")}>
              Discover Experiences
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleWishlistRemove = (experienceId: string) => {
    const wishlistItem = wishlist?.find(item => item.experiences?.id === experienceId);
    if (wishlistItem) {
      removeMutation.mutate(wishlistItem.id);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wishlist.map((item) => {
        const exp = item.experiences;
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
