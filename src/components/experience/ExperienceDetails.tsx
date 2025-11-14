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
  goodToKnow
}: ExperienceDetailsProps) => {
  return <div className="space-y-12">
      {longCopy && <div>
          <h2 className="font-sans text-3xl font-bold mb-4">What you'll do</h2>
          <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
            {longCopy}
          </p>
        </div>}

      {includes && includes.length > 0 && <div>
          <h2 className="font-sans text-3xl font-bold mb-6">What's included ?            </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {includes.map((item, index) => <div key={index} className="space-y-3">
                <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                  <img src={`https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop`} alt={item} className="w-full h-full object-cover" />
                </div>
                <p className="text-base">
                  <span className="font-semibold">Inclus</span> {item}
                </p>
              </div>)}
          </div>
        </div>}

      {notIncludes && notIncludes.length > 0}

      {goodToKnow && goodToKnow.length > 0 && <div>
          
          <ul className="space-y-2">
            {goodToKnow.map((item, index) => {})}
          </ul>
        </div>}
    </div>;
};
export default ExperienceDetails;