import { Quote } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr, he } from "date-fns/locale";

interface Review {
  id: string;
  text: string;
  rating: number;
  created_at: string;
  customer_id?: string;
}

interface FeaturedReviewProps {
  reviews: Review[];
  lang?: string;
}

const FeaturedReview = ({ reviews, lang = "en" }: FeaturedReviewProps) => {
  if (!reviews || reviews.length === 0) return null;

  // Get the most recent review with good rating
  const featuredReview = reviews
    .filter((r) => r.rating >= 4)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  if (!featuredReview) return null;

  const getLocale = () => {
    if (lang === "he") return he;
    return fr;
  };

  const timeAgo = formatDistanceToNow(new Date(featuredReview.created_at), {
    addSuffix: false,
    locale: getLocale(),
  });

  // Truncate text if too long
  const truncatedText =
    featuredReview.text.length > 200
      ? featuredReview.text.substring(0, 200) + "..."
      : featuredReview.text;

  return (
    <div className="border-b border-border pb-6">
      <p className="text-sm text-muted-foreground mb-2">
        {lang === "he" ? "ביקורת אחרונה" : lang === "en" ? "Recent review" : "Commentaire récent d'un voyageur"}
      </p>
      <div className="flex gap-3">
        <Quote className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-1 rotate-180" />
        <div>
          <p className="text-lg italic text-foreground leading-relaxed">
            {truncatedText}
          </p>
          <p className="text-sm text-muted-foreground mt-2 capitalize">
            {timeAgo}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeaturedReview;
