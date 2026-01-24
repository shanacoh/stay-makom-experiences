import { Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Experience {
  id: string;
  slug: string;
  title: string;
  title_he?: string;
  hero_image?: string;
  photos?: string[];
  base_price: number;
  currency?: string;
  hotels?: {
    name: string;
    city?: string;
    hero_image?: string;
  };
}

interface CompactExperienceCardProps {
  experience: Experience;
  isInWishlist?: boolean;
  userId?: string;
  rating?: number;
}

export default function CompactExperienceCard({
  experience,
  isInWishlist = false,
  userId,
  rating = 8.5,
}: CompactExperienceCardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const image = experience.hero_image || experience.photos?.[0] || experience.hotels?.hero_image;
  const hotelName = experience.hotels?.name || "";
  const city = experience.hotels?.city || "";
  const currency = experience.currency === "ILS" ? "₪" : "$";

  const toggleWishlist = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("Please sign in to save favorites");
      }

      if (isInWishlist) {
        const { error } = await supabase
          .from("wishlist")
          .update({ deleted_at: new Date().toISOString() })
          .eq("user_id", userId)
          .eq("experience_id", experience.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("wishlist")
          .upsert({
            user_id: userId,
            experience_id: experience.id,
            deleted_at: null,
          }, { onConflict: "user_id,experience_id" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist-ids", userId] });
      queryClient.invalidateQueries({ queryKey: ["wishlist", userId] });
      toast.success(isInWishlist ? "Removed from wishlist" : "Added to wishlist");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleClick = () => {
    navigate(`/experience/${experience.slug}`);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist.mutate();
  };

  return (
    <div
      onClick={handleClick}
      className="group flex gap-3 p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-all duration-200"
    >
      {/* Image */}
      <div className="relative flex-shrink-0">
        <img
          src={image}
          alt={experience.title}
          className="w-20 h-20 object-cover rounded-lg"
        />
        {/* Wishlist button on hover */}
        <button
          onClick={handleWishlistClick}
          className={cn(
            "absolute top-1 right-1 p-1.5 rounded-full transition-all duration-200",
            "bg-background/80 backdrop-blur-sm",
            "opacity-0 group-hover:opacity-100",
            isInWishlist && "opacity-100"
          )}
        >
          <Heart
            className={cn(
              "h-3.5 w-3.5 transition-colors",
              isInWishlist ? "fill-red-500 text-red-500" : "text-foreground"
            )}
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <p className="text-xs text-muted-foreground truncate">
          {hotelName}{city && ` • ${city}`}
        </p>
        <p className="text-sm font-semibold text-foreground line-clamp-1 mt-0.5">
          {experience.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium">{rating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs font-medium text-foreground">
            {currency}{experience.base_price}
          </span>
        </div>
      </div>
    </div>
  );
}
