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
      const { data, error } = await supabase
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
      <div className="space-y-6">
        <h2 className="font-sans text-3xl font-bold">Reviews</h2>
        <p className="text-muted-foreground">Loading reviews...</p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="font-sans text-3xl font-bold">Reviews</h2>
        <div className="text-center py-8 border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground">No reviews yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Be the first to share your experience!
          </p>
        </div>
      </div>
    );
  }

  const displayedReviews = showAll ? reviews : reviews.slice(0, 5);
  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-3xl font-bold">Reviews</h2>
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">
            ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {displayedReviews.map((review) => (
          <div key={review.id} className="p-4 border border-border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                  {review.customer_id?.substring(0, 2).toUpperCase() || "AN"}
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                {format(new Date(review.created_at), "MMM d, yyyy")}
              </span>
            </div>
            <p className="text-muted-foreground">{review.text}</p>
          </div>
        ))}
      </div>

      {reviews.length > 5 && !showAll && (
        <div className="text-center">
          <Button variant="outline" onClick={() => setShowAll(true)}>
            Load more reviews ({reviews.length - 5} more)
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
