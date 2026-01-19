import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

interface GalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photos: string[];
  title: string;
  initialIndex?: number;
}

const GalleryModal = ({ open, onOpenChange, photos, title, initialIndex = 0 }: GalleryModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    startIndex: initialIndex,
    skipSnaps: false,
  });

  // Update current index when carousel scrolls
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Initialize carousel and set up listeners
  useEffect(() => {
    if (!emblaApi) return;
    
    emblaApi.on("select", onSelect);
    onSelect();
    
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Scroll to initial index when modal opens
  useEffect(() => {
    if (open && emblaApi) {
      emblaApi.scrollTo(initialIndex, true);
      setCurrentIndex(initialIndex);
    }
  }, [open, emblaApi, initialIndex]);

  // Reset loaded images when modal opens
  useEffect(() => {
    if (open) {
      setLoadedImages(new Set());
    }
  }, [open]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      } else if (e.key === "ArrowLeft") {
        emblaApi?.scrollPrev();
      } else if (e.key === "ArrowRight") {
        emblaApi?.scrollNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange, emblaApi]);

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set([...prev, index]));
  };

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  if (photos.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed inset-0 left-0 top-0 w-full h-full max-w-none m-0 p-0 bg-black border-none rounded-none translate-x-0 translate-y-0 data-[state=open]:slide-in-from-bottom-0 data-[state=closed]:slide-out-to-bottom-0"
        hideCloseButton
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <span className="text-white font-medium text-sm">
              {currentIndex + 1} / {photos.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="text-white hover:bg-white/20 h-10 w-10"
            aria-label="Close gallery"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Carousel Container */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="overflow-hidden w-full h-full" ref={emblaRef}>
            <div className="flex h-full">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="flex-[0_0_100%] min-w-0 h-full flex items-center justify-center px-4 md:px-16"
                >
                  {/* Loading placeholder */}
                  {!loadedImages.has(index) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                  )}

                  <img
                    src={photo}
                    alt={`${title} - Photo ${index + 1}`}
                    className={`max-h-[85vh] max-w-[90vw] object-contain transition-opacity duration-300 ${
                      loadedImages.has(index) ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={() => handleImageLoad(index)}
                    loading={Math.abs(index - currentIndex) <= 1 ? "eager" : "lazy"}
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-7 w-7 md:h-8 md:w-8" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all"
              aria-label="Next photo"
            >
              <ChevronRight className="h-7 w-7 md:h-8 md:w-8" />
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GalleryModal;
