import { Check, X } from "lucide-react";

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
    <div className="space-y-8">
      {longCopy && (
        <div>
          <h2 className="font-serif text-3xl font-bold mb-4">What you'll do</h2>
          <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
            {longCopy}
          </p>
        </div>
      )}

      {(includes || notIncludes) && (
        <div className="grid md:grid-cols-2 gap-8">
          {includes && includes.length > 0 && (
            <div>
              <h3 className="font-serif text-xl font-bold mb-4">What's included</h3>
              <ul className="space-y-3">
                {includes.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
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
