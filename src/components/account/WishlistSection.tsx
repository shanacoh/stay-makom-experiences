import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Heart, MapPin, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
            base_price,
            currency,
            hotel_id,
            hotels (
              name,
              city
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wishlist.map((item) => {
        const exp = item.experiences;
        if (!exp) return null;

        return (
          <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="relative h-48 bg-muted overflow-hidden">
              {exp.hero_image ? (
                <img
                  src={exp.hero_image}
                  alt={exp.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={() => handleRemove(item.id)}
                disabled={removeMutation.isPending}
              >
                <Heart className="h-5 w-5 fill-primary text-primary" />
              </Button>
            </div>

            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg line-clamp-2 mb-1">{exp.title}</h3>
                {exp.subtitle && (
                  <p className="text-sm text-muted-foreground line-clamp-1">{exp.subtitle}</p>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {exp.hotels?.name} • {exp.hotels?.city}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-semibold text-lg">
                    {exp.base_price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {exp.currency}
                  </span>
                </div>
                <Button 
                  onClick={() => handleBookNow(exp.slug)}
                  size="sm"
                >
                  Book Now
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
