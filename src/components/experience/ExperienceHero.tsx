import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
interface ExperienceHeroProps {
  title: string;
  subtitle?: string | null;
  hotelName?: string | null;
  photos: string[];
}
const ExperienceHero = ({
  title,
  subtitle,
  hotelName,
  photos
}: ExperienceHeroProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayPhotos = photos.length > 0 ? photos : ["/placeholder.svg"];
  const goToPrevious = () => {
    setCurrentIndex(prev => prev === 0 ? displayPhotos.length - 1 : prev - 1);
  };
  const goToNext = () => {
    setCurrentIndex(prev => prev === displayPhotos.length - 1 ? 0 : prev + 1);
  };
  return <div className="relative w-full h-screen min-h-[600px] bg-black">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={displayPhotos[currentIndex]} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Image Navigation */}
      {displayPhotos.length > 1 && <>
          <Button variant="secondary" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full z-20 bg-white/90 hover:bg-white" onClick={goToPrevious}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button variant="secondary" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full z-20 bg-white/90 hover:bg-white" onClick={goToNext}>
            <ChevronRight className="h-6 w-6" />
          </Button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {displayPhotos.map((_, index) => <button key={index} onClick={() => setCurrentIndex(index)} className={`h-2 rounded-full transition-all ${index === currentIndex ? "bg-white w-8" : "bg-white/60 w-2 hover:bg-white/80"}`} aria-label={`Go to image ${index + 1}`} />)}
          </div>
        </>}

      {/* Content Overlay - Desktop */}
      <div className="hidden lg:block absolute inset-0 z-10">
        <div className="container h-full flex items-end pb-20">
          <div className="max-w-2xl">
            {/* Content */}
            <div className="space-y-4 text-white">
              {hotelName && <p className="text-sm uppercase tracking-wider font-medium opacity-90">
                  {hotelName}
                </p>}
              <h1 className="font-serif text-5xl xl:text-6xl leading-tight" style={{
              textShadow: '0 2px 12px rgba(0,0,0,0.4)'
            }}>
                {title}
              </h1>
              {subtitle && <p className="text-xl xl:text-2xl font-light opacity-95" style={{
              textShadow: '0 2px 8px rgba(0,0,0,0.4)'
            }}>
                  {subtitle}
                </p>}
            </div>
          </div>
        </div>
      </div>

      {/* Content Overlay - Mobile/Tablet */}
      <div className="lg:hidden absolute inset-0 z-10">
        <div className="container h-full flex items-end pb-12">
          <div className="space-y-3">
            {hotelName && <p className="text-xs uppercase tracking-wider font-medium text-white opacity-90">
                {hotelName}
              </p>}
            <h1 className="font-serif text-3xl sm:text-4xl leading-tight text-white" style={{
              textShadow: '0 2px 12px rgba(0,0,0,0.4)'
            }}>
              {title}
            </h1>
            {subtitle && <p className="text-lg sm:text-xl font-light text-white opacity-95" style={{
              textShadow: '0 2px 8px rgba(0,0,0,0.4)'
            }}>
                {subtitle}
              </p>}
          </div>
        </div>
      </div>
    </div>;
};
export default ExperienceHero;