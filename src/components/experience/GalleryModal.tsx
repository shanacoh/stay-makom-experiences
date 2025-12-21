import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface GalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photos: string[];
  title: string;
}

const GalleryModal = ({ open, onOpenChange, photos, title }: GalleryModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const goToPrevious = useCallback(() => {
    setIsLoading(true);
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }, [photos.length]);

  const goToNext = useCallback(() => {
    setIsLoading(true);
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }, [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, goToPrevious, goToNext, onOpenChange]);

  // Auto-scroll to active thumbnail
  useEffect(() => {
    const activeThumbnail = thumbnailRefs.current[currentIndex];
    if (activeThumbnail) {
      activeThumbnail.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentIndex]);

  // Reset loading state when image loads
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // Reset index when modal opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
      setIsLoading(false);
    }
  }, [open]);

  if (photos.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-7xl w-[95vw] h-[90vh] p-0 bg-black border-none gap-0 [&>button]:hidden"
        aria-label={`${title} photo gallery`}
      >
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex justify-end p-3 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-white/10 hover:bg-white/20 text-white h-10 w-10"
              onClick={() => onOpenChange(false)}
              aria-label="Close gallery"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Main image area - FIXED HEIGHT */}
          <div className="flex-1 relative flex items-center justify-center px-4 md:px-16 min-h-0">
            {/* Left Arrow */}
            {photos.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 hover:bg-white/20 text-white h-10 w-10 md:h-12 md:w-12"
                onClick={goToPrevious}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
              </Button>
            )}

            {/* Image container with fixed aspect */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={photos[currentIndex]}
                alt={`${title} - Photo ${currentIndex + 1} of ${photos.length}`}
                className={`max-w-full max-h-full object-contain transition-opacity duration-200 ${
                  isLoading ? "opacity-0" : "opacity-100"
                }`}
                onLoad={handleImageLoad}
                draggable={false}
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Right Arrow */}
            {photos.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 hover:bg-white/20 text-white h-10 w-10 md:h-12 md:w-12"
                onClick={goToNext}
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
              </Button>
            )}
          </div>

          {/* Footer with thumbnails and counter */}
          <div className="shrink-0 p-3 md:p-4 space-y-3">
            {/* Thumbnails */}
            {photos.length > 1 && (
              <div className="flex justify-center">
                <div className="flex gap-1.5 md:gap-2 overflow-x-auto max-w-full px-2 py-1 scrollbar-hide">
                  {photos.map((photo, index) => (
                    <button
                      key={index}
                      ref={(el) => (thumbnailRefs.current[index] = el)}
                      onClick={() => {
                        if (index !== currentIndex) {
                          setIsLoading(true);
                          setCurrentIndex(index);
                        }
                      }}
                      className={`shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-md overflow-hidden transition-all duration-200 ${
                        index === currentIndex
                          ? "ring-2 ring-white ring-offset-1 ring-offset-black scale-105"
                          : "opacity-50 hover:opacity-80"
                      }`}
                      aria-label={`View image ${index + 1}`}
                      aria-current={index === currentIndex ? "true" : undefined}
                    >
                      <img
                        src={photo}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Counter */}
            <div className="text-center text-white/80 text-sm font-medium">
              {currentIndex + 1} / {photos.length}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryModal;
