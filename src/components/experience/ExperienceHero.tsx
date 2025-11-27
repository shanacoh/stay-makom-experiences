import { useState } from "react";
import HeroActionBar from "./HeroActionBar";
import GalleryModal from "./GalleryModal";

interface ExperienceHeroProps {
  title: string;
  subtitle?: string | null;
  hotelName?: string | null;
  heroImage: string;
  galleryPhotos: string[];
}
const ExperienceHero = ({
  title,
  subtitle,
  hotelName,
  heroImage,
  galleryPhotos
}: ExperienceHeroProps) => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const displayHero = heroImage || "/placeholder.svg";
  const displayGallery = galleryPhotos.length > 0 ? galleryPhotos : [displayHero];
  
  return <>
    <div className="relative w-full h-screen min-h-[500px] sm:min-h-[600px] bg-black">
      {/* Background Image - Single hero image */}
      <div className="absolute inset-0">
        <img src={displayHero} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Hero Action Bar */}
      <HeroActionBar 
        onOpenGallery={() => setGalleryOpen(true)}
        experienceTitle={title}
      />

      {/* Content Overlay - Desktop */}
      <div className="hidden lg:block absolute inset-0 z-10">
        <div className="container h-full flex items-end pb-20">
          <div className="max-w-2xl">
            {/* Content */}
            <div className="space-y-4 text-white">
              {hotelName && <p className="text-sm uppercase tracking-wider font-medium opacity-90">
                  {hotelName}
                </p>}
              <h1 className="font-serif text-5xl xl:text-6xl leading-tight text-white" style={{
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
        <div className="container h-full flex items-end pb-8 sm:pb-12 px-4">
          <div className="space-y-2 sm:space-y-3 w-full">
            {hotelName && <p className="text-[10px] sm:text-xs uppercase tracking-wider font-medium text-white opacity-90">
                {hotelName}
              </p>}
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl leading-tight text-white" style={{
              textShadow: '0 2px 12px rgba(0,0,0,0.4)'
            }}>
              {title}
            </h1>
            {subtitle && <p className="text-sm sm:text-base md:text-lg font-light text-white opacity-95 line-clamp-2" style={{
              textShadow: '0 2px 8px rgba(0,0,0,0.4)'
            }}>
                {subtitle}
              </p>}
          </div>
        </div>
      </div>
    </div>

    {/* Gallery Modal - Shows all photos */}
    <GalleryModal 
      open={galleryOpen}
      onOpenChange={setGalleryOpen}
      photos={displayGallery}
      title={title}
    />
  </>;
};
export default ExperienceHero;