import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, Grid3X3, Star, MapPin, Share, Heart, CheckCircle } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

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
  categoryName?: string;
  address?: string;
  averageRating?: number | null;
  reviewsCount?: number;
  reviews?: Review[];
  basePrice?: number;
  basePriceType?: string;
  currency?: string;
  lang: 'en' | 'he' | 'fr';
  onViewDates?: () => void;
}

const HeroSection = ({ 
  photos, 
  title, 
  subtitle,
  hotelName,
  hotelImage,
  city,
  categoryName,
  address,
  averageRating,
  reviewsCount = 0,
  reviews = [],
  basePrice,
  basePriceType = 'per_person',
  currency = 'EUR',
  lang,
  onViewDates
}: HeroSectionProps) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Only 4 photos for the grid
  const displayPhotos = photos.slice(0, 4);

  const handlePrevious = () => {
    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = () => {
    setCurrentPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  // Get most recent review for the preview
  const recentReview = reviews[0];

  // Format price
  const formatPrice = (price: number) => {
    if (lang === 'he') return `${price}€`;
    return `${price}€`;
  };

  return (
    <>
      <div className="pt-20 lg:pt-24 pb-4 lg:pb-6">
        {/* MOBILE: Full-width carousel */}
        <div className="block lg:hidden">
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
                      className="aspect-[4/3] w-full cursor-pointer"
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

          {/* Mobile: Content below photos */}
          <div className="px-4 pt-4 space-y-3">
            {/* Title */}
            <h1 className="text-lg font-semibold text-foreground leading-tight">
              {title}
            </h1>

            {/* Rating, Reviews, Location row */}
            <div className="flex items-center gap-1.5 text-xs flex-wrap">
              {averageRating && (
                <>
                  <div className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-foreground text-foreground" />
                    <span className="font-medium">{averageRating.toFixed(1)}</span>
                  </div>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground underline">
                    {reviewsCount} {lang === 'he' ? 'ביקורות' : lang === 'en' ? 'reviews' : 'avis'}
                  </span>
                  <span className="text-muted-foreground">·</span>
                </>
              )}
              {city && (
                <span className="text-muted-foreground">{city}</span>
              )}
            </div>

            {/* Host info - compact */}
            {hotelName && (
              <div className="flex items-center gap-2 pt-1">
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

        {/* DESKTOP: 2-column layout - 65% images / 35% content */}
        <div className="hidden lg:block container px-6 xl:px-8">
          <div className="grid grid-cols-[65fr_35fr] gap-6 xl:gap-8">
            
            {/* LEFT: Photo Grid - 1 large + 3 small layout (4 photos only) */}
            <div className="relative">
              <div className="grid grid-cols-3 grid-rows-2 gap-1.5 rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 140px)', maxHeight: '520px' }}>
                {/* Main large photo - spans 2 cols and 2 rows */}
                <div
                  className="col-span-2 row-span-2 relative cursor-pointer overflow-hidden"
                  onClick={() => {
                    setCurrentPhotoIndex(0);
                    setIsGalleryOpen(true);
                  }}
                >
                  <img
                    src={displayPhotos[0] || "/placeholder.svg"}
                    alt={`${title} - 1`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* 3 smaller photos stacked on the right */}
                {displayPhotos.slice(1, 4).map((photo, index) => (
                  <div
                    key={index + 1}
                    className="relative cursor-pointer overflow-hidden"
                    onClick={() => {
                      setCurrentPhotoIndex(index + 1);
                      setIsGalleryOpen(true);
                    }}
                  >
                    <img
                      src={photo || "/placeholder.svg"}
                      alt={`${title} - ${index + 2}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {/* View all photos overlay on last photo */}
                    {index === 2 && photos.length > 4 && (
                      <button
                        className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm font-medium hover:bg-black/50 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentPhotoIndex(0);
                          setIsGalleryOpen(true);
                        }}
                      >
                        <Grid3X3 className="h-4 w-4 mr-2" />
                        {lang === 'he' ? 'כל התמונות' : lang === 'en' ? 'View all' : 'Voir tout'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Airbnb-style content column */}
            <div className="flex flex-col py-2 h-full">
              {/* Title */}
              <h1 className="text-xl font-semibold text-foreground mb-2 leading-tight">
                {title}
              </h1>

              {/* Subtitle / Description */}
              {subtitle && (
                <p className="text-muted-foreground text-sm mb-3 leading-relaxed line-clamp-2">
                  {subtitle}
                </p>
              )}

              {/* Rating row: ★ 4.95 · XX avis */}
              {averageRating && (
                <div className="flex items-center gap-1.5 text-sm mb-2">
                  <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
                  <span className="font-medium">{averageRating.toFixed(2)}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground underline cursor-pointer text-xs">
                    {reviewsCount} {lang === 'he' ? 'ביקורות' : lang === 'en' ? 'reviews' : 'avis'}
                  </span>
                </div>
              )}

              {/* Location row: Ville · Catégorie */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                {city && <span>{city}</span>}
                {city && categoryName && <span>·</span>}
                {categoryName && <span>{categoryName}</span>}
              </div>

              {/* Share and Save buttons */}
              <div className="flex items-center gap-4 mb-4">
                <button className="flex items-center gap-1.5 text-sm text-foreground hover:text-foreground/80 transition-colors">
                  <Share className="h-4 w-4" />
                  <span className="underline">
                    {lang === 'he' ? 'שתף' : lang === 'en' ? 'Share' : 'Partager'}
                  </span>
                </button>
                <button className="flex items-center gap-1.5 text-sm text-foreground hover:text-foreground/80 transition-colors">
                  <Heart className="h-4 w-4" />
                  <span className="underline">
                    {lang === 'he' ? 'שמור' : lang === 'en' ? 'Save' : 'Enregistrer'}
                  </span>
                </button>
              </div>

              {/* Thin separator */}
              <div className="border-t border-border/50 my-4" />

              {/* Host section with hotel info */}
              {hotelName && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground overflow-hidden flex-shrink-0">
                    {hotelImage ? (
                      <img src={hotelImage} alt={hotelName} className="w-full h-full object-cover" />
                    ) : (
                      hotelName.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {lang === 'he' ? `מארח: ${hotelName}` : lang === 'en' ? `Host: ${hotelName}` : `Hôte : ${hotelName}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lang === 'he' ? 'חוויה מקומית' : lang === 'en' ? 'Local experience' : 'Expérience locale'}
                    </p>
                  </div>
                </div>
              )}

              {/* Location section with map icon */}
              {(address || city) && (
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground">
                      {address || city}
                    </p>
                  </div>
                </div>
              )}

              {/* Recent review section */}
              {recentReview && (
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground line-clamp-2 italic">
                      "{recentReview.text.substring(0, 100)}{recentReview.text.length > 100 ? '...' : ''}"
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(recentReview.created_at).toLocaleDateString(lang === 'he' ? 'he-IL' : lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              )}

              {/* Spacer to push price preview to bottom */}
              <div className="flex-1" />

              {/* Price preview sticky - visible at bottom, transitions to sticky on scroll */}
              {basePrice && (
                <div className="border-t border-border/50 pt-4 mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-semibold underline">
                      {lang === 'he' ? `מ-${formatPrice(basePrice)}` : `À partir de ${formatPrice(basePrice)}`}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {basePriceType === 'per_person' 
                      ? (lang === 'he' ? 'לאדם' : lang === 'fr' ? 'par voyageur' : 'per person')
                      : (lang === 'he' ? 'להזמנה' : lang === 'fr' ? 'par réservation' : 'per booking')}
                  </p>
                  <p className="text-sm text-primary mt-1">
                    {lang === 'he' ? 'ביטול ללא תשלום' : lang === 'fr' ? 'Annulation gratuite' : 'Free cancellation'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black border-none">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => setIsGalleryOpen(false)}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Photo counter */}
            <div className="absolute top-4 left-4 z-50 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
              {currentPhotoIndex + 1} / {photos.length}
            </div>

            {/* Navigation arrows */}
            <button
              onClick={handlePrevious}
              className="absolute left-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Current photo */}
            <img
              src={photos[currentPhotoIndex]}
              alt={`${title} - ${currentPhotoIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HeroSection;
