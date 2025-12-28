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
  const originalPrice = Math.round(basePrice * 1.25);
  const discount = Math.round(((originalPrice - basePrice) / originalPrice) * 100);

  const priceLabel = basePriceType === 'per_person' 
    ? (lang === 'he' ? 'לאדם' : lang === 'en' ? 'per person' : 'par voyageur')
    : (lang === 'he' ? 'להזמנה' : lang === 'en' ? 'per booking' : 'par réservation');

  return (
    <div className="hidden lg:block space-y-3">
      {/* Recent review highlight */}
      {featuredReview && (
        <div className="flex items-start gap-2 p-3 bg-muted/40 rounded-lg">
          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-foreground mb-0.5">
              {lang === 'he' ? 'ביקורת אחרונה' : lang === 'en' ? "Recent review" : "Avis récent"}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              « {featuredReview.text} »
            </p>
          </div>
        </div>
      )}

      {/* Price and CTA section */}
      <div className="border border-border rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-semibold text-foreground">
                {lang === 'he' ? `${currency === 'USD' ? '$' : '€'}${basePrice}` : `${basePrice}${currency === 'USD' ? '$' : '€'}`}
              </span>
              <span className="text-xs line-through text-muted-foreground">
                {lang === 'he' ? `${currency === 'USD' ? '$' : '€'}${originalPrice}` : `${originalPrice}${currency === 'USD' ? '$' : '€'}`}
              </span>
              <span className="text-xs text-primary font-medium">-{discount}%</span>
            </div>
            <p className="text-xs text-muted-foreground">{priceLabel}</p>
          </div>

          <Button 
            onClick={onViewDates}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 text-sm"
          >
            {lang === 'he' ? 'לתאריכים' : lang === 'en' ? 'View dates' : 'Voir les dates'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroBookingPreview;
