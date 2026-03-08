import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { fr, he } from "date-fns/locale";

interface ReviewsGrid2Props {
  experienceId: string;
  lang?: string;
}

const ReviewsGrid2 = ({ experienceId, lang = "en" }: ReviewsGrid2Props) => {
  const [showAll, setShowAll] = useState(false);

  const { data: reviews } = useQuery({
    queryKey: ["experience2-reviews", experienceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experience2_reviews")
        .select("*")
        .eq("experience_id", experienceId)
        .eq("is_visible", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Empty state — intentional placeholder
  if (!reviews || reviews.length === 0) {
    return (
      <section className="py-8">
        <div className="h-px bg-border/60 mb-8" />
        <h2 className="font-serif text-[20px] md:text-2xl font-bold uppercase tracking-wide text-foreground mb-6">
          {lang === "he" ? "ביקורות" : lang === "fr" ? "AVIS" : "REVIEWS"}
        </h2>
        <div className="flex flex-col items-center text-center py-8">
          {/* 5 outlined stars */}
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 text-amber-300/60" />
            ))}
          </div>
          <p className="text-[15px] md:text-base text-foreground font-medium mb-1">
            {lang === "he"
              ? "היו הראשונים לכתוב ביקורת"
              : lang === "fr"
                ? "Soyez le premier à donner votre avis"
                : "Be the first to review this experience"}
          </p>
          <p className="text-[13px] md:text-sm text-muted-foreground">
            {lang === "he"
              ? "אחרי השהייה, שתפו את החוויה שלכם."
              : lang === "fr"
                ? "Après votre séjour, partagez votre escapade."
                : "After your stay, share your escape."}
          </p>
        </div>
      </section>
    );
  }

  const getLocale = () => (lang === "he" ? he : fr);
  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  const displayedReviews = showAll ? reviews : reviews.slice(0, 6);

  return (
    <section className="py-8">
      <div className="h-px bg-border/60 mb-8" />
      <h2 className="font-serif text-[20px] md:text-2xl font-bold uppercase tracking-wide text-foreground mb-4">
        {lang === "he" ? "ביקורות" : lang === "fr" ? "AVIS" : "REVIEWS"}
      </h2>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-foreground text-foreground" />
          <span className="text-xl font-serif font-bold">{averageRating.toFixed(1)}</span>
        </div>
        <span className="text-muted-foreground">·</span>
        <span className="text-base">
          {reviews.length} {lang === "he" ? "ביקורות" : lang === "en" ? "reviews" : "avis"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedReviews.map((review) => {
          const timeAgo = formatDistanceToNow(new Date(review.created_at!), {
            addSuffix: false,
            locale: getLocale(),
          });

          return (
            <div key={review.id} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-semibold text-primary">
                    {review.user_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm">{review.user_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < review.rating ? "fill-foreground text-foreground" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">· {timeAgo}</span>
              </div>

              {review.comment && (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                  {review.comment}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {reviews.length > 6 && !showAll && (
        <Button variant="outline" className="mt-6" onClick={() => setShowAll(true)}>
          {lang === "he"
            ? `הצג את כל ${reviews.length} הביקורות`
            : lang === "en"
              ? `Show all ${reviews.length} reviews`
              : `Afficher les ${reviews.length} avis`}
        </Button>
      )}
    </section>
  );
};

export default ReviewsGrid2;
