/**
 * Lead Guest Form — Collects guest info required by HyperGuest create-booking
 * Fields: first name, last name, email, phone, birthdate, title (MR/MS/MRS)
 */


import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

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
  },
};

export function LeadGuestForm({ value, onChange, lang = "en" }: LeadGuestFormProps) {
  const t = translations[lang];

  const update = (field: keyof LeadGuestData, val: string) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="h-4 w-4" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t.lastName} *</Label>
            <Input
              value={value.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              className="h-9"
              required
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

        {/* Address & City */}
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
