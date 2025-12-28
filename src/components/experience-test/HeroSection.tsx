import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, Grid3X3, Star, MapPin, Share, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  photos: string[];
  title: string;
  subtitle?: string;
  hotelName?: string;
  city?: string;
  averageRating?: number | null;
  reviewsCount?: number;
  lang: 'en' | 'he' | 'fr';
  children: React.ReactNode; // Right side content (booking panel info)
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

  const displayPhotos = photos.slice(0, 4);

  const handlePrevious = () => {
    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = () => {
    setCurrentPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
      <div className="container py-6 px-4 sm:px-6">
        {/* Airbnb-style layout: Photos left, Content right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* LEFT: 2x2 Photo Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-2 aspect-square">
              {displayPhotos.map((photo, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer overflow-hidden ${
                    index === 0 ? "rounded-tl-xl" : ""
                  } ${index === 1 ? "rounded-tr-xl" : ""} ${
                    index === 2 ? "rounded-bl-xl" : ""
                  } ${index === 3 ? "rounded-br-xl" : ""}`}
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
                  
                  {/* Show all photos button on last photo */}
                  {index === 3 && photos.length > 4 && (
                    <button
                      className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md hover:bg-background transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPhotoIndex(0);
                        setIsGalleryOpen(true);
                      }}
                    >
                      <Grid3X3 className="h-3.5 w-3.5" />
                      {photos.length} photos
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Title, Description, Host, Price */}
          <div className="flex flex-col">
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {title}
            </h1>

            {/* Subtitle / Short description */}
            {subtitle && (
              <p className="text-muted-foreground text-sm md:text-base mb-4 leading-relaxed">
                {subtitle}
              </p>
            )}

            {/* Rating, Reviews, Location row */}
            <div className="flex items-center gap-2 text-sm mb-4 flex-wrap">
              {averageRating && (
                <>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-foreground text-foreground" />
                    <span className="font-semibold">{averageRating.toFixed(2)}</span>
                  </div>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground underline cursor-pointer">
                    {reviewsCount} {lang === 'he' ? 'ביקורות' : lang === 'en' ? 'reviews' : 'évaluations'}
                  </span>
                  <span className="text-muted-foreground">·</span>
                </>
              )}
              {city && (
                <span className="text-muted-foreground">{city}</span>
              )}
            </div>

            {/* Share and Save buttons */}
            <div className="flex items-center gap-4 mb-6">
              <button className="flex items-center gap-2 text-sm text-foreground hover:text-foreground/80 transition-colors">
                <Share className="h-4 w-4" />
                <span className="underline font-medium">
                  {lang === 'he' ? 'שתף' : lang === 'en' ? 'Share' : 'Partager'}
                </span>
              </button>
              <button className="flex items-center gap-2 text-sm text-foreground hover:text-foreground/80 transition-colors">
                <Heart className="h-4 w-4" />
                <span className="underline font-medium">
                  {lang === 'he' ? 'שמור' : lang === 'en' ? 'Save' : 'Enregistrer'}
                </span>
              </button>
            </div>

            {/* Separator */}
            <div className="border-t border-border my-4" />

            {/* Host info */}
            {hotelName && (
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground">
                  {hotelName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {lang === 'he' ? `מאת: ${hotelName}` : lang === 'en' ? `Hosted by ${hotelName}` : `Hôte : ${hotelName}`}
                  </p>
                  {city && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {city}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Right side content slot (booking panel preview, CTA, etc.) */}
            {children}
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
              <X className="h-6 w-6" />
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
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronRight className="h-8 w-8" />
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
