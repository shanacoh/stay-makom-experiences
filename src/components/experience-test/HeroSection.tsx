import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Share, Heart, ChevronRight } from "lucide-react";
import { Grid3X3 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import GalleryModal from "@/components/experience/GalleryModal";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";

interface Review {
  id: string;
  text: string;
  rating: number;
  created_at: string;
}

interface HeroSectionProps {
  photos: string[];
  title: string;
  subtitle?: string;
  hotelName?: string;
  hotelImage?: string;
  city?: string;
  region?: string;
  address?: string;
  averageRating?: number | null;
  reviewsCount?: number;
  reviews?: Review[];
  basePrice?: number;
  basePriceType?: string;
  currency?: string;
  lang: 'en' | 'he' | 'fr';
  onViewDates?: () => void;
  // Booking panel props
  experienceId?: string;
  hotelId?: string;
  minParty?: number;
  maxParty?: number;
  // Category props
  categoryName?: string;
  categorySlug?: string;
}

const HeroSection = ({ 
  photos, 
  title, 
  subtitle,
  hotelName,
  hotelImage,
  city,
  region,
  address,
  averageRating,
  reviewsCount = 0,
  reviews = [],
  basePrice,
  basePriceType = 'per_person',
  currency = 'EUR',
  lang,
  onViewDates,
  experienceId,
  hotelId,
  minParty = 2,
  maxParty = 4,
  categoryName,
  categorySlug
}: HeroSectionProps) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const { getLocalizedPath } = useLocalizedNavigation();

  // 4 photos for the 2x2 grid
  const displayPhotos = photos.slice(0, 4);

  const handlePrevious = () => {
    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = () => {
    setCurrentPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  // Get most recent review for the preview
  const recentReview = reviews[0];

  return (
    <>
      <div className="pt-16 md:pt-18">
        {/* Breadcrumb Navigation */}
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link to={getLocalizedPath("/")} className="hover:text-foreground transition-colors">
              {lang === 'he' ? 'בית' : 'Home'}
            </Link>
            {categoryName && categorySlug && (
              <>
                <ChevronRight className="h-3 w-3 flex-shrink-0" />
                <Link 
                  to={getLocalizedPath(`/category/${categorySlug}`)} 
                  className="hover:text-foreground transition-colors"
                >
                  {categoryName}
                </Link>
              </>
            )}
            <ChevronRight className="h-3 w-3 flex-shrink-0" />
            <span className="text-foreground font-medium truncate max-w-[180px] sm:max-w-none">
              {title}
            </span>
          </div>
        </nav>

        {/* MOBILE: Full-width carousel with rounded corners */}
        <div className="block md:hidden">
          <div className="px-4 pt-3">
            <div className="relative">
              <Carousel 
                className="w-full"
                opts={{ loop: true }}
                setApi={(api) => {
                  api?.on("select", () => {
                    setCarouselIndex(api.selectedScrollSnap());
                  });
                }}
              >
                <CarouselContent>
                  {photos.slice(0, 8).map((photo, index) => (
                    <CarouselItem key={index}>
                      <div 
                        className="aspect-[4/3] w-full cursor-pointer rounded-2xl overflow-hidden"
                        onClick={() => {
                          setCurrentPhotoIndex(index);
                          setIsGalleryOpen(true);
                        }}
                      >
                        <img
                          src={photo || "/placeholder.svg"}
                          alt={`${title} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
              
              {/* Dots indicator */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {photos.slice(0, 8).map((_, index) => (
                  <div 
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      index === carouselIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>

              {/* Photo counter */}
              <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                {carouselIndex + 1} / {Math.min(photos.length, 8)}
              </div>
            </div>
          </div>

          {/* Mobile: Content below photos - centered */}
          <div className="px-4 pt-5 space-y-3 text-center">
            {/* Category Badge - centered */}
            {categoryName && categorySlug && (
              <Link 
                to={getLocalizedPath(`/category/${categorySlug}`)}
                className="inline-block text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                {categoryName}
              </Link>
            )}
            
            {/* Title - centered */}
            <h1 className="text-xl font-semibold text-foreground leading-tight">
              {title}
            </h1>

            {/* Subtitle/Description - centered */}
            {subtitle && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {subtitle}
              </p>
            )}

            {/* Rating, Reviews row - centered */}
            <div className="flex items-center justify-center gap-1.5 text-sm">
              {averageRating && (
                <>
                  <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
                  <span className="font-medium">{averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground underline">
                    {reviewsCount} {lang === 'he' ? 'ביקורות' : lang === 'en' ? 'reviews' : 'avis'}
                  </span>
                </>
              )}
              {city && (
                <>
                  {averageRating && <span className="text-muted-foreground">·</span>}
                  <span className="text-muted-foreground">{city}</span>
                </>
              )}
            </div>

            {/* Host info - centered */}
            {hotelName && (
              <div className="flex items-center justify-center gap-2 pt-1">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground overflow-hidden">
                  {hotelImage ? (
                    <img src={hotelImage} alt={hotelName} className="w-full h-full object-cover" />
                  ) : (
                    hotelName.charAt(0)
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {lang === 'he' ? `מאת ${hotelName}` : lang === 'en' ? `By ${hotelName}` : `Par ${hotelName}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* DESKTOP & TABLET: 2-column layout with single large photo */}
        <div className="hidden md:block max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="grid grid-cols-[65fr_35fr] gap-4 md:gap-6 xl:gap-8 items-center">
            
            {/* LEFT: Single large photo */}
            <div className="relative h-[calc(100vh-12rem)]">
              <div 
                className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer"
                onClick={() => {
                  setCurrentPhotoIndex(0);
                  setIsGalleryOpen(true);
                }}
              >
                <img
                  src={photos[0] || "/placeholder.svg"}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                {/* Button to open gallery */}
                {photos.length > 1 && (
                  <button
                    className="absolute bottom-4 right-4 z-10 px-3 py-2 rounded-lg bg-white/90 hover:bg-white shadow-md transition-all flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPhotoIndex(0);
                      setIsGalleryOpen(true);
                    }}
                  >
                    <Grid3X3 className="h-4 w-4 text-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {lang === 'he' ? `הצג את כל ${photos.length} התמונות` : lang === 'fr' ? `Voir les ${photos.length} photos` : `View all ${photos.length} photos`}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT: Content + Booking Panel integrated */}
            <div className="flex flex-col justify-center items-center h-[calc(100vh-12rem)] text-center">
            {/* Content info section */}
              <div className="space-y-4 pb-5">
                {/* Category Badge - centered */}
                {categoryName && categorySlug && (
                  <Link 
                    to={getLocalizedPath(`/category/${categorySlug}`)}
                    className="inline-block text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {categoryName}
                  </Link>
                )}
                
                {/* Title - centered */}
                <h1 className="text-2xl font-semibold text-foreground leading-tight">
                  {title}
                </h1>

                {/* Subtitle / Description - centered */}
                {subtitle && (
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {subtitle}
                  </p>
                )}

                {/* Share and Save buttons - centered */}
                <div className="flex items-center justify-center gap-3">
                  <button className="p-2 text-foreground hover:bg-muted/50 rounded-full transition-colors" aria-label="Share">
                    <Share className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-foreground hover:bg-muted/50 rounded-full transition-colors" aria-label="Save">
                    <Heart className="h-5 w-5" />
                  </button>
                </div>

                {/* Rating row - centered */}
                <div className="flex items-center justify-center gap-2">
                  {averageRating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-foreground text-foreground" />
                      <span className="font-semibold">{averageRating.toFixed(2)}</span>
                      <span className="text-muted-foreground mx-1">·</span>
                      <button className="text-muted-foreground underline text-sm hover:text-foreground transition-colors">
                        {reviewsCount} {lang === 'he' ? 'ביקורות' : lang === 'en' ? 'reviews' : 'avis'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Separator */}
                <div className="border-t border-border" />

                {/* Host section - Hotel name only, no "Host:" label */}
                {hotelName && (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-base font-medium text-muted-foreground overflow-hidden flex-shrink-0">
                      {hotelImage ? (
                        <img src={hotelImage} alt={hotelName} className="w-full h-full object-cover" />
                      ) : (
                        hotelName.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{hotelName}</p>
                      <p className="text-sm text-muted-foreground">
                        {city}{city && region && <span className="mx-1">•</span>}{region}
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Modal - Scrollable vertical layout */}
      <GalleryModal
        open={isGalleryOpen}
        onOpenChange={setIsGalleryOpen}
        photos={photos}
        title={title}
      />
    </>
  );
};

export default HeroSection;
