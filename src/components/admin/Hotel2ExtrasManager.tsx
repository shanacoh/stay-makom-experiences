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
import { Loader2, Plus, Trash2, Receipt, ChevronDown, ChevronUp, Gift } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import * as LucideIcons from "lucide-react";
import type { TaxFeeExtra } from "@/components/admin/HyperGuestHotelSearch";

interface Hotel2ExtrasManagerProps {
  hotelId: string;
  hyperguestExtras?: TaxFeeExtra[];
}

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
  { value: "per_night", label: "Per Night" },
  { value: "per_person", label: "Per Guest" },
];

const CURRENCIES = ["ILS", "USD", "EUR", "GBP"];

export function Hotel2ExtrasManager({ hotelId, hyperguestExtras = [] }: Hotel2ExtrasManagerProps) {
  const queryClient = useQueryClient();
  const [expandedHyperguest, setExpandedHyperguest] = useState(false);
  const [newExtra, setNewExtra] = useState({
    name_en: "", name_he: "", price: "", currency: "ILS", pricing_type: "per_booking", icon: "Gift",
  });

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
      toast.success("Extra added");
      setNewExtra({ name_en: "", name_he: "", price: "", currency: "ILS", pricing_type: "per_booking", icon: "Gift" });
    },
    onError: () => toast.error("Error adding extra"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hotel2_extras" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotel2-extras", hotelId] });
      toast.success("Extra deleted");
    },
    onError: () => toast.error("Error deleting extra"),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_available }: { id: string; is_available: boolean }) => {
      const { error } = await supabase.from("hotel2_extras" as any).update({ is_available: !is_available } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hotel2-extras", hotelId] }),
    onError: () => toast.error("Error updating extra"),
  });

  const handleAddExtra = () => {
    if (!newExtra.name_en.trim()) { toast.error("English name required"); return; }
    if (!newExtra.price || parseFloat(newExtra.price) <= 0) { toast.error("Valid price required"); return; }
    createMutation.mutate(newExtra);
  };

  const handleImport = (item: TaxFeeExtra) => {
    setNewExtra({
      name_en: item.title,
      name_he: "",
      price: (item.chargeValue ?? 0).toString(),
      currency: item.currency || "ILS",
      pricing_type: "per_booking",
      icon: item.category === "tax" ? "Receipt" : "Gift",
    });
    toast.success(`"${item.title}" pre-filled. Adjust and click Add.`);
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
              Imported from HyperGuest — click Import to pre-fill the form below
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
          <h4 className="font-medium text-sm">Existing Extras</h4>
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
        <CardContent className="p-4 space-y-4">
          <h4 className="font-medium text-sm">Add New Extra</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {/* Icon */}
            <div className="space-y-1">
              <Label className="text-xs">Icon</Label>
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
              <Label className="text-xs">Name (EN) *</Label>
              <Input className="h-9" value={newExtra.name_en} onChange={(e) => setNewExtra({ ...newExtra, name_en: e.target.value })} placeholder="Late Checkout" />
            </div>

            {/* Name HE */}
            <div className="space-y-1">
              <Label className="text-xs">Name (HE)</Label>
              <Input className="h-9" value={newExtra.name_he} onChange={(e) => setNewExtra({ ...newExtra, name_he: e.target.value })} dir="rtl" placeholder="צ'ק אאוט מאוחר" />
            </div>

            {/* Price */}
            <div className="space-y-1">
              <Label className="text-xs">Price *</Label>
              <Input className="h-9" type="number" value={newExtra.price} onChange={(e) => setNewExtra({ ...newExtra, price: e.target.value })} placeholder="0.00" />
            </div>

            {/* Currency */}
            <div className="space-y-1">
              <Label className="text-xs">Currency</Label>
              <Select value={newExtra.currency} onValueChange={(v) => setNewExtra({ ...newExtra, currency: v })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Pricing Type */}
            <div className="space-y-1">
              <Label className="text-xs">Pricing Type</Label>
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
            Add Extra
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default Hotel2ExtrasManager;
