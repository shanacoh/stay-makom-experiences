import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage, getLocalizedField } from "@/hooks/useLanguage";

interface ExperienceCardProps {
  experience: {
    id: string;
    slug: string;
    title: string;
    title_he?: string | null;
    hero_image?: string | null;
    base_price: number;
    currency?: string | null;
    base_price_type?: string | null;
    hotels?: {
      name: string;
      name_he?: string | null;
      city: string;
      city_he?: string | null;
    } | null;
    includes?: string[] | null;
    includes_he?: string[] | null;
    min_nights?: number | null;
    max_nights?: number | null;
    min_party?: number | null;
    max_party?: number | null;
  };
  badge?: string | null;
  originalPrice?: number | null;
  discountPercent?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  distance?: number | null;
  userCity?: string | null;
  isInWishlist?: boolean;
  onWishlistToggle?: (experienceId: string, isAdding: boolean) => void;
  userId?: string | null;
}

export default function ExperienceCard({
  experience,
  badge,
  originalPrice,
  discountPercent,
  rating = 9.1,
  reviewCount = 14,
  distance,
  userCity,
  isInWishlist: initialIsInWishlist = false,
  onWishlistToggle,
  userId,
}: ExperienceCardProps) {
  const { lang } = useLanguage();
  const queryClient = useQueryClient();
  const [isInWishlist, setIsInWishlist] = useState(initialIsInWishlist);
  const [isHovered, setIsHovered] = useState(false);

  const title = getLocalizedField(experience, 'title', lang) as string;
  const hotelName = experience.hotels ? (getLocalizedField(experience.hotels, 'name', lang) as string) : '';
  const city = experience.hotels ? (getLocalizedField(experience.hotels, 'city', lang) as string) : '';
  const includes = (getLocalizedField(experience, 'includes', lang) as string[] | null) || [];

  // Currency symbol mapping
  const currencySymbol = experience.currency === 'ILS' ? '₪' : experience.currency === 'USD' ? '$' : '€';

  // Toggle wishlist mutation
  const wishlistMutation = useMutation({
    mutationFn: async ({ isAdding }: { isAdding: boolean }) => {
      if (!userId) {
        throw new Error("Please log in to add to wishlist");
      }

      if (isAdding) {
        // Add to wishlist
        const { error } = await supabase
          .from("wishlist")
          .insert({
            user_id: userId,
            experience_id: experience.id,
          });
        
        if (error) throw error;
      } else {
        // Remove from wishlist (soft delete)
        const { error } = await supabase
          .from("wishlist")
          .update({ deleted_at: new Date().toISOString() })
          .eq("user_id", userId)
          .eq("experience_id", experience.id)
          .is("deleted_at", null);
        
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      setIsInWishlist(variables.isAdding);
      toast.success(variables.isAdding ? "Added to wishlist" : "Removed from wishlist");
      queryClient.invalidateQueries({ queryKey: ["wishlist", userId] });
      onWishlistToggle?.(experience.id, variables.isAdding);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update wishlist");
    },
  });

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userId) {
      toast.error("Please log in to add to wishlist");
      return;
    }

    wishlistMutation.mutate({ isAdding: !isInWishlist });
  };

  // Format highlights - max 3-4 items
  const highlights = includes.length > 0 
    ? includes.slice(0, 4).join(' • ')
    : experience.min_nights && experience.max_nights
    ? `${experience.min_nights}-${experience.max_nights} ${lang === 'he' ? 'לילות' : 'nights'} • ${experience.min_party}-${experience.max_party} ${lang === 'he' ? 'אורחים' : 'guests'}`
    : '';

  // Calculate display price
  const displayPrice = originalPrice && discountPercent 
    ? Math.floor(experience.base_price * (1 - discountPercent / 100))
    : experience.base_price;

  return (
    <Link
      to={`/experience/${experience.slug}?lang=${lang}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Photo section */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl mb-2">
        {/* Image with zoom on hover */}
        <img
          src={experience.hero_image || '/placeholder.svg'}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Bottom gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Experience name - bottom left */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-sans text-sm sm:text-base lg:text-lg font-bold text-white uppercase tracking-tight leading-tight line-clamp-2">
            {title}
          </h3>
        </div>
        
        {/* Optional badge - top left */}
        {badge && (
          <div className="absolute top-2 left-2">
            <span className="inline-block px-2 py-0.5 bg-black rounded-md text-white text-[10px] font-semibold uppercase tracking-wider">
              {badge}
            </span>
          </div>
        )}
        
        {/* Heart button - top right (appears on hover) */}
        <button
          onClick={handleHeartClick}
          disabled={wishlistMutation.isPending}
          className={`absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm transition-opacity duration-300 hover:bg-white ${
            isHovered || isInWishlist ? 'opacity-100' : 'opacity-0'
          }`}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isInWishlist ? 'fill-primary text-primary' : 'text-foreground'
            }`}
          />
        </button>
      </div>

      {/* Content under image */}
      <div className="space-y-0.5">
        {/* Line 1: Location and Rating */}
        <div className="flex items-center justify-between gap-1">
          <p className="text-xs text-muted-foreground truncate">
            {distance && userCity
              ? `${city} · ${distance} km`
              : city}
          </p>
          {rating && (
            <div className="flex items-center gap-0.5 text-xs whitespace-nowrap flex-shrink-0">
              <span className="text-foreground">★</span>
              <span className="font-semibold">{rating.toFixed(1)}</span>
              {reviewCount && (
                <span className="text-muted-foreground">({reviewCount})</span>
              )}
            </div>
          )}
        </div>

        {/* Line 2: Hotel name */}
        <h4 className="font-semibold text-sm text-foreground leading-tight line-clamp-1">
          {hotelName}
        </h4>

        {/* Line 3: Highlights */}
        {highlights && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {highlights}
          </p>
        )}

        {/* Line 4: Price */}
        <div className="flex items-baseline gap-1.5 pt-0.5">
          <span className="font-bold text-base">
            {currencySymbol}{displayPrice}
          </span>
          <span className="text-xs text-muted-foreground">
            / {lang === 'he' ? 'לילה' : 'nuit'}
          </span>
          {originalPrice && originalPrice > displayPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {currencySymbol}{originalPrice}
            </span>
          )}
          {discountPercent && (
            <span className="inline-block px-1.5 py-0.5 bg-black text-white text-[10px] font-semibold rounded">
              -{discountPercent} %
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
