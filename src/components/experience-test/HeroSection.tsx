import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, Star, MapPin, Share, Heart, CheckCircle } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import BookingPanel from "@/components/experience/BookingPanel";

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
  // Booking panel props
  experienceId?: string;
  hotelId?: string;
  minParty?: number;
  maxParty?: number;
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
  onViewDates,
  experienceId,
  hotelId,
  minParty = 2,
  maxParty = 4
}: HeroSectionProps) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);

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
      <div className="pt-20 lg:pt-24">
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

        {/* DESKTOP: Airbnb-style 2-column layout */}
        <div className="hidden lg:block container px-6 xl:px-8">
          <div className="grid grid-cols-[58fr_42fr] gap-6 items-start">
            
            {/* LEFT: Photo Grid - 2x2 same size photos */}
            <div className="relative">
              <div 
                className="grid grid-cols-2 grid-rows-2 gap-2 rounded-xl overflow-hidden"
                style={{ height: '420px' }}
              >
                {displayPhotos.map((photo, index) => (
                  <div
                    key={index}
                    className={`relative cursor-pointer overflow-hidden ${
                      index === 0 ? 'rounded-tl-xl' : ''
                    } ${
                      index === 1 ? 'rounded-tr-xl' : ''
                    } ${
                      index === 2 ? 'rounded-bl-xl' : ''
                    } ${
                      index === 3 ? 'rounded-br-xl' : ''
                    }`}
                    onClick={() => {
                      setCurrentPhotoIndex(index);
                      setIsGalleryOpen(true);
                    }}
                  >
                    <img
                      src={photo || "/placeholder.svg"}
                      alt={`${title} - ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {/* View all photos overlay on last photo */}
                    {index === 3 && photos.length > 4 && (
                      <button
                        className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-sm font-medium hover:bg-black/40 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentPhotoIndex(0);
                          setIsGalleryOpen(true);
                        }}
                      >
                        {lang === 'he' ? 'כל התמונות' : lang === 'en' ? 'View all photos' : 'Voir toutes les photos'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Content + Booking Panel integrated */}
            <div className="flex flex-col">
              {/* Content info section */}
              <div className="space-y-4 pb-5">
                {/* Title */}
                <h1 className="text-2xl font-semibold text-foreground leading-tight">
                  {title}
                </h1>

                {/* Subtitle / Description */}
                {subtitle && (
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                    {subtitle}
                  </p>
                )}

                {/* Rating row */}
                <div className="flex items-center gap-2">
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

                {/* Location */}
                <div className="text-sm text-muted-foreground">
                  {city}
                  {city && categoryName && <span className="mx-1">·</span>}
                  {categoryName}
                </div>

                {/* Share and Save buttons */}
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 text-sm text-foreground hover:bg-muted/50 px-3 py-2 rounded-lg transition-colors">
                    <Share className="h-4 w-4" />
                    <span className="underline font-medium">
                      {lang === 'he' ? 'שתף' : lang === 'en' ? 'Share' : 'Partager'}
                    </span>
                  </button>
                  <button className="flex items-center gap-2 text-sm text-foreground hover:bg-muted/50 px-3 py-2 rounded-lg transition-colors">
                    <Heart className="h-4 w-4" />
                    <span className="underline font-medium">
                      {lang === 'he' ? 'שמור' : lang === 'en' ? 'Save' : 'Enregistrer'}
                    </span>
                  </button>
                </div>

                {/* Separator */}
                <div className="border-t border-border" />

                {/* Host section */}
                {hotelName && (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-base font-medium text-muted-foreground overflow-hidden flex-shrink-0">
                      {hotelImage ? (
                        <img src={hotelImage} alt={hotelName} className="w-full h-full object-cover" />
                      ) : (
                        hotelName.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {lang === 'he' ? `מארח: ${hotelName}` : lang === 'en' ? `Host: ${hotelName}` : `Hôte : ${hotelName}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {lang === 'he' ? 'חוויה מקומית' : lang === 'en' ? 'Local experience' : 'Expérience locale'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Separator */}
                <div className="border-t border-border" />

                {/* Location with icon */}
                {(address || city) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">
                      {address || city}
                    </p>
                  </div>
                )}

                {/* Recent review */}
                {recentReview && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-foreground italic line-clamp-2">
                        "{recentReview.text.substring(0, 80)}{recentReview.text.length > 80 ? '...' : ''}"
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(recentReview.created_at).toLocaleDateString(lang === 'he' ? 'he-IL' : lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Booking Panel - Integrated directly in hero */}
              {experienceId && hotelId && basePrice && (
                <div className="mt-2">
                  <BookingPanel 
                    experienceId={experienceId}
                    hotelId={hotelId}
                    basePrice={basePrice}
                    basePriceType={basePriceType as "fixed" | "per_person" | "per_booking"}
                    currency={currency}
                    minParty={minParty}
                    maxParty={maxParty}
                  />
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
