import { X } from "lucide-react";

interface ExperienceDetailsProps {
  longCopy?: string | null;
  includes?: string[] | null;
  notIncludes?: string[] | null;
  goodToKnow?: string[] | null;
}

const ExperienceDetails = ({
  longCopy,
  includes,
  notIncludes,
  goodToKnow,
}: ExperienceDetailsProps) => {
  return (
    <div className="space-y-12">
      {longCopy && (
        <div>
          <h2 className="font-serif text-3xl font-bold mb-4">What you'll do</h2>
          <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
            {longCopy}
          </p>
        </div>
      )}

      {includes && includes.length > 0 && (
        <div>
          <h2 className="font-serif text-3xl font-bold mb-6">L'expérience Staycation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {includes.map((item, index) => (
              <div key={index} className="space-y-3">
                <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop`}
                    alt={item}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-base">
                  <span className="font-semibold">Inclus</span> {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notIncludes && notIncludes.length > 0 && (
        <div>
          <h3 className="font-serif text-xl font-bold mb-4">Not included</h3>
          <ul className="space-y-3">
            {notIncludes.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <X className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {goodToKnow && goodToKnow.length > 0 && (
        <div>
          <h3 className="font-serif text-xl font-bold mb-4">Good to know</h3>
          <ul className="space-y-2">
            {goodToKnow.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExperienceDetails;
