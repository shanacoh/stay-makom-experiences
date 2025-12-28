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

  const displayPhotos = photos.slice(0, 5);
  const hasMorePhotos = photos.length > 5;

  const handlePrevious = () => {
    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = () => {
    setCurrentPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
      {/* Photo Grid - Airbnb style */}
      <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] w-full">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-full">
          {/* Main large photo */}
          <div
            className="col-span-2 row-span-2 relative cursor-pointer overflow-hidden rounded-l-xl"
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

          {/* Right side photos */}
          {displayPhotos.slice(1, 5).map((photo, index) => (
            <div
              key={index}
              className={`relative cursor-pointer overflow-hidden ${
                index === 1 ? "rounded-tr-xl" : ""
              } ${index === 3 ? "rounded-br-xl" : ""}`}
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
              {index === 3 && hasMorePhotos && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPhotoIndex(0);
                      setIsGalleryOpen(true);
                    }}
                  >
                    <Grid3X3 className="h-4 w-4" />
                    {photos.length} photos
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Floating show all button */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-4 right-4 gap-2 shadow-lg"
          onClick={() => {
            setCurrentPhotoIndex(0);
            setIsGalleryOpen(true);
          }}
        >
          <Grid3X3 className="h-4 w-4" />
          Voir toutes les photos
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
