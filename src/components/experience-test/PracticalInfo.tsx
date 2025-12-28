import { Users, Clock, MapPin, Calendar, AlertCircle, Accessibility } from "lucide-react";
import { getLocalizedField, type Language } from "@/hooks/useLanguage";

interface Experience {
  min_party?: number;
  max_party?: number;
  duration?: string;
  duration_he?: string;
  checkin_time?: string;
  checkout_time?: string;
  address?: string;
  address_he?: string;
  accessibility_info?: string;
  accessibility_info_he?: string;
  cancellation_policy?: string;
  cancellation_policy_he?: string;
  lead_time_days?: number;
}

interface PracticalInfoProps {
  experience: Experience;
  lang?: Language;
}

const PracticalInfo = ({ experience, lang = "en" }: PracticalInfoProps) => {
  const duration = getLocalizedField(experience, "duration", lang) as string || experience.duration;
  const address = getLocalizedField(experience, "address", lang) as string || experience.address;
  const accessibilityInfo = getLocalizedField(experience, "accessibility_info", lang) as string || experience.accessibility_info;
  const cancellationPolicy = getLocalizedField(experience, "cancellation_policy", lang) as string || experience.cancellation_policy;

  const infoItems = [
    {
      icon: Users,
      label: lang === "he" ? "גודל קבוצה" : lang === "en" ? "Group size" : "Taille du groupe",
      value: experience.min_party && experience.max_party
        ? `${experience.min_party} - ${experience.max_party} ${lang === "he" ? "אנשים" : lang === "en" ? "people" : "personnes"}`
        : null,
    },
    {
      icon: Clock,
      label: lang === "he" ? "משך" : lang === "en" ? "Duration" : "Durée",
      value: duration,
    },
    {
      icon: Calendar,
      label: lang === "he" ? "צ'ק-אין / צ'ק-אאוט" : lang === "en" ? "Check-in / Check-out" : "Arrivée / Départ",
      value: experience.checkin_time && experience.checkout_time
        ? `${experience.checkin_time} - ${experience.checkout_time}`
        : null,
    },
    {
      icon: MapPin,
      label: lang === "he" ? "מיקום" : lang === "en" ? "Location" : "Lieu",
      value: address,
    },
    {
      icon: Accessibility,
      label: lang === "he" ? "נגישות" : lang === "en" ? "Accessibility" : "Accessibilité",
      value: accessibilityInfo,
    },
    {
      icon: AlertCircle,
      label: lang === "he" ? "מדיניות ביטול" : lang === "en" ? "Cancellation policy" : "Conditions d'annulation",
      value: cancellationPolicy,
    },
  ].filter(item => item.value);

  if (infoItems.length === 0) return null;

  return (
    <section className="py-8 border-b border-border">
      <h2 className="text-2xl font-bold mb-6">
        {lang === "he" ? "חשוב לדעת" : lang === "en" ? "Things to know" : "À savoir"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {infoItems.map((item, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <item.icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <div>
              <p className="font-medium text-sm">{item.label}</p>
              <p className="text-muted-foreground text-sm mt-0.5">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lead time notice */}
      {experience.lead_time_days && experience.lead_time_days > 0 && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {lang === "he" 
              ? `יש להזמין לפחות ${experience.lead_time_days} ימים מראש`
              : lang === "en" 
                ? `Book at least ${experience.lead_time_days} days in advance`
                : `Réservez au moins ${experience.lead_time_days} jours à l'avance`
            }
          </p>
        </div>
      )}
    </section>
  );
};

export default PracticalInfo;
