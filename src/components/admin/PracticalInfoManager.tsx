/**
 * Admin component to manage "Things to Know" items for Experience2
 * - Shows hotel-provided default items with toggle visibility
 * - Allows adding custom items
 * - Persists to experience2_practical_info table
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface PracticalInfoItem {
  id?: string;
  experience_id: string;
  source: string;
  field_key?: string;
  label: string;
  label_he?: string;
  value: string;
  value_he?: string;
  icon?: string;
  is_visible: boolean;
  order_index: number;
}

interface PracticalInfoManagerProps {
  experienceId: string;
  experience: {
    min_party?: number;
    max_party?: number;
    duration?: string;
    duration_he?: string;
    checkin_time?: string;
    checkout_time?: string;
    address?: string;
    address_he?: string;
    accessibility_info?: string;
    accessibility_info_he?: string;
    cancellation_policy?: string;
    cancellation_policy_he?: string;
    lead_time_days?: number;
  };
}

// Default items derived from experience + hotel data
const buildDefaultItems = (exp: PracticalInfoManagerProps["experience"], experienceId: string): PracticalInfoItem[] => {
  const items: PracticalInfoItem[] = [];
  let idx = 0;

  if (exp.min_party && exp.max_party) {
    items.push({
      experience_id: experienceId, source: "hotel", field_key: "group_size",
      label: "Group size", label_he: "גודל קבוצה",
      value: `${exp.min_party} - ${exp.max_party} people`,
      value_he: `${exp.min_party} - ${exp.max_party} אנשים`,
      icon: "Users", is_visible: true, order_index: idx++,
    });
  }
  if (exp.duration) {
    items.push({
      experience_id: experienceId, source: "hotel", field_key: "duration",
      label: "Duration", label_he: "משך",
      value: exp.duration, value_he: exp.duration_he || "",
      icon: "Clock", is_visible: true, order_index: idx++,
    });
  }
  if (exp.checkin_time && exp.checkout_time) {
    items.push({
      experience_id: experienceId, source: "hotel", field_key: "checkin_checkout",
      label: "Check-in / Check-out", label_he: "צ'ק-אין / צ'ק-אאוט",
      value: `${exp.checkin_time} - ${exp.checkout_time}`, value_he: `${exp.checkin_time} - ${exp.checkout_time}`,
      icon: "Calendar", is_visible: true, order_index: idx++,
    });
  }
  if (exp.address) {
    items.push({
      experience_id: experienceId, source: "hotel", field_key: "location",
      label: "Location", label_he: "מיקום",
      value: exp.address, value_he: exp.address_he || "",
      icon: "MapPin", is_visible: true, order_index: idx++,
    });
  }
  if (exp.accessibility_info) {
    items.push({
      experience_id: experienceId, source: "hotel", field_key: "accessibility",
      label: "Accessibility", label_he: "נגישות",
      value: exp.accessibility_info, value_he: exp.accessibility_info_he || "",
      icon: "Accessibility", is_visible: true, order_index: idx++,
    });
  }
  if (exp.cancellation_policy) {
    items.push({
      experience_id: experienceId, source: "hotel", field_key: "cancellation",
      label: "Cancellation policy", label_he: "מדיניות ביטול",
      value: exp.cancellation_policy, value_he: exp.cancellation_policy_he || "",
      icon: "AlertCircle", is_visible: true, order_index: idx++,
    });
  }
  if (exp.lead_time_days && exp.lead_time_days > 0) {
    items.push({
      experience_id: experienceId, source: "hotel", field_key: "lead_time",
      label: "Advance booking", label_he: "הזמנה מראש",
      value: `Book at least ${exp.lead_time_days} days in advance`,
      value_he: `יש להזמין לפחות ${exp.lead_time_days} ימים מראש`,
      icon: "Calendar", is_visible: true, order_index: idx++,
    });
  }
  return items;
};

const PracticalInfoManager = ({ experienceId, experience }: PracticalInfoManagerProps) => {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<PracticalInfoItem[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Fetch existing items from DB
  const { data: dbItems, isLoading } = useQuery({
    queryKey: ["admin-practical-info", experienceId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("experience2_practical_info")
        .select("*")
        .eq("experience_id", experienceId)
        .order("order_index");
      if (error) throw error;
      return data || [];
    },
    enabled: !!experienceId,
  });

  // Initialize items: if DB has items, use those; otherwise build defaults
  useEffect(() => {
    if (isLoading || initialized) return;
    if (dbItems && dbItems.length > 0) {
      setItems(dbItems);
    } else {
      setItems(buildDefaultItems(experience, experienceId));
    }
    setInitialized(true);
  }, [dbItems, isLoading, initialized, experience, experienceId]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      // Delete all existing items for this experience
      await (supabase as any)
        .from("experience2_practical_info")
        .delete()
        .eq("experience_id", experienceId);

      // Insert all current items
      if (items.length > 0) {
        const toInsert = items.map((item, idx) => ({
          experience_id: experienceId,
          source: item.source,
          field_key: item.field_key || null,
          label: item.label,
          label_he: item.label_he || null,
          value: item.value,
          value_he: item.value_he || null,
          icon: item.icon || null,
          is_visible: item.is_visible,
          order_index: idx,
        }));

        const { error } = await (supabase as any)
          .from("experience2_practical_info")
          .insert(toInsert);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-practical-info", experienceId] });
      queryClient.invalidateQueries({ queryKey: ["experience2-practical-info", experienceId] });
      toast.success("Things to know saved!");
    },
    onError: (err: any) => {
      toast.error(`Error saving: ${err.message}`);
    },
  });

  const toggleVisibility = (index: number) => {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, is_visible: !item.is_visible } : item));
  };

  const addCustomItem = () => {
    setItems((prev) => [
      ...prev,
      {
        experience_id: experienceId,
        source: "custom",
        label: "",
        label_he: "",
        value: "",
        value_he: "",
        icon: "Info",
        is_visible: true,
        order_index: prev.length,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, val: string) => {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, [field]: val } : item));
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id || `new-${index}`} className="flex items-start gap-3 p-3 border rounded-lg bg-muted/20">
          <div className="flex items-center gap-2 pt-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <Switch
              checked={item.is_visible}
              onCheckedChange={() => toggleVisibility(index)}
            />
          </div>
          <div className={`flex-1 grid grid-cols-2 gap-3 ${!item.is_visible ? 'opacity-40' : ''}`}>
            <div>
              <Label className="text-xs">Label (EN)</Label>
              <Input
                value={item.label}
                onChange={(e) => updateItem(index, "label", e.target.value)}
                placeholder="e.g. Group size"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Label (HE)</Label>
              <Input
                value={item.label_he || ""}
                onChange={(e) => updateItem(index, "label_he", e.target.value)}
                dir="rtl"
                className="h-8 text-sm bg-hebrew-input"
              />
            </div>
            <div>
              <Label className="text-xs">Value (EN)</Label>
              <Input
                value={item.value}
                onChange={(e) => updateItem(index, "value", e.target.value)}
                placeholder="e.g. 2-4 people"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Value (HE)</Label>
              <Input
                value={item.value_he || ""}
                onChange={(e) => updateItem(index, "value_he", e.target.value)}
                dir="rtl"
                className="h-8 text-sm bg-hebrew-input"
              />
            </div>
            <div>
              <Label className="text-xs">Icon (Lucide name)</Label>
              <Input
                value={item.icon || ""}
                onChange={(e) => updateItem(index, "icon", e.target.value)}
                placeholder="e.g. Users, Clock, MapPin"
                className="h-8 text-sm"
              />
            </div>
            <div className="flex items-end">
              <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                {item.source === "hotel" ? "📡 From hotel" : "✏️ Custom"}
              </span>
            </div>
          </div>
          {item.source === "custom" && (
            <Button variant="ghost" size="sm" className="mt-2 text-destructive" onClick={() => removeItem(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}

      <div className="flex gap-3">
        <Button type="button" variant="outline" size="sm" onClick={addCustomItem}>
          <Plus className="h-4 w-4 mr-1" /> Add custom item
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? "Saving..." : "Save Things to Know"}
        </Button>
      </div>
    </div>
  );
};

export default PracticalInfoManager;
