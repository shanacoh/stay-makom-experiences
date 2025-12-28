import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoGridProps {
  photos: string[];
  title: string;
}

const PhotoGrid = ({ photos, title }: PhotoGridProps) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const displayPhotos = photos.slice(0, 4);
  const hasMorePhotos = photos.length > 4;

  const handlePrevious = () => {
    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = () => {
    setCurrentPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
      {/* Photo Grid - Compact Airbnb style */}
      <div className="relative h-[32vh] md:h-[38vh] w-full">
        <div className="grid grid-cols-4 gap-1 h-full">
          {/* Main large photo - 2 cols */}
          <div
            className="col-span-2 relative cursor-pointer overflow-hidden rounded-l-lg"
            onClick={() => {
              setCurrentPhotoIndex(0);
              setIsGalleryOpen(true);
            }}
          >
            <img
              src={displayPhotos[0] || "/placeholder.svg"}
              alt={title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Right side - 2x2 grid */}
          <div className="col-span-2 grid grid-cols-2 grid-rows-2 gap-1">
            {displayPhotos.slice(1, 5).map((photo, index) => (
              <div
                key={index}
                className={`relative cursor-pointer overflow-hidden ${
                  index === 1 ? "rounded-tr-lg" : ""
                } ${index === 3 ? "rounded-br-lg" : ""}`}
                onClick={() => {
                  setCurrentPhotoIndex(index + 1);
                  setIsGalleryOpen(true);
                }}
              >
                <img
                  src={photo}
                  alt={`${title} - ${index + 2}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {/* Show all photos button on last visible photo */}
                {index === 2 && hasMorePhotos && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPhotoIndex(0);
                        setIsGalleryOpen(true);
                      }}
                    >
                      <Grid3X3 className="h-3 w-3" />
                      {photos.length}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Floating show all button */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-3 right-3 gap-1.5 text-xs shadow-lg"
          onClick={() => {
            setCurrentPhotoIndex(0);
            setIsGalleryOpen(true);
          }}
        >
          <Grid3X3 className="h-3 w-3" />
          {photos.length} photos
        </Button>
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

export default PhotoGrid;
