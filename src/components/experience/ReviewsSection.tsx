import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface ReviewsSectionProps {
  experienceId: string;
}

const ReviewsSection = ({ experienceId }: ReviewsSectionProps) => {
  const [showAll, setShowAll] = useState(false);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["experience-reviews", experienceId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("experience_reviews")
        .select("*")
        .eq("experience_id", experienceId)
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold">Reviews</h2>
        <p className="text-sm text-muted-foreground">Loading reviews...</p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold">Reviews</h2>
        <div className="text-center py-6 sm:py-8 border border-dashed border-border rounded-lg">
          <p className="text-sm text-muted-foreground">No reviews yet</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Be the first to share your experience!
          </p>
        </div>
      </div>
    );
  }

  const displayedReviews = showAll ? reviews : reviews.slice(0, 5);
  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold">Reviews</h2>
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  star <= Math.round(averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-base sm:text-lg font-semibold">{averageRating.toFixed(1)}</span>
          <span className="text-xs sm:text-sm text-muted-foreground">
            ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
          </span>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {displayedReviews.map((review) => (
          <div key={review.id} className="p-3 sm:p-4 border border-border rounded-lg space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs sm:text-sm font-semibold text-primary">
                  {review.customer_id?.substring(0, 2).toUpperCase() || "AN"}
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 sm:w-4 sm:h-4 ${
                        star <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                {format(new Date(review.created_at), "MMM d, yyyy")}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">{review.text}</p>
          </div>
        ))}
      </div>

      {reviews.length > 5 && !showAll && (
        <div className="text-center">
          <Button variant="outline" size="sm" onClick={() => setShowAll(true)} className="text-xs sm:text-sm">
            Load more reviews ({reviews.length - 5} more)
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
