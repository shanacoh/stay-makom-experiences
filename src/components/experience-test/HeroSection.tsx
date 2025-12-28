import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, Grid3X3, Star, MapPin, Share, Heart } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface HeroSectionProps {
  photos: string[];
  title: string;
  subtitle?: string;
  hotelName?: string;
  city?: string;
  averageRating?: number | null;
  reviewsCount?: number;
  lang: 'en' | 'he' | 'fr';
  children?: React.ReactNode;
}

const HeroSection = ({ 
  photos, 
  title, 
  subtitle,
  hotelName,
  city,
  averageRating,
  reviewsCount = 0,
  lang,
  children 
}: HeroSectionProps) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const displayPhotos = photos.slice(0, 5);

  const handlePrevious = () => {
    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = () => {
    setCurrentPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
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
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                  {hotelName.charAt(0)}
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
            
            {/* LEFT: Photo Grid - 1 large + 4 small layout like Airbnb */}
            <div className="relative">
              <div className="grid grid-cols-4 grid-rows-2 gap-1.5 rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 140px)', maxHeight: '520px' }}>
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
                
                {/* 4 smaller photos on the right */}
                {displayPhotos.slice(1, 5).map((photo, index) => (
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
                  </div>
                ))}
              </div>
              
              {/* View all photos button - prominent like Airbnb */}
              {photos.length > 5 && (
                <button
                  className="absolute bottom-4 right-4 bg-background text-foreground text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 shadow-md border border-border hover:bg-muted transition-colors"
                  onClick={() => {
                    setCurrentPhotoIndex(0);
                    setIsGalleryOpen(true);
                  }}
                >
                  <Grid3X3 className="h-4 w-4" />
                  {lang === 'he' ? 'הצג את כל התמונות' : lang === 'en' ? 'View all photos' : 'Voir toutes les photos'}
                </button>
              )}
            </div>

            {/* RIGHT: Title, Description, Host - narrower column */}
            <div className="flex flex-col py-2">
              {/* Title */}
              <h1 className="text-xl font-semibold text-foreground mb-2 leading-tight">
                {title}
              </h1>

              {/* Subtitle */}
              {subtitle && (
                <p className="text-muted-foreground text-sm mb-3 leading-relaxed line-clamp-2">
                  {subtitle}
                </p>
              )}

              {/* Rating, Reviews, Location row */}
              <div className="flex items-center gap-1.5 text-sm mb-3 flex-wrap">
                {averageRating && (
                  <>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
                      <span className="font-medium">{averageRating.toFixed(1)}</span>
                    </div>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground underline cursor-pointer text-xs">
                      {reviewsCount} {lang === 'he' ? 'ביקורות' : lang === 'en' ? 'reviews' : 'avis'}
                    </span>
                    <span className="text-muted-foreground">·</span>
                  </>
                )}
                {city && (
                  <span className="text-muted-foreground text-xs">{city}</span>
                )}
              </div>

              {/* Share and Save buttons */}
              <div className="flex items-center gap-3 mb-3">
                <button className="flex items-center gap-1.5 text-xs text-foreground hover:text-foreground/80 transition-colors">
                  <Share className="h-3.5 w-3.5" />
                  <span className="underline">
                    {lang === 'he' ? 'שתף' : lang === 'en' ? 'Share' : 'Partager'}
                  </span>
                </button>
                <button className="flex items-center gap-1.5 text-xs text-foreground hover:text-foreground/80 transition-colors">
                  <Heart className="h-3.5 w-3.5" />
                  <span className="underline">
                    {lang === 'he' ? 'שמור' : lang === 'en' ? 'Save' : 'Enregistrer'}
                  </span>
                </button>
              </div>

              {/* Separator */}
              <div className="border-t border-border my-2" />

              {/* Host info */}
              {hotelName && (
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                    {hotelName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {lang === 'he' ? `מאת: ${hotelName}` : lang === 'en' ? `Hosted by ${hotelName}` : `Hôte : ${hotelName}`}
                    </p>
                    {city && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {city}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Right side content slot (booking panel preview) */}
              {children}
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
