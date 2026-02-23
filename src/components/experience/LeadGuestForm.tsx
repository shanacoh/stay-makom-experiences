/**
 * Lead Guest Form — Collects guest info required by HyperGuest create-booking
 * Auto-fills from user profile, with option to book for someone else
 */

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { User, Gift } from "lucide-react";
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
}

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
  },
};

export function LeadGuestForm({ value, onChange, lang = "en" }: LeadGuestFormProps) {
  const t = translations[lang];
  const { user } = useAuth();
  const [isForOther, setIsForOther] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [savedProfileData, setSavedProfileData] = useState<LeadGuestData | null>(null);

  // Auto-fill from user profile on mount
  useEffect(() => {
    if (!user || profileLoaded) return;

    const loadProfile = async () => {
      // Get user profile
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("display_name, phone")
        .eq("user_id", user.id)
        .single();

      // Get customer data (has more fields like birthdate, city, country)
      const { data: customer } = await supabase
        .from("customers")
        .select("first_name, last_name, phone, birthdate, city, address_country")
        .eq("user_id", user.id)
        .single();

      const displayName = profile?.display_name || user.user_metadata?.display_name || "";
      const nameParts = displayName.split(" ");

      const profileData: LeadGuestData = {
        title: "MR",
        firstName: customer?.first_name || nameParts[0] || user.user_metadata?.first_name || "",
        lastName: customer?.last_name || nameParts.slice(1).join(" ") || user.user_metadata?.last_name || "",
        email: user.email || "",
        phone: customer?.phone || profile?.phone || user.user_metadata?.phone || "",
        birthDate: customer?.birthdate || "",
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

  // Toggle between self and other guest
  const handleToggleForOther = (forOther: boolean) => {
    setIsForOther(forOther);
    if (!forOther && savedProfileData) {
      // Restore profile data
      onChange(savedProfileData);
    } else if (forOther) {
      // Clear for new guest entry
      onChange({
        ...EMPTY_LEAD_GUEST,
        // Keep country default
        country: savedProfileData?.country || "IL",
      });
    }
  };

  const update = (field: keyof LeadGuestData, val: string) => {
    onChange({ ...value, [field]: val });
  };

  const isRtl = lang === "he";

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
              className="h-9"
              required
              readOnly={!isForOther && profileLoaded && !!value.firstName}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t.lastName} *</Label>
            <Input
              value={value.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              className="h-9"
              required
              readOnly={!isForOther && profileLoaded && !!value.lastName}
            />
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
              className="h-9"
              required
              readOnly={!isForOther && profileLoaded && !!value.email}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t.phone} *</Label>
            <Input
              type="tel"
              value={value.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="h-9"
              placeholder="+972..."
              required
            />
          </div>
        </div>

        {/* Birth date */}
        <div className="space-y-1">
          <Label className="text-xs">{t.birthDate} *</Label>
          <Input
            type="date"
            value={value.birthDate}
            onChange={(e) => update("birthDate", e.target.value)}
            className="h-9"
            max={new Date().toISOString().split("T")[0]}
          />
        </div>

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
            <Input
              value={value.country}
              onChange={(e) => update("country", e.target.value)}
              className="h-9"
              placeholder="IL"
              maxLength={2}
            />
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
