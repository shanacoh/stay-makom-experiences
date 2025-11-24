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
}

export default function MyAccountSection({ userId, userEmail }: MyAccountSectionProps) {
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

      // Update customers table
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

      // Update user_profiles table for marketing_opt_in
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          marketing_opt_in: formData.marketing_optin,
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
      // User is trying to turn OFF marketing
      setPendingMarketingValue(false);
      setShowMarketingDialog(true);
    } else {
      // User is turning marketing ON
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
              <Input
                id="email"
                type="email"
                value={userEmail || ""}
                disabled
              />
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
