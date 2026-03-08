/**
 * Lead Guest Form — Collects guest info required by HyperGuest create-booking
 * Auto-fills from user profile, with option to book for someone else
 * ✅ Enhanced UX: country dropdown, inline validation, phone format, birthDate guidance
 */

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { User, Gift, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface LeadGuestData {
  title: "MR" | "MS" | "MRS";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  city: string;
  country: string;
}

interface LeadGuestFormProps {
  value: LeadGuestData;
  onChange: (data: LeadGuestData) => void;
  lang?: "en" | "he" | "fr";
  showErrors?: boolean;
}

const COUNTRIES = [
  { code: "IL", en: "Israel", he: "ישראל", fr: "Israël" },
  { code: "US", en: "United States", he: "ארצות הברית", fr: "États-Unis" },
  { code: "GB", en: "United Kingdom", he: "בריטניה", fr: "Royaume-Uni" },
  { code: "FR", en: "France", he: "צרפת", fr: "France" },
  { code: "DE", en: "Germany", he: "גרמניה", fr: "Allemagne" },
  { code: "IT", en: "Italy", he: "איטליה", fr: "Italie" },
  { code: "ES", en: "Spain", he: "ספרד", fr: "Espagne" },
  { code: "NL", en: "Netherlands", he: "הולנד", fr: "Pays-Bas" },
  { code: "BE", en: "Belgium", he: "בלגיה", fr: "Belgique" },
  { code: "CH", en: "Switzerland", he: "שווייץ", fr: "Suisse" },
  { code: "AT", en: "Austria", he: "אוסטריה", fr: "Autriche" },
  { code: "AU", en: "Australia", he: "אוסטרליה", fr: "Australie" },
  { code: "CA", en: "Canada", he: "קנדה", fr: "Canada" },
  { code: "BR", en: "Brazil", he: "ברזיל", fr: "Brésil" },
  { code: "AR", en: "Argentina", he: "ארגנטינה", fr: "Argentine" },
  { code: "MX", en: "Mexico", he: "מקסיקו", fr: "Mexique" },
  { code: "ZA", en: "South Africa", he: "דרום אפריקה", fr: "Afrique du Sud" },
  { code: "IN", en: "India", he: "הודו", fr: "Inde" },
  { code: "JP", en: "Japan", he: "יפן", fr: "Japon" },
  { code: "RU", en: "Russia", he: "רוסיה", fr: "Russie" },
  { code: "UA", en: "Ukraine", he: "אוקראינה", fr: "Ukraine" },
  { code: "PT", en: "Portugal", he: "פורטוגל", fr: "Portugal" },
  { code: "GR", en: "Greece", he: "יוון", fr: "Grèce" },
  { code: "TR", en: "Turkey", he: "טורקיה", fr: "Turquie" },
  { code: "PL", en: "Poland", he: "פולין", fr: "Pologne" },
  { code: "RO", en: "Romania", he: "רומניה", fr: "Roumanie" },
  { code: "CZ", en: "Czech Republic", he: "צ'כיה", fr: "Tchéquie" },
  { code: "HU", en: "Hungary", he: "הונגריה", fr: "Hongrie" },
  { code: "SE", en: "Sweden", he: "שוודיה", fr: "Suède" },
  { code: "DK", en: "Denmark", he: "דנמרק", fr: "Danemark" },
  { code: "NO", en: "Norway", he: "נורווגיה", fr: "Norvège" },
  { code: "FI", en: "Finland", he: "פינלנד", fr: "Finlande" },
];

const translations = {
  en: {
    title: "Guest Information",
    salutation: "Title",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    birthDate: "Date of birth",
    address: "Address",
    city: "City",
    country: "Country",
    bookForOther: "Book for someone else",
    bookForOtherDesc: "Fill in the guest's details below",
    autoFilled: "Auto-filled from your account",
    required: "Required",
    invalidEmail: "Invalid email",
    invalidPhone: "Use international format, e.g. +972501234567",
    invalidDate: "Select a valid date",
    phonePlaceholder: "+972501234567",
  },
  he: {
    title: "פרטי האורח",
    salutation: "תואר",
    firstName: "שם פרטי",
    lastName: "שם משפחה",
    email: "אימייל",
    phone: "טלפון",
    birthDate: "תאריך לידה",
    address: "כתובת",
    city: "עיר",
    country: "מדינה",
    bookForOther: "הזמנה עבור מישהו אחר",
    bookForOtherDesc: "מלא את פרטי האורח למטה",
    autoFilled: "מילוי אוטומטי מהחשבון שלך",
    required: "שדה חובה",
    invalidEmail: "כתובת אימייל לא תקינה",
    invalidPhone: "השתמש בפורמט בינלאומי, לדוג׳ 972501234567+",
    invalidDate: "בחר תאריך תקין",
    phonePlaceholder: "+972501234567",
  },
  fr: {
    title: "Informations voyageur",
    salutation: "Titre",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Email",
    phone: "Téléphone",
    birthDate: "Date de naissance",
    address: "Adresse",
    city: "Ville",
    country: "Pays",
    bookForOther: "Réserver pour quelqu'un d'autre",
    bookForOtherDesc: "Remplissez les coordonnées du voyageur ci-dessous",
    autoFilled: "Pré-rempli depuis votre compte",
    required: "Requis",
    invalidEmail: "Email invalide",
    invalidPhone: "Format international, ex : +972501234567",
    invalidDate: "Sélectionnez une date valide",
    phonePlaceholder: "+972501234567",
  },
};

/** Validate birth date is YYYY-MM-DD and reasonable */
function isValidBirthDate(d: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const date = new Date(d);
  if (isNaN(date.getTime())) return false;
  const now = new Date();
  return date < now && date > new Date("1900-01-01");
}

function isValidEmail(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function isValidPhone(p: string): boolean {
  // Accept international format with + and at least 8 digits
  return /^\+?\d[\d\s\-]{7,}$/.test(p.trim());
}

/** Normalize phone: strip spaces/dashes, ensure starts with + */
function normalizePhone(p: string): string {
  let cleaned = p.replace(/[\s\-()]/g, "");
  if (cleaned && !cleaned.startsWith("+") && cleaned.length >= 8) {
    cleaned = "+" + cleaned;
  }
  return cleaned;
}

export function LeadGuestForm({ value, onChange, lang = "en", showErrors = false }: LeadGuestFormProps) {
  const t = translations[lang];
  const { user } = useAuth();
  const [isForOther, setIsForOther] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [savedProfileData, setSavedProfileData] = useState<LeadGuestData | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

  // Field-level errors
  const errors = useMemo(() => {
    const show = showErrors; // show all when booking attempted
    return {
      firstName: (show || touched.firstName) && !value.firstName.trim() ? t.required : null,
      lastName: (show || touched.lastName) && !value.lastName.trim() ? t.required : null,
      email: (show || touched.email) && !value.email.trim() ? t.required 
           : (show || touched.email) && !isValidEmail(value.email) ? t.invalidEmail : null,
      phone: (show || touched.phone) && !value.phone.trim() ? t.required 
           : (show || touched.phone) && !isValidPhone(value.phone) ? t.invalidPhone : null,
      birthDate: (show || touched.birthDate) && value.birthDate && !isValidBirthDate(value.birthDate) ? t.invalidDate : null,
    };
  }, [value, touched, showErrors, t]);

  // Auto-fill from user profile on mount
  useEffect(() => {
    if (!user || profileLoaded) return;

    const loadProfile = async () => {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("display_name, phone")
        .eq("user_id", user.id)
        .single();

      const { data: customer } = await supabase
        .from("customers")
        .select("first_name, last_name, phone, birthdate, city, address_country")
        .eq("user_id", user.id)
        .single();

      const displayName = profile?.display_name || user.user_metadata?.display_name || "";
      const nameParts = displayName.split(" ");

      // Normalize birthdate to YYYY-MM-DD
      let birthDate = customer?.birthdate || "";
      if (birthDate && !isValidBirthDate(birthDate)) {
        birthDate = ""; // Clear if invalid format from DB
      }

      const profileData: LeadGuestData = {
        title: "MR",
        firstName: customer?.first_name || nameParts[0] || user.user_metadata?.first_name || "",
        lastName: customer?.last_name || nameParts.slice(1).join(" ") || user.user_metadata?.last_name || "",
        email: user.email || "",
        phone: normalizePhone(customer?.phone || profile?.phone || user.user_metadata?.phone || ""),
        birthDate,
        address: "",
        city: customer?.city || "",
        country: customer?.address_country || "IL",
      };

      setSavedProfileData(profileData);
      onChange(profileData);
      setProfileLoaded(true);
    };

    loadProfile();
  }, [user, profileLoaded]);

  const handleToggleForOther = (forOther: boolean) => {
    setIsForOther(forOther);
    setTouched({});
    if (!forOther && savedProfileData) {
      onChange(savedProfileData);
    } else if (forOther) {
      onChange({ ...EMPTY_LEAD_GUEST, country: savedProfileData?.country || "IL" });
    }
  };

  const update = (field: keyof LeadGuestData, val: string) => {
    onChange({ ...value, [field]: val });
  };

  const FieldError = ({ msg }: { msg: string | null }) => {
    if (!msg) return null;
    return (
      <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
        <AlertCircle className="h-3 w-3 flex-shrink-0" />
        {msg}
      </p>
    );
  };

  const countryLabel = (c: typeof COUNTRIES[0]) => lang === "he" ? c.he : lang === "fr" ? c.fr : c.en;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="h-4 w-4" />
          {t.title}
        </CardTitle>
        {user && !isForOther && profileLoaded && (
          <p className="text-xs text-muted-foreground mt-1">{t.autoFilled}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Toggle: book for someone else */}
        {user && (
          <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">{t.bookForOther}</p>
                {isForOther && (
                  <p className="text-xs text-muted-foreground">{t.bookForOtherDesc}</p>
                )}
              </div>
            </div>
            <Switch checked={isForOther} onCheckedChange={handleToggleForOther} />
          </div>
        )}

        {/* Title */}
        <div className="space-y-1">
          <Label className="text-xs">{t.salutation}</Label>
          <Select value={value.title} onValueChange={(v) => update("title", v)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MR">Mr</SelectItem>
              <SelectItem value="MS">Ms</SelectItem>
              <SelectItem value="MRS">Mrs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Name */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">{t.firstName} *</Label>
            <Input
              value={value.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              onBlur={() => markTouched("firstName")}
              className={`h-9 ${errors.firstName ? "border-destructive" : ""}`}
              required
              readOnly={!isForOther && profileLoaded && !!value.firstName}
            />
            <FieldError msg={errors.firstName} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t.lastName} *</Label>
            <Input
              value={value.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              onBlur={() => markTouched("lastName")}
              className={`h-9 ${errors.lastName ? "border-destructive" : ""}`}
              required
              readOnly={!isForOther && profileLoaded && !!value.lastName}
            />
            <FieldError msg={errors.lastName} />
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">{t.email} *</Label>
            <Input
              type="email"
              value={value.email}
              onChange={(e) => update("email", e.target.value)}
              onBlur={() => markTouched("email")}
              className={`h-9 ${errors.email ? "border-destructive" : ""}`}
              required
              readOnly={!isForOther && profileLoaded && !!value.email}
            />
            <FieldError msg={errors.email} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t.phone} *</Label>
            <Input
              type="tel"
              value={value.phone}
              onChange={(e) => update("phone", e.target.value)}
              onBlur={() => {
                markTouched("phone");
                // Auto-normalize on blur
                const normalized = normalizePhone(value.phone);
                if (normalized !== value.phone) update("phone", normalized);
              }}
              className={`h-9 ${errors.phone ? "border-destructive" : ""}`}
              placeholder={t.phonePlaceholder}
              required
            />
            <FieldError msg={errors.phone} />
          </div>
        </div>

        {/* Birth date — optional, in collapsible section */}
        <details className="group">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors py-1">
            {lang === "he" ? "מידע נוסף (אופציונלי)" : lang === "fr" ? "Informations supplémentaires (optionnel)" : "Additional info (optional)"}
          </summary>
          <div className="space-y-1 pt-2">
            <Label className="text-xs">{t.birthDate}</Label>
            <Input
              type="date"
              value={value.birthDate}
              onChange={(e) => update("birthDate", e.target.value)}
              onBlur={() => markTouched("birthDate")}
              className="h-9"
              max={new Date().toISOString().split("T")[0]}
              min="1900-01-01"
              placeholder={lang === "fr" ? "jj/mm/aaaa" : "dd/mm/yyyy"}
            />
          </div>
        </details>

        {/* City & Country */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">{t.city}</Label>
            <Input
              value={value.city}
              onChange={(e) => update("city", e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t.country}</Label>
            <Select value={value.country} onValueChange={(v) => update("country", v)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder={t.country} />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {countryLabel(c)} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const EMPTY_LEAD_GUEST: LeadGuestData = {
  title: "MR",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: "",
  address: "",
  city: "",
  country: "IL",
};

/** Sanitize lead guest data before sending to HyperGuest — ensures all formats are correct */
export function sanitizeLeadGuest(g: LeadGuestData): LeadGuestData {
  let birthDate = g.birthDate;
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    birthDate = "1990-01-01"; // Safe fallback
  }
  return {
    ...g,
    firstName: g.firstName.trim(),
    lastName: g.lastName.trim(),
    email: g.email.trim().toLowerCase(),
    phone: normalizePhone(g.phone),
    birthDate,
    address: g.address?.trim() || "N/A",
    city: g.city?.trim() || "N/A",
    country: g.country?.trim().toUpperCase() || "IL",
  };
}