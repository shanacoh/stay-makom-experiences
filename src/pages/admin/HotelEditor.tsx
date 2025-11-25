import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

interface HotelEditorProps {
  hotelId?: string;
  onClose: () => void;
}

export const HotelEditor = ({ hotelId, onClose }: HotelEditorProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    name_he: "",
    slug: "",
    region: "",
    region_he: "",
    city: "",
    city_he: "",
    story: "",
    story_he: "",
    hero_image: "",
    contact_email: "",
    contact_phone: "",
    status: "draft" as "draft" | "published" | "pending" | "archived",
  });

  const { data: hotel, isLoading } = useQuery({
    queryKey: ["hotel", hotelId],
    queryFn: async () => {
      if (!hotelId) return null;
      const { data, error } = await supabase
        .from("hotels")
        .select("*")
        .eq("id", hotelId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!hotelId,
  });

  useEffect(() => {
    if (hotel) {
      setFormData({
        name: hotel.name || "",
        name_he: hotel.name_he || "",
        slug: hotel.slug || "",
        region: hotel.region || "",
        region_he: hotel.region_he || "",
        city: hotel.city || "",
        city_he: hotel.city_he || "",
        story: hotel.story || "",
        story_he: hotel.story_he || "",
        hero_image: hotel.hero_image || "",
        contact_email: hotel.contact_email || "",
        contact_phone: hotel.contact_phone || "",
        status: hotel.status || "draft",
      });
    }
  }, [hotel]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (hotelId) {
        const { error } = await supabase
          .from("hotels")
          .update(data)
          .eq("id", hotelId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("hotels")
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hotels"] });
      toast.success(hotelId ? "Hotel updated" : "Hotel created");
      onClose();
    },
    onError: (error) => {
      toast.error("Error saving hotel");
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold">
          {hotelId ? "Edit Hotel" : "New Hotel"}
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Hotel Details - Bilingual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Fields */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "draft" | "published") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ImageUpload
              label="Hero Image"
              bucket="hotel-images"
              value={formData.hero_image}
              onChange={(url) => setFormData({ ...formData, hero_image: url })}
              description="Main image for the hotel page"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>
            </div>

            {/* Bilingual Content - Side by Side */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Bilingual Content</h3>
              
              <div className="grid grid-cols-2 gap-6">
                {/* English Column */}
                <div className="space-y-4">
                  <div className="bg-muted/30 p-2 rounded">
                    <h4 className="font-medium text-sm">English Version</h4>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Hotel Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="story">Story</Label>
                    <Textarea
                      id="story"
                      value={formData.story}
                      onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                      rows={6}
                    />
                  </div>
                </div>

                {/* Hebrew Column */}
                <div className="space-y-4">
                  <div className="bg-muted/30 p-2 rounded">
                    <h4 className="font-medium text-sm">Hebrew Version (עברית)</h4>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name_he">שם המלון</Label>
                    <Input
                      id="name_he"
                      value={formData.name_he}
                      onChange={(e) => setFormData({ ...formData, name_he: e.target.value })}
                      dir="rtl"
                      className="bg-hebrew-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region_he">אזור</Label>
                    <Input
                      id="region_he"
                      value={formData.region_he}
                      onChange={(e) => setFormData({ ...formData, region_he: e.target.value })}
                      dir="rtl"
                      className="bg-hebrew-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city_he">עיר</Label>
                    <Input
                      id="city_he"
                      value={formData.city_he}
                      onChange={(e) => setFormData({ ...formData, city_he: e.target.value })}
                      dir="rtl"
                      className="bg-hebrew-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="story_he">סיפור</Label>
                    <Textarea
                      id="story_he"
                      value={formData.story_he}
                      onChange={(e) => setFormData({ ...formData, story_he: e.target.value })}
                      rows={6}
                      dir="rtl"
                      className="bg-hebrew-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {hotelId ? "Update Hotel" : "Create Hotel"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};