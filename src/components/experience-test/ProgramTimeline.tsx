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
    <section className="py-8 border-b border-border">
      <h2 className="text-2xl font-bold mb-6">
        {lang === "he" ? "מה בתכנית" : lang === "en" ? "What's on the program" : "Au programme"}
      </h2>

      <div className="space-y-0">
        {sortedIncludes.map((item, index) => {
          const title = getLocalizedField(item, "title", lang) as string || item.title;
          const description = getLocalizedField(item, "description", lang) as string || item.description;

          return (
            <div key={item.id} className="flex gap-4 relative">
              {/* Timeline line */}
              {index < sortedIncludes.length - 1 && (
                <div className="absolute left-5 top-12 w-0.5 h-[calc(100%-24px)] bg-border" />
              )}

              {/* Step number circle */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg z-10">
                {index + 1}
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <h3 className="font-semibold text-lg mb-1">{title}</h3>
                {description && (
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {description}
                  </p>
                )}
                
                {/* Optional image */}
                {item.icon_url && item.icon_url.startsWith("http") && (
                  <div className="mt-3 rounded-lg overflow-hidden max-w-md">
                    <img
                      src={item.icon_url}
                      alt={title}
                      className="w-full h-48 object-cover"
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
