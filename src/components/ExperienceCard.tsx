import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage, getLocalizedField } from "@/hooks/useLanguage";
import { t } from "@/lib/translations";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import AuthPromptDialog from "@/components/auth/AuthPromptDialog";
import HeartBurst from "@/components/ui/HeartBurst";

interface HighlightTag {
  id: string;
  slug: string;
  label_en: string;
  label_he?: string | null;
}

interface ExperienceCardProps {
  experience: {
    id: string;
    slug: string;
    title: string;
    title_he?: string | null;
    hero_image?: string | null;
    photos?: string[] | null;
    base_price: number;
    currency?: string | null;
    base_price_type?: string | null;
    hotels?: {
      name: string;
      name_he?: string | null;
      city: string;
      city_he?: string | null;
      region?: string | null;
      region_he?: string | null;
      hero_image?: string | null;
    } | null;
    includes?: string[] | null;
    includes_he?: string[] | null;
    min_nights?: number | null;
    max_nights?: number | null;
    min_party?: number | null;
    max_party?: number | null;
    experience_highlight_tags?: Array<{
      highlight_tags: HighlightTag;
    }> | null;
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
}: ExperienceCardProps) {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isHovered, setIsHovered] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const [animateHeart, setAnimateHeart] = useState(false);

  const title = getLocalizedField(experience, 'title', lang) as string;
  const hotelName = experience.hotels ? (getLocalizedField(experience.hotels, 'name', lang) as string) : '';
  const region = experience.hotels ? (getLocalizedField(experience.hotels, 'region', lang) as string || getLocalizedField(experience.hotels, 'city', lang) as string) : '';

  // Get highlight tags
  const highlightTags = experience.experience_highlight_tags?.map(eht => eht.highlight_tags) || [];

  // Currency symbol mapping
  const currencySymbol = experience.currency === 'ILS' ? '₪' : experience.currency === 'USD' ? '$' : '€';

  // Query wishlist status
  const { data: wishlistStatus } = useQuery({
    queryKey: ["wishlist-status", experience.id, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("wishlist")
        .select("id, deleted_at")
        .eq("user_id", user.id)
        .eq("experience_id", experience.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    initialData: initialIsInWishlist ? { id: '', deleted_at: null } : null,
  });

  const isInWishlist = wishlistStatus && !wishlistStatus.deleted_at;

  // Toggle wishlist mutation
  const wishlistMutation = useMutation({
    mutationFn: async ({ isAdding }: { isAdding: boolean }) => {
      if (!user?.id) {
        throw new Error("Not authenticated");
      }

      if (isAdding) {
        // Check if row exists with soft delete
        if (wishlistStatus?.deleted_at) {
          const { error } = await supabase
            .from("wishlist")
            .update({ deleted_at: null })
            .eq("id", wishlistStatus.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("wishlist")
            .insert({
              user_id: user.id,
              experience_id: experience.id,
            });
          if (error) throw error;
        }
      } else {
        // Soft delete
        const { error } = await supabase
          .from("wishlist")
          .update({ deleted_at: new Date().toISOString() })
          .eq("user_id", user.id)
          .eq("experience_id", experience.id)
          .is("deleted_at", null);
        
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist-status", experience.id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      
      if (variables.isAdding) {
        // Trigger animations
        setAnimateHeart(true);
        setShowBurst(true);
        setTimeout(() => setAnimateHeart(false), 400);
        
        // Show success toast
        const messages = {
          en: { title: "Added to favorites", desc: "You can find it in your account" },
          fr: { title: "Ajouté aux favoris", desc: "Retrouvez-le dans votre compte" },
          he: { title: "נוסף למועדפים", desc: "תוכל למצוא אותו בחשבון שלך" },
        };
        const msg = messages[lang] || messages.en;
        toast.success(msg.title, { description: msg.desc });
      } else {
        const removed = lang === 'he' ? 'הוסר מהמועדפים' : lang === 'fr' ? 'Retiré des favoris' : 'Removed from favorites';
        toast.success(removed);
      }
      
      onWishlistToggle?.(experience.id, variables.isAdding);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update wishlist");
    },
  });

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }

    wishlistMutation.mutate({ isAdding: !isInWishlist });
  };

  // Calculate display price
  const displayPrice = originalPrice && discountPercent 
    ? Math.floor(experience.base_price * (1 - discountPercent / 100))
    : experience.base_price;

  return (
    <>
      <AuthPromptDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen} 
        lang={lang} 
        defaultTab="login" 
      />
      
      <Link
        to={`/experience/${experience.slug}?lang=${lang}`}
        className="group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Photo section */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-1">
          {/* Image with zoom on hover - fallback to hotel hero_image if no experience image */}
          <img
            src={experience.hero_image || experience.photos?.[0] || experience.hotels?.hero_image || '/placeholder.svg'}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Bottom gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Experience name - bottom left */}
          <div className="absolute bottom-1.5 left-1.5 right-1.5">
            <h3 className="font-sans text-xs sm:text-sm font-bold text-white uppercase tracking-tight leading-tight line-clamp-2">
              {title}
            </h3>
          </div>
          
          {/* Optional badge - top left */}
          {badge && (
            <div className="absolute top-1.5 left-1.5">
              <span className="inline-block px-1.5 py-0.5 bg-black rounded text-white text-[9px] font-semibold uppercase tracking-wide">
                {badge === "NEW" ? t(lang, 'badgeNew') : badge === "ON SALE" ? t(lang, 'badgeOnSale') : badge === "POPULAR" ? t(lang, 'badgePopular') : badge}
              </span>
            </div>
          )}
          
          {/* Heart button - top right (appears on hover) */}
          <button
            onClick={handleHeartClick}
            disabled={wishlistMutation.isPending}
            className={cn(
              "absolute top-1.5 right-1.5 p-1 rounded-full bg-white/90 backdrop-blur-sm transition-all duration-300 hover:bg-white",
              isHovered || isInWishlist ? 'opacity-100' : 'opacity-0'
            )}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn(
                "h-3.5 w-3.5 transition-all",
                isInWishlist ? 'fill-cta text-cta' : 'text-foreground',
                animateHeart && 'animate-heart-pop'
              )}
            />
            <HeartBurst trigger={showBurst} onComplete={() => setShowBurst(false)} />
          </button>
        </div>

        {/* Content under image */}
        <div className="space-y-0.5">
          {/* Line 1: Rating - bigger with yellow star */}
          {rating && (
            <div className="flex items-center gap-1 text-sm">
              <span className="text-yellow-500">★</span>
              <span className="font-bold">{rating.toFixed(1)}</span>
              {reviewCount && (
                <span className="text-muted-foreground text-xs">({reviewCount})</span>
              )}
            </div>
          )}

          {/* Line 2: Hotel name • Region */}
          <h4 className="font-semibold text-xs text-foreground leading-tight line-clamp-1">
            {hotelName}{region ? ` • ${region}` : ''}
          </h4>

          {/* Line 3: Highlight Tags as badges */}
          {highlightTags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {highlightTags.slice(0, 4).map((tag) => (
                <span
                  key={tag.id}
                  className="inline-block px-1.5 py-0.5 bg-muted rounded-full text-[9px] font-medium uppercase tracking-wide text-muted-foreground"
                >
                  {lang === 'he' && tag.label_he ? tag.label_he : tag.label_en}
                </span>
              ))}
              {highlightTags.length > 4 && (
                <span className="inline-block px-1.5 py-0.5 text-[9px] text-muted-foreground">
                  +{highlightTags.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Line 4: Price */}
          <div className="flex items-baseline gap-1 pt-0.5">
            <span className="font-bold text-xs">
              {currencySymbol}{displayPrice}
            </span>
            <span className="text-[9px] text-muted-foreground">
              / {lang === 'he' ? 'לילה' : 'nuit'}
            </span>
            {originalPrice && originalPrice > displayPrice && (
              <span className="text-[10px] text-muted-foreground line-through">
                {currencySymbol}{originalPrice}
              </span>
            )}
            {discountPercent && (
              <span className="inline-block px-1 py-0.5 bg-black text-white text-[9px] font-semibold rounded">
                -{discountPercent} %
              </span>
            )}
          </div>
        </div>
      </Link>
    </>
  );
}
