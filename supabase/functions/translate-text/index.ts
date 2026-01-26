import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TranslateRequest {
  texts: string[];
  targetLang: "he" | "en" | "fr";
}

// Common city/region translations for Israel
const hebrewTranslations: Record<string, string> = {
  // Cities
  "tel aviv": "תל אביב",
  "tel aviv-yafo": "תל אביב-יפו",
  "jerusalem": "ירושלים",
  "haifa": "חיפה",
  "eilat": "אילת",
  "herzliya": "הרצליה",
  "netanya": "נתניה",
  "ashdod": "אשדוד",
  "beer sheva": "באר שבע",
  "beersheba": "באר שבע",
  "tiberias": "טבריה",
  "nazareth": "נצרת",
  "acre": "עכו",
  "akko": "עכו",
  "nahariya": "נהריה",
  "safed": "צפת",
  "zefat": "צפת",
  "tzfat": "צפת",
  "rishon lezion": "ראשון לציון",
  "petah tikva": "פתח תקווה",
  "holon": "חולון",
  "bat yam": "בת ים",
  "ramat gan": "רמת גן",
  "bnei brak": "בני ברק",
  "rehovot": "רחובות",
  "ashkelon": "אשקלון",
  "kfar saba": "כפר סבא",
  "raanana": "רעננה",
  "lod": "לוד",
  "ramla": "רמלה",
  "modi'in": "מודיעין",
  "modiin": "מודיעין",
  "rosh pina": "ראש פינה",
  "mitzpe ramon": "מצפה רמון",
  "dead sea": "ים המלח",
  "ein bokek": "עין בוקק",
  "neve zohar": "נווה זוהר",
  "arad": "ערד",
  "dimona": "דימונה",
  "sde boker": "שדה בוקר",
  "caesarea": "קיסריה",
  "zichron yaakov": "זכרון יעקב",
  "beit shean": "בית שאן",
  "kiryat shmona": "קריית שמונה",
  "yotvata": "יטבתה",
  "timna": "תמנע",
  "ein gedi": "עין גדי",
  "masada": "מצדה",
  
  // Regions
  "tel aviv district": "מחוז תל אביב",
  "tel aviv area": "אזור תל אביב",
  "central district": "מחוז המרכז",
  "central israel": "מרכז ישראל",
  "jerusalem district": "מחוז ירושלים",
  "northern district": "מחוז הצפון",
  "north israel": "צפון ישראל",
  "northern israel": "צפון ישראל",
  "southern district": "מחוז הדרום",
  "south israel": "דרום ישראל",
  "southern israel": "דרום ישראל",
  "haifa district": "מחוז חיפה",
  "judea and samaria": "יהודה ושומרון",
  "golan heights": "רמת הגולן",
  "galilee": "גליל",
  "upper galilee": "גליל עליון",
  "lower galilee": "גליל תחתון",
  "western galilee": "גליל מערבי",
  "negev": "נגב",
  "negev desert": "מדבר הנגב",
  "judean desert": "מדבר יהודה",
  "sharon": "השרון",
  "sharon plain": "מישור השרון",
  "coastal plain": "מישור החוף",
  "jezreel valley": "עמק יזרעאל",
  "jordan valley": "בקעת הירדן",
  "arava": "ערבה",
  "carmel": "כרמל",
  "mount carmel": "הר הכרמל",
  
  // Common terms
  "israel": "ישראל",
  "beach": "חוף",
  "hotel": "מלון",
  "boutique": "בוטיק",
  "resort": "ריזורט",
  "spa": "ספא",
  "desert": "מדבר",
  "sea": "ים",
  "mountain": "הר",
  "lake": "אגם",
  "river": "נהר",
  "forest": "יער",
  "national park": "פארק לאומי",
};

function translateToHebrew(text: string): string {
  if (!text) return "";
  
  const lowerText = text.toLowerCase().trim();
  
  // Direct match
  if (hebrewTranslations[lowerText]) {
    return hebrewTranslations[lowerText];
  }
  
  // Try partial matches for compound names
  for (const [eng, heb] of Object.entries(hebrewTranslations)) {
    if (lowerText.includes(eng)) {
      return heb;
    }
  }
  
  // Return original if no translation found
  return text;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { texts, targetLang } = (await req.json()) as TranslateRequest;

    if (!texts || !Array.isArray(texts)) {
      return new Response(
        JSON.stringify({ error: "texts array is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    if (targetLang !== "he") {
      // For non-Hebrew translations, just return original texts
      // Could integrate with a translation API later if needed
      return new Response(
        JSON.stringify({ translations: texts }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Translate each text to Hebrew
    const translations = texts.map(text => translateToHebrew(text));

    console.log(`Translated ${texts.length} texts to Hebrew:`, { original: texts, translated: translations });

    return new Response(
      JSON.stringify({ translations }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Translation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to translate texts" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
