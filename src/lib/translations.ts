// UI translations for the application
export const translations = {
  en: {
    // Category page
    experiencesAvailable: (count: number) => `${count} experience${count !== 1 ? 's' : ''} available`,
    discoverExtraordinaryStays: "Discover extraordinary stays",
    noExperiencesMatch: "No experiences match your criteria.",
    resetFilters: "Reset filters",
    categoryNotFound: "Category not found",
    backToHome: "Back to Home",
    
    // Experience page
    experienceNotFound: "Experience not found",
    spiceItUp: "Spice it up",
    spiceItUpDescription: "Enhance your stay with optional extras you can add to your booking on the right.",
    whatsIncluded: "What's included",
    goodToKnow: "Good to know",
    extra: "Extra",
    toBeAdded: "To be added",
    add: "Add",
    bookItNow: "Book it now",
    perPerson: "/ person",
    perNight: "/ night",
    perBooking: "/ booking",
    
    // Hotel page
    hotelNotFound: "Hotel not found",
    ourStory: "Our Story",
    highlights: "Highlights",
    amenities: "Amenities",
    gallery: "Gallery",
    contact: "Contact",
    email: "Email",
    phone: "Phone",
    visitWebsite: "Visit Website",
    instagram: "Instagram",
    experiences: "Experiences",
    fromPrice: "From",
    perPersonLabel: "per person",
    
    // Reviews
    review: "review",
    reviews: "reviews",
    
    // Map
    addToMap: "Add to map",
    location: "Location",
    addressNotAvailable: "Address not available",
    openInGoogleMaps: "Open in Google Maps",
  },
  he: {
    // Category page
    experiencesAvailable: (count: number) => `${count} חוויות זמינות`,
    discoverExtraordinaryStays: "גלו שהיות יוצאות דופן",
    noExperiencesMatch: "אין חוויות התואמות את הקריטריונים.",
    resetFilters: "אפס מסננים",
    categoryNotFound: "קטגוריה לא נמצאה",
    backToHome: "חזרה לדף הבית",
    
    // Experience page
    experienceNotFound: "חוויה לא נמצאה",
    spiceItUp: "תוספות",
    spiceItUpDescription: "שפרו את השהייה שלכם עם תוספות אופציונליות שתוכלו להוסיף להזמנה.",
    whatsIncluded: "כלול בחוויה",
    goodToKnow: "כדאי לדעת",
    extra: "תוספת",
    toBeAdded: "יתווסף בקרוב",
    add: "הוסף",
    bookItNow: "הזמינו עכשיו",
    perPerson: "/ אדם",
    perNight: "/ לילה",
    perBooking: "/ הזמנה",
    
    // Hotel page
    hotelNotFound: "המלון לא נמצא",
    ourStory: "הסיפור שלנו",
    highlights: "נקודות עיקריות",
    amenities: "מתקנים",
    gallery: "גלריה",
    contact: "יצירת קשר",
    email: "אימייל",
    phone: "טלפון",
    visitWebsite: "לאתר המלון",
    instagram: "אינסטגרם",
    experiences: "חוויות",
    fromPrice: "החל מ-",
    perPersonLabel: "לאדם",
    
    // Reviews
    review: "ביקורת",
    reviews: "ביקורות",
    
    // Map
    addToMap: "הוסף למפה",
    location: "מיקום",
    addressNotAvailable: "כתובת לא זמינה",
    openInGoogleMaps: "פתח ב-Google Maps",
  },
};

export type Language = 'en' | 'he' | 'fr';

export const t = (lang: Language, key: keyof typeof translations.en): any => {
  const langTranslations = translations[lang as 'en' | 'he'] || translations.en;
  return langTranslations[key] || translations.en[key];
};
