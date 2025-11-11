import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export default function HotelProperty() {
  const { user } = useAuth();

  const { data: hotelAdmin, isLoading } = useQuery({
    queryKey: ["hotel-admin", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotel_admins")
        .select("*, hotels(*)")
        .eq("user_id", user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hotel = hotelAdmin?.hotels;

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="font-serif text-4xl font-bold mb-8">My Property</h1>

      <Card>
        <CardHeader>
          <CardTitle>Hotel Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Hotel Name</Label>
              <Input id="name" defaultValue={hotel?.name} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Input id="status" defaultValue={hotel?.status} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="story">Description</Label>
            <Textarea id="story" rows={4} defaultValue={hotel?.story || ""} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" defaultValue={hotel?.city || ""} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input id="region" defaultValue={hotel?.region || ""} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email</Label>
              <Input id="email" type="email" defaultValue={hotel?.contact_email || ""} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Contact Phone</Label>
              <Input id="phone" defaultValue={hotel?.contact_phone || ""} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" defaultValue={hotel?.contact_website || ""} />
          </div>

          <div className="space-y-2">
            <Label>Highlights (comma-separated)</Label>
            <Textarea rows={3} defaultValue={hotel?.highlights?.join(", ") || ""} />
          </div>

          <div className="space-y-2">
            <Label>Amenities (comma-separated)</Label>
            <Textarea rows={3} defaultValue={hotel?.amenities?.join(", ") || ""} />
          </div>

          <div className="flex gap-4">
            <Button>Save Changes</Button>
            <Button variant="outline">Preview</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
