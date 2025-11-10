import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExperienceHeroProps {
  title: string;
  subtitle?: string | null;
  photos: string[];
}

const ExperienceHero = ({ title, subtitle, photos }: ExperienceHeroProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const displayPhotos = photos.length > 0 ? photos : ["/placeholder.svg"];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayPhotos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === displayPhotos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="container pt-24 pb-8">
      <div className="mb-6">
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">{title}</h1>
        {subtitle && <p className="text-xl text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="relative aspect-[21/9] rounded-xl overflow-hidden bg-muted">
        <img
          src={displayPhotos[currentIndex]}
          alt={`${title} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
        
        {displayPhotos.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full"
              onClick={goToNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {displayPhotos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? "bg-white w-6" : "bg-white/60"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExperienceHero;
