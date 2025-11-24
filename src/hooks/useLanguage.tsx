import { useSearchParams } from "react-router-dom";

export type Language = "en" | "he";

export const useLanguage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const lang: Language = (searchParams.get("lang") as Language) || "en";
  
  const setLanguage = (newLang: Language) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("lang", newLang);
      return params;
    });
  };
  
  const toggleLanguage = () => {
    setLanguage(lang === "en" ? "he" : "en");
  };
  
  return { lang, setLanguage, toggleLanguage };
};

// Helper to get localized field value
export const getLocalizedField = <T extends Record<string, any>>(
  obj: T | null | undefined,
  fieldName: string,
  lang: Language
): string | string[] | null => {
  if (!obj) return null;
  
  // For Hebrew, check if *_he field exists and has value
  if (lang === "he") {
    const heField = `${fieldName}_he`;
    if (heField in obj && obj[heField] != null) {
      return obj[heField];
    }
  }
  
  // Fall back to base field (English)
  return obj[fieldName] ?? null;
};
