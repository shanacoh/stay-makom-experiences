import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Receipt, ChevronDown, ChevronUp, Gift, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import * as LucideIcons from "lucide-react";
import type { TaxFeeExtra } from "@/components/admin/HyperGuestHotelSearch";

interface Hotel2ExtrasManagerProps {
  hotelId: string;
  hyperguestExtras?: TaxFeeExtra[];
}

// ── Presets catalogue ──────────────────────────────────────────────────────
const PRESETS: { name_en: string; name_he: string; icon: string; pricing_type: string }[] = [
  // 🏨 Hôtel & Logistique
  { name_en: "Car Transfer Service (one way)",  name_he: "שירות העברה ברכב (כיוון אחד)", icon: "Car",        pricing_type: "per_booking" },
  { name_en: "Car Transfer Service (round trip)", name_he: "שירות העברה ברכב (הלוך ושוב)", icon: "Car",      pricing_type: "per_booking" },
  { name_en: "Early Check-in",                  name_he: "צ'ק אין מוקדם",                  icon: "Clock",      pricing_type: "per_booking" },
  { name_en: "Late Check-out",                  name_he: "צ'ק אאוט מאוחר",                  icon: "Clock",      pricing_type: "per_booking" },
  { name_en: "Breakfast",                        name_he: "ארוחת בוקר",                      icon: "Coffee",     pricing_type: "per_person"  },
  { name_en: "Lazy Breakfast (late / in-room)",  name_he: "ארוחת בוקר עצלה (מאוחרת / בחדר)", icon: "Coffee",   pricing_type: "per_person"  },
  { name_en: "Dinner",                           name_he: "ארוחת ערב",                        icon: "Utensils",  pricing_type: "per_person"  },
  { name_en: "Picnic Basket",                    name_he: "סל פיקניק",                        icon: "ShoppingCart", pricing_type: "per_booking" },
  { name_en: "Parking Reservation",              name_he: "הזמנת חניה",                       icon: "Car",       pricing_type: "per_booking" },
  // 🧘 Bien-être & Expérience
  { name_en: "Massage (60 min)",                 name_he: "עיסוי (60 דקות)",                  icon: "Sparkles",  pricing_type: "per_person"  },
  { name_en: "Photoshoot Session",               name_he: "סשן צילומים",                      icon: "Camera",    pricing_type: "per_booking" },
  { name_en: "Private Yoga Session",             name_he: "שיעור יוגה פרטי",                  icon: "Sun",       pricing_type: "per_booking" },
  { name_en: "Spa Access",                       name_he: "כניסה לספא",                       icon: "Waves",     pricing_type: "per_person"  },
  { name_en: "Beach Kit (STAYMAKOM towel)",      name_he: "ערכת חוף (מגבת STAYMAKOM)",        icon: "Umbrella",  pricing_type: "per_person"  },
  // 🍾 Chambre & Ambiance
  { name_en: "Champagne in Room",                name_he: "שמפניה בחדר",                      icon: "Wine",      pricing_type: "per_booking" },
  { name_en: "Wine in Room",                     name_he: "יין בחדר",                         icon: "Wine",      pricing_type: "per_booking" },
  { name_en: "Welcome Snack Basket",             name_he: "סל קבלת פנים",                    icon: "Gift",      pricing_type: "per_booking" },
  { name_en: "Flower Bouquet",                   name_he: "זר פרחים",                         icon: "Flower",    pricing_type: "per_booking" },
  { name_en: "Romantic Room Setup (candles / decoration)", name_he: "הכנת חדר רומנטי (נרות / קישוטים)", icon: "Heart", pricing_type: "per_booking" },
  // 🎞️ Souvenirs & Slow Moments
  { name_en: "Digital Camera",                   name_he: "מצלמה דיגיטלית",                   icon: "Camera",    pricing_type: "per_booking" },
  { name_en: "Letter-to-Yourself Kit",           name_he: "ערכת מכתב לעצמי",                  icon: "Pen",       pricing_type: "per_booking" },
  { name_en: "Stay Journal",                     name_he: "יומן שהייה",                       icon: "BookOpen",  pricing_type: "per_booking" },
  { name_en: "Board Game",                       name_he: "משחק קופסה",                       icon: "Briefcase", pricing_type: "per_booking" },
  { name_en: "Card Game",                        name_he: "משחק קלפים",                       icon: "Star",      pricing_type: "per_booking" },
];

const AVAILABLE_ICONS = [
  "Gift", "Wifi", "Utensils", "Wine", "Dumbbell", "Tent", "Plane", "Car",
  "Camera", "Music", "Sparkles", "Heart", "Star", "Coffee", "Baby",
  "Dog", "Flower2", "Bike", "Hotel", "Bed", "Bath", "Sun", "Moon",
  "Umbrella", "Key", "Map", "MapPin", "Phone", "Globe", "Clock", "Calendar",
  "ShoppingCart", "CreditCard", "Briefcase", "Package", "Shirt",
  "Mountain", "Waves", "Snowflake", "Gem", "Crown", "Trophy", "Medal", "Flag",
  "Compass", "Anchor", "Ship", "Train", "Bus", "Pizza", "IceCream",
  "Cake", "Beer", "GlassWater", "BookOpen", "Newspaper", "Pen", "Bell",
  "Lightbulb", "Flame", "Wind", "Leaf", "Trees", "Flower", "Bird", "Fish",
];

const PRICING_TYPES = [
  { value: "per_booking", label: "Per Experience (one-time)" },
  { value: "per_night",   label: "Per Night" },
  { value: "per_person",  label: "Per Guest" },
];

const CURRENCIES = ["ILS", "USD", "EUR", "GBP"];

const EMPTY_FORM = { name_en: "", name_he: "", price: "", currency: "ILS", pricing_type: "per_booking", icon: "Gift" };

export function Hotel2ExtrasManager({ hotelId, hyperguestExtras = [] }: Hotel2ExtrasManagerProps) {
  const queryClient = useQueryClient();
  const [expandedHyperguest, setExpandedHyperguest] = useState(false);
  const [newExtra, setNewExtra] = useState(EMPTY_FORM);
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  const { data: extras = [], isLoading } = useQuery({
    queryKey: ["hotel2-extras", hotelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotel2_extras" as any)
        .select("*")
        .eq("hotel_id", hotelId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as any[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newExtra) => {
      const { error } = await supabase.from("hotel2_extras" as any).insert({
        hotel_id: hotelId,
        name: data.name_en,
        name_he: data.name_he || null,
        price: parseFloat(data.price),
        currency: data.currency,
        pricing_type: data.pricing_type,
        image_url: data.icon,
        is_available: true,
        sort_order: Math.max(0, ...extras.map((e: any) => e.sort_order ?? 0)) + 1,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotel2-extras", hotelId] });
      toast.success("Extra ajouté ✓");
      setNewExtra(EMPTY_FORM);
      setSelectedPreset("");
    },
    onError: () => toast.error("Erreur lors de l'ajout"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hotel2_extras" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotel2-extras", hotelId] });
      toast.success("Extra supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_available }: { id: string; is_available: boolean }) => {
      const { error } = await supabase.from("hotel2_extras" as any).update({ is_available: !is_available } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hotel2-extras", hotelId] }),
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const handleAddExtra = () => {
    if (!newExtra.name_en.trim()) { toast.error("Nom en anglais requis"); return; }
    if (!newExtra.price || parseFloat(newExtra.price) <= 0) { toast.error("Prix valide requis"); return; }
    createMutation.mutate(newExtra);
  };

  const handlePresetSelect = (presetName: string) => {
    setSelectedPreset(presetName);
    if (presetName === "__custom__" || !presetName) {
      setNewExtra(EMPTY_FORM);
      return;
    }
    const preset = PRESETS.find((p) => p.name_en === presetName);
    if (preset) {
      setNewExtra({
        name_en: preset.name_en,
        name_he: preset.name_he,
        price: "",
        currency: "ILS",
        pricing_type: preset.pricing_type,
        icon: preset.icon,
      });
    }
  };

  const handleImport = (item: TaxFeeExtra) => {
    setSelectedPreset("__custom__");
    setNewExtra({
      name_en: item.title,
      name_he: "",
      price: (item.chargeValue ?? 0).toString(),
      currency: item.currency || "ILS",
      pricing_type: "per_booking",
      icon: item.category === "tax" ? "Receipt" : "Gift",
    });
    toast.success(`"${item.title}" pré-rempli. Ajustez et cliquez Ajouter.`);
  };

  const renderIcon = (name: string) => {
    const Ic = (LucideIcons as any)[name];
    return Ic ? <Ic className="h-4 w-4" /> : <Gift className="h-4 w-4" />;
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* HyperGuest Taxes & Fees */}
      {hyperguestExtras.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base">HyperGuest Taxes & Fees</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setExpandedHyperguest(!expandedHyperguest)}>
                {expandedHyperguest ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
            <CardDescription>
              Importés depuis HyperGuest — cliquez Import pour pré-remplir le formulaire
            </CardDescription>
          </CardHeader>
          {expandedHyperguest && (
            <CardContent className="space-y-2">
              {hyperguestExtras.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {item.category && <Badge variant="outline" className="text-[10px]">{item.category}</Badge>}
                      <span>{item.chargeType === "percent" ? `${item.chargeValue}%` : `${item.chargeValue} ${item.currency || "ILS"}`}</span>
                      {item.frequency && <span>({item.frequency})</span>}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleImport(item)}>Import</Button>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* Existing Extras */}
      {extras.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Extras existants</h4>
          {extras.map((extra: any) => (
            <Card key={extra.id}>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">{renderIcon(extra.image_url || "Gift")}</div>
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div>
                      <p className="font-medium text-sm">{extra.name}</p>
                      <p className="text-xs text-muted-foreground">English</p>
                    </div>
                    <div>
                      <p className="text-sm">{extra.name_he || "-"}</p>
                      <p className="text-xs text-muted-foreground">Hebrew</p>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{extra.price} {extra.currency}</p>
                      <p className="text-xs text-muted-foreground">
                        {PRICING_TYPES.find(t => t.value === extra.pricing_type)?.label || "Pricing"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={extra.is_available}
                      onCheckedChange={() => toggleMutation.mutate({ id: extra.id, is_available: extra.is_available })}
                    />
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(extra.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Extra Form */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <CardTitle className="text-sm">Ajouter un extra</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preset selector */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" />
              Sélectionner un extra récurrent (optionnel)
            </Label>
            <Select value={selectedPreset} onValueChange={handlePresetSelect}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="— Choisir un preset pour pré-remplir —" />
              </SelectTrigger>
              <SelectContent className="max-h-[280px]">
                <SelectItem value="__custom__">✏️ Créer un extra personnalisé</SelectItem>
                {/* Hôtel & Logistique */}
                <SelectItem value="__disabled_h" disabled className="text-xs font-semibold text-muted-foreground">🏨 Hôtel & Logistique</SelectItem>
                {PRESETS.slice(0, 9).map((p) => (
                  <SelectItem key={p.name_en} value={p.name_en} className="pl-4">
                    {p.name_en}
                  </SelectItem>
                ))}
                {/* Bien-être */}
                <SelectItem value="__disabled_b" disabled className="text-xs font-semibold text-muted-foreground">🧘 Bien-être & Expérience</SelectItem>
                {PRESETS.slice(9, 14).map((p) => (
                  <SelectItem key={p.name_en} value={p.name_en} className="pl-4">
                    {p.name_en}
                  </SelectItem>
                ))}
                {/* Chambre & Ambiance */}
                <SelectItem value="__disabled_c" disabled className="text-xs font-semibold text-muted-foreground">🍾 Chambre & Ambiance</SelectItem>
                {PRESETS.slice(14, 19).map((p) => (
                  <SelectItem key={p.name_en} value={p.name_en} className="pl-4">
                    {p.name_en}
                  </SelectItem>
                ))}
                {/* Souvenirs */}
                <SelectItem value="__disabled_s" disabled className="text-xs font-semibold text-muted-foreground">🎞️ Souvenirs & Slow Moments</SelectItem>
                {PRESETS.slice(19).map((p) => (
                  <SelectItem key={p.name_en} value={p.name_en} className="pl-4">
                    {p.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {/* Icon */}
            <div className="space-y-1">
              <Label className="text-xs">Icône</Label>
              <Select value={newExtra.icon} onValueChange={(v) => setNewExtra({ ...newExtra, icon: v })}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {AVAILABLE_ICONS.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      <span className="flex items-center gap-2">
                        {renderIcon(icon)}
                        <span className="text-xs">{icon}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name EN */}
            <div className="space-y-1">
              <Label className="text-xs">Nom (EN) *</Label>
              <Input className="h-9" value={newExtra.name_en} onChange={(e) => setNewExtra({ ...newExtra, name_en: e.target.value })} placeholder="Late Checkout" />
            </div>

            {/* Name HE */}
            <div className="space-y-1">
              <Label className="text-xs">Nom (HE)</Label>
              <Input className="h-9 bg-blue-50" value={newExtra.name_he} onChange={(e) => setNewExtra({ ...newExtra, name_he: e.target.value })} dir="rtl" placeholder="צ'ק אאוט מאוחר" />
            </div>

            {/* Price */}
            <div className="space-y-1">
              <Label className="text-xs">Prix *</Label>
              <Input className="h-9" type="number" value={newExtra.price} onChange={(e) => setNewExtra({ ...newExtra, price: e.target.value })} placeholder="0.00" />
            </div>

            {/* Currency */}
            <div className="space-y-1">
              <Label className="text-xs">Devise</Label>
              <Select value={newExtra.currency} onValueChange={(v) => setNewExtra({ ...newExtra, currency: v })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Pricing Type */}
            <div className="space-y-1">
              <Label className="text-xs">Type de tarification</Label>
              <Select value={newExtra.pricing_type} onValueChange={(v) => setNewExtra({ ...newExtra, pricing_type: v })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRICING_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleAddExtra} disabled={createMutation.isPending} className="w-full">
            {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Ajouter l'extra
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default Hotel2ExtrasManager;
