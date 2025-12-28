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
    <section className="py-8 border-b border-border">
      <h2 className="text-xl font-bold mb-4">
        {lang === "he" ? "מה בתכנית" : lang === "fr" ? "Au programme" : "What's on the program"}
      </h2>

      {/* Introduction text */}
      {introText && (
        <p className="text-foreground leading-relaxed mb-6">
          {introText}
        </p>
      )}

      {/* Program items - Airbnb style with image + title + description */}
      <div className="space-y-6">
        {sortedIncludes.map((item) => {
          const title = getLocalizedField(item, "title", lang) as string || item.title;
          const description = getLocalizedField(item, "description", lang) as string || item.description;

          return (
            <div key={item.id} className="flex gap-4">
              {/* Square image on the left */}
              {item.icon_url && item.icon_url.startsWith("http") ? (
                <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={item.icon_url}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-2xl text-muted-foreground">📋</span>
                </div>
              )}

              {/* Content on the right */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                {description && (
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ProgramTimeline;
