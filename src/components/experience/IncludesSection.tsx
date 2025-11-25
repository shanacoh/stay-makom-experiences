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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {includes.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:shadow-md transition-shadow"
          >
            <div className="shrink-0">
              {item.icon_url ? (
                <img src={item.icon_url} alt="" className="w-10 h-10 object-contain rounded" />
              ) : (
                <CheckCircle className="w-10 h-10 text-primary" />
              )}
            </div>
            <h3 className="font-semibold text-sm leading-tight">{item.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncludesSection;
