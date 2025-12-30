import { getLocalizedField, type Language } from "@/hooks/useLanguage";

interface IncludeItem {
  id: string;
  title: string;
  title_he?: string;
  description?: string;
  description_he?: string;
  icon_url?: string;
  order_index: number;
}

interface ProgramTimelineProps {
  includes: IncludeItem[];
  lang?: Language;
  introText?: string;
}

const ProgramTimeline = ({ includes, lang = "en", introText }: ProgramTimelineProps) => {
  if (!includes || includes.length === 0) return null;

  const sortedIncludes = [...includes].sort((a, b) => a.order_index - b.order_index);

  return (
    <section className="py-6 border-b border-border">
      <h2 className="text-lg font-serif font-bold mb-3">
        {lang === "he" ? "מה בתכנית" : lang === "fr" ? "Au programme" : "What's on the program"}
      </h2>

      {/* Introduction text */}
      {introText && (
        <p className="text-foreground text-sm leading-relaxed mb-4">
          {introText}
        </p>
      )}

      {/* Program items - Airbnb style with vertical timeline */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-[40px] top-3 bottom-3 w-px bg-border" />
        
        <div className="space-y-4">
          {sortedIncludes.map((item, index) => {
            const title = getLocalizedField(item, "title", lang) as string || item.title;
            const description = getLocalizedField(item, "description", lang) as string || item.description;

            return (
              <div key={item.id} className="flex items-center gap-4">
                {/* Square image on the left - SMALLER */}
                {item.icon_url && item.icon_url.startsWith("http") ? (
                  <div className="relative flex-shrink-0 w-[80px] h-[80px] rounded-lg overflow-hidden bg-muted z-10">
                    <img
                      src={item.icon_url}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative flex-shrink-0 w-[80px] h-[80px] rounded-lg bg-muted flex items-center justify-center z-10">
                    <span className="text-2xl text-muted-foreground">📋</span>
                  </div>
                )}

                {/* Content on the right - centered vertically, max 3 lines */}
                <div className="flex-1 max-w-md">
                  <h3 className="font-semibold text-foreground text-sm mb-0.5">{title}</h3>
                  {description && (
                    <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3">
                      {description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProgramTimeline;
