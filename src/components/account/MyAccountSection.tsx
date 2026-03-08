import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import MarketingOptInDialog from "./MarketingOptInDialog";
import AvatarUpload from "./AvatarUpload";

interface MyAccountSectionProps {
  userId?: string;
  userEmail?: string;
  mobile?: boolean;
}

const TRAVEL_PREFS = [
  "Nature", "Culture", "Wellness", "Gastronomy", "Adventure", "Romantic",
];

export default function MyAccountSection({ userId, userEmail, mobile }: MyAccountSectionProps) {
  const queryClient = useQueryClient();
  const [showMarketingDialog, setShowMarketingDialog] = useState(false);
  const [pendingMarketingValue, setPendingMarketingValue] = useState(false);

  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: ["customer", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    birthdate: "",
    city: "",
    country: "",
    marketing_optin: true,
    interests: [] as string[],
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        first_name: customer.first_name || "",
        last_name: customer.last_name || "",
        phone: customer.phone || "",
        birthdate: customer.birthdate || "",
        city: customer.city || "",
        country: customer.address_country || "",
        marketing_optin: profile?.marketing_opt_in ?? true,
        interests: (profile?.interests as string[]) || [],
      });
    }
  }, [customer, profile]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !customer?.id) throw new Error("User not found");
      const { error: customerError } = await supabase
        .from("customers")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          birthdate: formData.birthdate || null,
          city: formData.city,
          address_country: formData.country,
        })
        .eq("id", customer.id);
      if (customerError) throw customerError;

      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          marketing_opt_in: formData.marketing_optin,
          interests: formData.interests,
        })
        .eq("user_id", userId);
      if (profileError) throw profileError;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["customer", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const handleMarketingToggle = (checked: boolean) => {
    if (!checked && formData.marketing_optin) {
      setPendingMarketingValue(false);
      setShowMarketingDialog(true);
    } else {
      setFormData({ ...formData, marketing_optin: checked });
    }
  };

  const handleMarketingConfirm = (confirmed: boolean) => {
    if (confirmed) {
      setFormData({ ...formData, marketing_optin: false });
    }
    setShowMarketingDialog(false);
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  if (customerLoading || profileLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const inputClass = mobile
    ? "border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground"
    : undefined;

  const labelClass = mobile
    ? "text-xs text-muted-foreground uppercase tracking-wider"
    : undefined;

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Avatar */}
      <div className="flex justify-center mb-2">
        <AvatarUpload
          userId={userId!}
          avatarUrl={profile?.avatar_url}
          displayName={formData.first_name ? `${formData.first_name} ${formData.last_name}` : "Member"}
          size={mobile ? "sm" : "md"}
          onUploaded={() => {
            queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
            queryClient.invalidateQueries({ queryKey: ["user-profile-header", userId] });
          }}
        />
      </div>

      <div className={mobile ? "space-y-5" : "grid grid-cols-1 md:grid-cols-2 gap-6"}>
        <div className="space-y-1.5">
          <Label htmlFor="first_name" className={labelClass}>First Name *</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="last_name" className={labelClass}>Last Name *</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className={labelClass}>Email</Label>
        <Input
          id="email"
          type="email"
          value={userEmail || ""}
          disabled
          className={cn(inputClass, "opacity-50")}
        />
        {!mobile && (
          <p className="text-xs text-muted-foreground">Email is linked to your authentication account</p>
        )}
      </div>

      <div className={mobile ? "space-y-5" : "grid grid-cols-1 md:grid-cols-2 gap-6"}>
        <div className="space-y-1.5">
          <Label htmlFor="phone" className={labelClass}>Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 234 567 8900"
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="birthdate" className={labelClass}>Date of Birth</Label>
          <Input
            id="birthdate"
            type="date"
            value={formData.birthdate}
            onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      <div className={mobile ? "space-y-5" : "grid grid-cols-1 md:grid-cols-2 gap-6"}>
        <div className="space-y-1.5">
          <Label htmlFor="city" className={labelClass}>City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="Tel Aviv"
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="country" className={labelClass}>Country</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            placeholder="Israel"
            className={inputClass}
          />
        </div>
      </div>

      {/* Travel Preferences */}
      <div className="pt-4 border-t border-border/50">
        <Label className={cn(labelClass, "mb-2 block")}>Travel Preferences</Label>
        <p className="text-xs text-muted-foreground mb-3">
          Used to personalize your recommendations
        </p>
        <div className="flex flex-wrap gap-2">
          {TRAVEL_PREFS.map((pref) => {
            const selected = formData.interests.includes(pref);
            return (
              <button
                key={pref}
                type="button"
                onClick={() => toggleInterest(pref)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border",
                  selected
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-muted-foreground border-border hover:border-foreground/50"
                )}
              >
                {pref}
              </button>
            );
          })}
        </div>
      </div>

      {/* Marketing toggle */}
      <div className="pt-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-0.5">
            <Label htmlFor="marketing_optin" className="text-sm font-medium">
              Newsletter & Marketing
            </Label>
            <p className="text-xs text-muted-foreground">
              Exclusive experiences, early releases & special deals
            </p>
          </div>
          <Switch
            id="marketing_optin"
            checked={formData.marketing_optin}
            onCheckedChange={handleMarketingToggle}
          />
        </div>
      </div>

      {/* Save */}
      {mobile ? (
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="w-full h-12 mt-6 rounded-lg bg-foreground text-background text-[15px] font-medium disabled:opacity-50 transition-colors"
        >
          {saveMutation.isPending ? "Saving…" : "Save Changes"}
        </button>
      ) : (
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={saveMutation.isPending} size="lg">
            {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      )}
    </form>
  );

  if (mobile) {
    return (
      <>
        {formContent}
        <MarketingOptInDialog
          open={showMarketingDialog}
          onOpenChange={setShowMarketingDialog}
          onConfirm={handleMarketingConfirm}
        />
      </>
    );
  }

  return (
    <>
      <div>{formContent}</div>
      <MarketingOptInDialog
        open={showMarketingDialog}
        onOpenChange={setShowMarketingDialog}
        onConfirm={handleMarketingConfirm}
      />
    </>
  );
}
