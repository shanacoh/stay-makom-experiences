import { useLanguage, getLocalizedField } from "@/hooks/useLanguage";
import { t } from "@/lib/translations";
import { icons, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Include {
  id: string;
  title: string;
  title_he?: string | null;
  description?: string | null;
  description_he?: string | null;
  icon_url?: string | null;
}

interface WhatsIncludedPhotosProps {
  includes?: Include[] | null;
}

const WhatsIncludedPhotos = ({ includes }: WhatsIncludedPhotosProps) => {
  const { lang } = useLanguage();
  
  // Create placeholder items if fewer than 2
  const displayIncludes = [...(includes || [])];
  while (displayIncludes.length < 2) {
    displayIncludes.push({
      id: `placeholder-${displayIncludes.length}`,
      title: lang === 'he' ? 'יתווסף בקרוב' : 'To be added',
      title_he: 'יתווסף בקרוב',
      description: null,
      description_he: null,
      icon_url: undefined,
    });
  }

  const isImageUrl = (url?: string | null): boolean => {
    return !!url && (url.startsWith('http://') || url.startsWith('https://'));
  };

  const getIconComponent = (iconName?: string | null): LucideIcon => {
    if (!iconName || isImageUrl(iconName)) return Sparkles;
    const IconComponent = icons[iconName as keyof typeof icons];
    return (IconComponent as LucideIcon) || Sparkles;
  };

  return (
    <div className="space-y-4 sm:space-y-6" dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold">
        {t(lang, 'whatsIncluded')}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {displayIncludes.map((item) => {
          const isPlaceholder = item.id.startsWith('placeholder');
          const title = getLocalizedField(item, 'title', lang) as string || item.title;
          const description = getLocalizedField(item, 'description', lang) as string || item.description;
          const hasImageUrl = isImageUrl(item.icon_url);
          const IconComponent = getIconComponent(item.icon_url);
          
          return (
            <div
              key={item.id}
              className={`group flex flex-col ${isPlaceholder ? 'opacity-40' : ''}`}
            >
              {/* Image or Icon Container */}
              <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden flex items-center justify-center mb-3">
                {hasImageUrl ? (
                  <img 
                    src={item.icon_url!} 
                    alt={title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <IconComponent className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-primary" />
                )}
              </div>
              
              {/* Content Container */}
              <div className="flex flex-col flex-1">
                {/* Title - Fixed 2-line height */}
                <h3 className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2 h-8 sm:h-9">
                  {title}
                </h3>
                
                {/* Description */}
                {description && !isPlaceholder && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WhatsIncludedPhotos;
