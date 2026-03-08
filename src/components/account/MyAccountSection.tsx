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
import MarketingOptInDialog from "./MarketingOptInDialog";

interface MyAccountSectionProps {
  userId?: string;
  userEmail?: string;
  mobile?: boolean;
}

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
        .update({ marketing_opt_in: formData.marketing_optin })
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

  // === MOBILE: clean form, no card wrapper ===
  if (mobile) {
    return (
      <>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="first_name" className="text-xs text-muted-foreground uppercase tracking-wider">First Name *</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
              className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="last_name" className="text-xs text-muted-foreground uppercase tracking-wider">Last Name *</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
              className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs text-muted-foreground uppercase tracking-wider">Email</Label>
            <Input
              id="email"
              type="email"
              value={userEmail || ""}
              disabled
              className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs text-muted-foreground uppercase tracking-wider">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 234 567 8900"
              className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="birthdate" className="text-xs text-muted-foreground uppercase tracking-wider">Date of Birth</Label>
            <Input
              id="birthdate"
              type="date"
              value={formData.birthdate}
              onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
              className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-xs text-muted-foreground uppercase tracking-wider">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Tel Aviv"
              className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="country" className="text-xs text-muted-foreground uppercase tracking-wider">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="Israel"
              className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground"
            />
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

          {/* Save button — full width, dark */}
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="w-full h-12 mt-6 rounded-lg bg-[#1A1A1A] text-white text-[15px] font-medium disabled:opacity-50 transition-colors active:bg-[#333]"
          >
            {saveMutation.isPending ? "Saving…" : "Save Changes"}
          </button>
        </form>

        <MarketingOptInDialog
          open={showMarketingDialog}
          onOpenChange={setShowMarketingDialog}
          onConfirm={handleMarketingConfirm}
        />
      </>
    );
  }

  // === DESKTOP: original card layout ===
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Read-only)</Label>
              <Input id="email" type="email" value={userEmail || ""} disabled />
              <p className="text-xs text-muted-foreground">
                Email is linked to your authentication account
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthdate">Date of Birth</Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={formData.birthdate}
                  onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Tel Aviv"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Israel"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="marketing_optin" className="text-base font-semibold">
                    Newsletter & Marketing
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive exclusive experiences, early releases, and special deals from StayMakom
                  </p>
                </div>
                <Switch
                  id="marketing_optin"
                  checked={formData.marketing_optin}
                  onCheckedChange={handleMarketingToggle}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saveMutation.isPending} size="lg">
                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <MarketingOptInDialog
        open={showMarketingDialog}
        onOpenChange={setShowMarketingDialog}
        onConfirm={handleMarketingConfirm}
      />
    </>
  );
}
