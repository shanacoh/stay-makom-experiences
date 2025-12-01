import { useSearchParams } from "react-router-dom";

export type Language = "en" | "he" | "fr";

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
  
  // For French, check if *_fr field exists and has value
  if (lang === "fr") {
    const frField = `${fieldName}_fr`;
    if (frField in obj && obj[frField] != null) {
      return obj[frField];
    }
  }
  
  // Fall back to base field (English) - check both patterns
  // Pattern 1: base field name (e.g., "title")
  if (fieldName in obj && obj[fieldName] != null) {
    return obj[fieldName];
  }
  
  // Pattern 2: _en suffix (e.g., "title_en")
  const enField = `${fieldName}_en`;
  if (enField in obj && obj[enField] != null) {
    return obj[enField];
  }
  
  return null;
};
