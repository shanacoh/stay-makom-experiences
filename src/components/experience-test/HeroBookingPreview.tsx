import { Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroBookingPreviewProps {
  basePrice: number;
  basePriceType: string;
  currency: string;
  averageRating?: number | null;
  reviewsCount?: number;
  featuredReview?: {
    text: string;
    rating: number;
    created_at: string;
  } | null;
  lang: 'en' | 'he' | 'fr';
  onViewDates: () => void;
}

const HeroBookingPreview = ({
  basePrice,
  basePriceType,
  currency,
  averageRating,
  reviewsCount = 0,
  featuredReview,
  lang,
  onViewDates
}: HeroBookingPreviewProps) => {
  // Calculate fake original price for display
  const originalPrice = Math.round(basePrice * 1.25);
  const discount = Math.round(((originalPrice - basePrice) / originalPrice) * 100);

  const priceLabel = basePriceType === 'per_person' 
    ? (lang === 'he' ? 'לאדם' : lang === 'en' ? 'per person' : 'par voyageur')
    : (lang === 'he' ? 'להזמנה' : lang === 'en' ? 'per booking' : 'par réservation');

  return (
    <div className="space-y-4">
      {/* Recent review highlight */}
      {featuredReview && (
        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              {lang === 'he' ? 'ביקורת אחרונה' : lang === 'en' ? "Guest's recent review" : "Commentaire récent d'un voyageur"}
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              « {featuredReview.text} »
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(featuredReview.created_at).toLocaleDateString(
                lang === 'he' ? 'he-IL' : lang === 'fr' ? 'fr-FR' : 'en-US',
                { month: 'short', year: 'numeric' }
              )}
            </p>
          </div>
        </div>
      )}

      {/* Price and CTA section */}
      <div className="border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-foreground">
                {lang === 'he' ? `${currency === 'USD' ? '$' : '€'}${basePrice}` : `${basePrice}${currency === 'USD' ? '$' : '€'}`}
              </span>
              <span className="text-sm line-through text-muted-foreground">
                {lang === 'he' ? `${currency === 'USD' ? '$' : '€'}${originalPrice}` : `${originalPrice}${currency === 'USD' ? '$' : '€'}`}
              </span>
              <span className="text-sm text-primary font-medium">-{discount}%</span>
            </div>
            <p className="text-sm text-muted-foreground">{priceLabel}</p>
            <p className="text-sm text-primary mt-1">
              {lang === 'he' ? 'ביטול חינם' : lang === 'en' ? 'Free cancellation' : 'Annulation gratuite'}
            </p>
          </div>

          <Button 
            onClick={onViewDates}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
          >
            {lang === 'he' ? 'לתאריכים' : lang === 'en' ? 'View dates' : 'Voir les dates'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroBookingPreview;
