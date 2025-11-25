import { useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";

interface SEOHeadProps {
  title?: string;
  titleEn?: string;
  titleHe?: string;
  description?: string;
  descriptionEn?: string;
  descriptionHe?: string;
  ogTitle?: string;
  ogTitleEn?: string;
  ogTitleHe?: string;
  ogDescription?: string;
  ogDescriptionEn?: string;
  ogDescriptionHe?: string;
  ogImage?: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export function SEOHead({
  title,
  titleEn,
  titleHe,
  description,
  descriptionEn,
  descriptionHe,
  ogTitle,
  ogTitleEn,
  ogTitleHe,
  ogDescription,
  ogDescriptionEn,
  ogDescriptionHe,
  ogImage,
  fallbackTitle = "StayMakom - Curated Boutique Experiences in Israel",
  fallbackDescription = "Discover unique boutique hotels and immersive experiences across Israel. From desert escapes to vineyard retreats, find your perfect getaway.",
}: SEOHeadProps) {
  const { lang } = useLanguage();

  useEffect(() => {
    // Determine the correct values based on language
    const finalTitle = lang === "he" 
      ? (titleHe || title || fallbackTitle)
      : (titleEn || title || fallbackTitle);
    
    const finalDescription = lang === "he"
      ? (descriptionHe || description || fallbackDescription)
      : (descriptionEn || description || fallbackDescription);
    
    const finalOgTitle = lang === "he"
      ? (ogTitleHe || ogTitle || titleHe || title || fallbackTitle)
      : (ogTitleEn || ogTitle || titleEn || title || fallbackTitle);
    
    const finalOgDescription = lang === "he"
      ? (ogDescriptionHe || ogDescription || descriptionHe || description || fallbackDescription)
      : (ogDescriptionEn || ogDescription || descriptionEn || description || fallbackDescription);

    // Update document title
    document.title = finalTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const attr = property ? "property" : "name";
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute("content", content);
    };

    // Set standard meta tags
    updateMetaTag("description", finalDescription);
    
    // Set Open Graph tags
    updateMetaTag("og:title", finalOgTitle, true);
    updateMetaTag("og:description", finalOgDescription, true);
    updateMetaTag("og:type", "website", true);
    updateMetaTag("og:url", window.location.href, true);
    
    if (ogImage) {
      updateMetaTag("og:image", ogImage, true);
    }
    
    // Set Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", finalOgTitle);
    updateMetaTag("twitter:description", finalOgDescription);
    
    if (ogImage) {
      updateMetaTag("twitter:image", ogImage);
    }
  }, [
    lang,
    title,
    titleEn,
    titleHe,
    description,
    descriptionEn,
    descriptionHe,
    ogTitle,
    ogTitleEn,
    ogTitleHe,
    ogDescription,
    ogDescriptionEn,
    ogDescriptionHe,
    ogImage,
    fallbackTitle,
    fallbackDescription,
  ]);

  return null;
}
