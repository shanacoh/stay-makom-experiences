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
}

const ProgramTimeline = ({ includes, lang = "en" }: ProgramTimelineProps) => {
  if (!includes || includes.length === 0) return null;

  const sortedIncludes = [...includes].sort((a, b) => a.order_index - b.order_index);

  return (
    <section className="py-6 border-b border-border">
      <h2 className="text-lg font-bold mb-4">
        {lang === "he" ? "מה בתכנית" : lang === "en" ? "What's on the program" : "Au programme"}
      </h2>

      <div className="space-y-0">
        {sortedIncludes.map((item, index) => {
          const title = getLocalizedField(item, "title", lang) as string || item.title;
          const description = getLocalizedField(item, "description", lang) as string || item.description;

          return (
            <div key={item.id} className="flex gap-3 relative">
              {/* Timeline line */}
              {index < sortedIncludes.length - 1 && (
                <div className="absolute left-3 top-8 w-0.5 h-[calc(100%-16px)] bg-border" />
              )}

              {/* Step number circle */}
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-xs z-10">
                {index + 1}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <h3 className="font-medium text-sm mb-0.5">{title}</h3>
                {description && (
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {description}
                  </p>
                )}
                
                {/* Optional image - reduced size */}
                {item.icon_url && item.icon_url.startsWith("http") && (
                  <div className="mt-2 rounded-md overflow-hidden max-w-xs">
                    <img
                      src={item.icon_url}
                      alt={title}
                      className="w-full h-28 object-cover"
                    />
                  </div>
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
