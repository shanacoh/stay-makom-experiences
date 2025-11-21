import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function HotelProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const hotel = hotelAdmin?.hotels;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    story: "",
    city: "",
    region: "",
    contact_email: "",
    contact_phone: "",
    contact_website: "",
    highlights: "",
    amenities: "",
    hero_image: "",
    photos: [] as string[],
  });

  // Update form when hotel data loads
  useEffect(() => {
    if (hotel) {
      setFormData({
        name: hotel.name || "",
        story: hotel.story || "",
        city: hotel.city || "",
        region: hotel.region || "",
        contact_email: user?.email || "",
        contact_phone: hotel.contact_phone || "",
        contact_website: hotel.contact_website || "",
        highlights: hotel.highlights?.join(", ") || "",
        amenities: hotel.amenities?.join(", ") || "",
        hero_image: hotel.hero_image || "",
        photos: hotel.photos || [],
      });
    }
  }, [hotel, user]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!hotel?.id) throw new Error("Hotel ID not found");

      const { error } = await supabase
        .from("hotels")
        .update({
          name: formData.name,
          story: formData.story,
          city: formData.city,
          region: formData.region,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          contact_website: formData.contact_website,
          highlights: formData.highlights.split(",").map(h => h.trim()).filter(Boolean),
          amenities: formData.amenities.split(",").map(a => a.trim()).filter(Boolean),
          hero_image: formData.hero_image,
          photos: formData.photos,
        })
        .eq("id", hotel.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Hotel information updated successfully");
      queryClient.invalidateQueries({ queryKey: ["hotel-admin", user?.id] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update hotel information");
    },
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  const handlePreview = () => {
    if (hotel?.slug) {
      navigate(`/hotels/${hotel.slug}`);
    }
  };

  const updatePhoto = (index: number, url: string) => {
    const newPhotos = [...formData.photos];
    if (url) {
      newPhotos[index] = url;
    } else {
      newPhotos.splice(index, 1);
    }
    setFormData({ ...formData, photos: newPhotos });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">No hotel found for your account</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="font-sans text-4xl font-bold mb-8">My Property</h1>

      <Card>
        <CardHeader>
          <CardTitle>Hotel Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Hotel Name</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Input id="status" value={hotel?.status} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="story">Description</Label>
            <Textarea 
              id="story" 
              rows={4} 
              value={formData.story}
              onChange={(e) => setFormData({ ...formData, story: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city" 
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email (Auto-filled)</Label>
              <Input 
                id="email" 
                type="email" 
                value={formData.contact_email}
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Contact Phone</Label>
              <Input 
                id="phone" 
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input 
              id="website" 
              value={formData.contact_website}
              onChange={(e) => setFormData({ ...formData, contact_website: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Highlights (comma-separated)</Label>
            <Textarea 
              rows={3} 
              value={formData.highlights}
              onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Amenities (comma-separated)</Label>
            <Textarea 
              rows={3} 
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
            />
          </div>

          {/* Hero Image */}
          <div className="space-y-2">
            <ImageUpload
              label="Main Cover Image"
              bucket="hotel-images"
              value={formData.hero_image}
              onChange={(url) => setFormData({ ...formData, hero_image: url })}
              description="This will be the main image displayed on your hotel page"
            />
          </div>

          {/* Gallery Images */}
          <div className="space-y-4">
            <Label>Gallery Images (Up to 8)</Label>
            <p className="text-sm text-muted-foreground">
              Upload up to 8 additional photos to showcase your property
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
                <ImageUpload
                  key={index}
                  label={`Gallery Image ${index + 1}`}
                  bucket="hotel-images"
                  value={formData.photos[index] || ""}
                  onChange={(url) => updatePhoto(index, url)}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={handleSave}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
            <Button 
              variant="outline"
              onClick={handlePreview}
            >
              Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
