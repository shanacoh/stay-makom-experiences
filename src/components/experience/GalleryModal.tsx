import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface GalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photos: string[];
  title: string;
}

const GalleryModal = ({ open, onOpenChange, photos, title }: GalleryModalProps) => {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set([...prev, index]));
  };

  if (photos.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed inset-0 left-0 top-0 w-full h-full max-w-none m-0 p-0 bg-black border-none rounded-none translate-x-0 translate-y-0 data-[state=open]:slide-in-from-bottom-0 data-[state=closed]:slide-out-to-bottom-0"
        hideCloseButton
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center gap-3">
            <h2 className="text-white font-medium text-sm md:text-base truncate max-w-[200px] md:max-w-none">
              {title}
            </h2>
            <span className="text-white/60 text-sm">{photos.length} photos</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="text-white hover:bg-white/10 h-10 w-10"
            aria-label="Close gallery"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Image Container */}
        <div className="overflow-y-auto h-[calc(100vh-56px)] pb-8">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative w-full flex items-center justify-center bg-black/50 rounded-lg overflow-hidden"
              >
                {/* Loading placeholder */}
                {!loadedImages.has(index) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  </div>
                )}

                <img
                  src={photo}
                  alt={`${title} - Photo ${index + 1}`}
                  className={`w-full h-auto max-h-[80vh] object-contain transition-opacity duration-300 ${
                    loadedImages.has(index) ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => handleImageLoad(index)}
                  loading={index < 3 ? "eager" : "lazy"}
                />

                {/* Photo number indicator */}
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 rounded text-white/80 text-xs">
                  {index + 1} / {photos.length}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryModal;
