import { CheckCircle } from "lucide-react";

interface Include {
  id: string;
  title: string;
  description?: string;
  icon_url?: string;
}

interface IncludesSectionProps {
  includes: Include[];
}

const IncludesSection = ({ includes }: IncludesSectionProps) => {
  if (!includes || includes.length === 0) return null;

  return (
    <div className="space-y-6">
      <h2 className="font-sans text-3xl font-bold">What's included</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {includes.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow"
          >
            <div className="shrink-0">
              {item.icon_url ? (
                <img src={item.icon_url} alt="" className="w-12 h-12 object-contain" />
              ) : (
                <CheckCircle className="w-12 h-12 text-primary" />
              )}
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Included
              </div>
              <h3 className="font-semibold text-sm leading-tight">{item.title}</h3>
              {item.description && (
                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncludesSection;
