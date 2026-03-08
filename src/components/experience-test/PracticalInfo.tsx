import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Clock, MapPin, Calendar, AlertCircle, Accessibility, Sun, Globe, Timer } from "lucide-react";
import { icons } from "lucide-react";
import { getLocalizedField, type Language } from "@/hooks/useLanguage";

interface Experience {
  id: string;
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
  min_nights?: number;
  max_nights?: number;
}

interface PracticalInfoProps {
  experience: Experience;
  lang?: Language;
}

const iconMap: Record<string, any> = {
  Users, Clock, MapPin, Calendar, AlertCircle, Accessibility, Sun, Globe, Timer,
};

const PracticalInfo = ({ experience, lang = "en" }: PracticalInfoProps) => {
  const { data: customItems } = useQuery({
    queryKey: ["experience2-practical-info", experience.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("experience2_practical_info")
        .select("*")
        .eq("experience_id", experience.id)
        .eq("is_visible", true)
        .order("order_index");
      if (error) throw error;
      return data || [];
    },
    enabled: !!experience.id,
  });

  // Build default items from experience fields
  const defaultItems = [
    {
      icon: "Clock",
      label: lang === "he" ? "משך" : "Duration",
      value: getLocalizedField(experience, "duration", lang) as string || experience.duration,
    },
    {
      icon: "Users",
      label: lang === "he" ? "גודל קבוצה" : "Group size",
      value: experience.min_party && experience.max_party
        ? `${experience.min_party} – ${experience.max_party} ${lang === "he" ? "אנשים" : "guests"}`
        : null,
    },
    {
      icon: "Timer",
      label: lang === "he" ? "זמן הזמנה מראש" : "Booking lead time",
      value: experience.lead_time_days && experience.lead_time_days > 0
        ? (lang === "he" ? `${experience.lead_time_days} ימים מראש` : `${experience.lead_time_days} days in advance`)
        : null,
    },
    {
      icon: "Calendar",
      label: lang === "he" ? "צ'ק-אין / צ'ק-אאוט" : "Check-in / Check-out",
      value: experience.checkin_time && experience.checkout_time
        ? `${experience.checkin_time} – ${experience.checkout_time}`
        : null,
    },
    {
      icon: "MapPin",
      label: lang === "he" ? "מיקום" : "Location",
      value: getLocalizedField(experience, "address", lang) as string || experience.address,
    },
    {
      icon: "Accessibility",
      label: lang === "he" ? "נגישות" : "Accessibility",
      value: getLocalizedField(experience, "accessibility_info", lang) as string || experience.accessibility_info,
    },
    {
      icon: "AlertCircle",
      label: lang === "he" ? "מדיניות ביטול" : "Cancellation policy",
      value: getLocalizedField(experience, "cancellation_policy", lang) as string || experience.cancellation_policy,
    },
  ].filter(item => item.value);

  const hasCustomItems = customItems && customItems.length > 0;

  const displayItems = hasCustomItems
    ? customItems.map((item: any) => ({
        icon: item.icon || "AlertCircle",
        label: lang === "he" ? (item.label_he || item.label) : item.label,
        value: lang === "he" ? (item.value_he || item.value) : item.value,
      }))
    : defaultItems;

  if (displayItems.length === 0) return null;

  const getIcon = (iconName: string) => {
    if (iconMap[iconName]) return iconMap[iconName];
    const LucideIcon = icons[iconName as keyof typeof icons];
    return LucideIcon || AlertCircle;
  };

  return (
    <section className="py-8">
      <div className="h-px bg-border/60 mb-8" />
      <h2 className="font-serif text-[20px] md:text-2xl font-bold uppercase tracking-wide text-foreground mb-6">
        {lang === "he" ? "חשוב לדעת" : "THINGS TO KNOW"}
      </h2>

      <div className="grid grid-cols-2 gap-0">
        {displayItems.map((item: any, index: number) => {
          const IconComp = getIcon(item.icon);
          // Add separator styling: border-bottom except last row, border-right on left column
          const isLeftCol = index % 2 === 0;
          const isLastRow = index >= displayItems.length - (displayItems.length % 2 === 0 ? 2 : (index === displayItems.length - 1 ? 1 : 2));
          return (
            <div
              key={index}
              className={`flex items-start gap-3 py-4 px-3 min-h-[52px] ${
                !isLastRow ? "border-b border-border/40" : ""
              } ${isLeftCol ? "border-r border-border/40" : ""}`}
            >
              <IconComp className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-[14px] md:text-sm font-medium text-foreground mt-0.5 leading-snug">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PracticalInfo;
