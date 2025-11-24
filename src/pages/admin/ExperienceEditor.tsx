import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye } from "lucide-react";
import IncludesManager from "@/components/admin/IncludesManager";
import ExtrasManager from "@/components/admin/ExtrasManager";
import ReviewsManager from "@/components/admin/ReviewsManager";

const AdminExperienceEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    hotel_id: "",
    title: "",
    title_he: "",
    subtitle: "",
    subtitle_he: "",
    slug: "",
    category_id: "",
    long_copy: "",
    long_copy_he: "",
    duration: "",
    duration_he: "",
    hero_image: "",
    photos: [] as string[],
    min_party: 2,
    max_party: 4,
    min_nights: 1,
    max_nights: 4,
    base_price: 0,
    base_price_type: "per_person" as any,
    currency: "ILS",
    includes: [] as string[],
    includes_he: [] as string[],
    not_includes: [] as string[],
    not_includes_he: [] as string[],
    good_to_know: [] as string[],
    good_to_know_he: [] as string[],
    cancellation_policy: "",
    cancellation_policy_he: "",
    lead_time_days: 3,
    status: "draft" as any,
    checkin_time: "",
    checkout_time: "",
    address: "",
    address_he: "",
    google_maps_link: "",
    accessibility_info: "",
    accessibility_info_he: "",
    services: [] as string[],
    services_he: [] as string[],
  });

  const { data: hotels } = useQuery({
    queryKey: ["admin-hotels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotels" as any)
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-categories-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories" as any)
        .select("id, name")
        .eq("status", "published")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: experience } = useQuery({
    queryKey: ["admin-experience", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("experiences" as any)
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (experience) {
      const exp = experience as any;
      setFormData({
        hotel_id: exp.hotel_id || "",
        title: exp.title || "",
        title_he: exp.title_he || "",
        subtitle: exp.subtitle || "",
        subtitle_he: exp.subtitle_he || "",
        slug: exp.slug || "",
        category_id: exp.category_id || "",
        long_copy: exp.long_copy || "",
        long_copy_he: exp.long_copy_he || "",
        duration: exp.duration || "",
        duration_he: exp.duration_he || "",
        hero_image: exp.hero_image || "",
        photos: exp.photos || [],
        min_party: exp.min_party || 2,
        max_party: exp.max_party || 4,
        min_nights: exp.min_nights || 1,
        max_nights: exp.max_nights || 4,
        base_price: exp.base_price || 0,
        base_price_type: exp.base_price_type || "per_person",
        currency: exp.currency || "ILS",
        includes: exp.includes || [],
        includes_he: exp.includes_he || [],
        not_includes: exp.not_includes || [],
        not_includes_he: exp.not_includes_he || [],
        good_to_know: exp.good_to_know || [],
        good_to_know_he: exp.good_to_know_he || [],
        cancellation_policy: exp.cancellation_policy || "",
        cancellation_policy_he: exp.cancellation_policy_he || "",
        lead_time_days: exp.lead_time_days || 3,
        status: exp.status || "draft",
        checkin_time: exp.checkin_time || "",
        checkout_time: exp.checkout_time || "",
        address: exp.address || "",
        address_he: exp.address_he || "",
        google_maps_link: exp.google_maps_link || "",
        accessibility_info: exp.accessibility_info || "",
        accessibility_info_he: exp.accessibility_info_he || "",
        services: exp.services || [],
        services_he: exp.services_he || [],
      });
    }
  }, [experience]);

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: prev.slug || value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async (status: string) => {
      const payload = { ...formData, status };

      if (!payload.hotel_id) {
        throw new Error("You must select a hotel");
      }

      if (isEditing) {
        const { error } = await supabase
          .from("experiences" as any)
          .update(payload)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("experiences" as any)
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ["admin-experiences"] });
      toast.success(status === "published" ? "Experience published" : "Draft saved");
      navigate("/admin/experiences");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error saving experience");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/experiences")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold">
            {isEditing ? "Edit Experience" : "New Experience"}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? "Edit the experience details" : "Create a new experience and assign it to a hotel"}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Hotel assignment and main details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hotel_id">Hotel * (Assignment)</Label>
              <Select
                value={formData.hotel_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, hotel_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a hotel" />
                </SelectTrigger>
                <SelectContent>
                  {hotels?.map((hotel: any) => (
                    <SelectItem key={hotel.id} value={hotel.id}>
                      {hotel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Category *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ImageUpload
              label="Hero Image *"
              bucket="experience-images"
              value={formData.hero_image}
              onChange={(url) => setFormData(prev => ({ ...prev, hero_image: url }))}
              required
              description="Main image displayed on the experience page"
            />

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base_price">Base Price *</Label>
                <Input
                  id="base_price"
                  type="number"
                  value={formData.base_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, base_price: parseFloat(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ILS">ILS</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="base_price_type">Price Type</Label>
                <Select
                  value={formData.base_price_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, base_price_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per_person">Per Person</SelectItem>
                    <SelectItem value="per_booking">Per Booking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bilingual Content - Titles & Descriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              {/* English Column */}
              <div className="space-y-4">
                <div className="bg-muted/30 p-2 rounded">
                  <h4 className="font-medium text-sm">English Version</h4>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Textarea
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="long_copy">Long Description</Label>
                  <Textarea
                    id="long_copy"
                    value={formData.long_copy}
                    onChange={(e) => setFormData(prev => ({ ...prev, long_copy: e.target.value }))}
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 2 nights, 3 days"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
                  <Textarea
                    id="cancellation_policy"
                    value={formData.cancellation_policy}
                    onChange={(e) => setFormData(prev => ({ ...prev, cancellation_policy: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              {/* Hebrew Column */}
              <div className="space-y-4">
                <div className="bg-muted/30 p-2 rounded">
                  <h4 className="font-medium text-sm">Hebrew Version (עברית)</h4>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title_he">כותרת</Label>
                  <Input
                    id="title_he"
                    value={formData.title_he}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_he: e.target.value }))}
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle_he">כותרת משנה</Label>
                  <Textarea
                    id="subtitle_he"
                    value={formData.subtitle_he}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle_he: e.target.value }))}
                    rows={2}
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="long_copy_he">תיאור מלא</Label>
                  <Textarea
                    id="long_copy_he"
                    value={formData.long_copy_he}
                    onChange={(e) => setFormData(prev => ({ ...prev, long_copy_he: e.target.value }))}
                    rows={5}
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration_he">משך</Label>
                  <Input
                    id="duration_he"
                    value={formData.duration_he}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_he: e.target.value }))}
                    placeholder="למשל: 2 לילות, 3 ימים"
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancellation_policy_he">מדיניות ביטול</Label>
                  <Textarea
                    id="cancellation_policy_he"
                    value={formData.cancellation_policy_he}
                    onChange={(e) => setFormData(prev => ({ ...prev, cancellation_policy_he: e.target.value }))}
                    rows={3}
                    dir="rtl"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location & Access Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkin_time">Check-in Time</Label>
                <Input
                  id="checkin_time"
                  placeholder="e.g., 3:00 PM"
                  value={formData.checkin_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, checkin_time: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkout_time">Check-out Time</Label>
                <Input
                  id="checkout_time"
                  placeholder="e.g., 11:00 AM"
                  value={formData.checkout_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, checkout_time: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="google_maps_link">Google Maps Link</Label>
              <Input
                id="google_maps_link"
                type="url"
                placeholder="https://maps.google.com/..."
                value={formData.google_maps_link}
                onChange={(e) => setFormData(prev => ({ ...prev, google_maps_link: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* English Column */}
              <div className="space-y-4">
                <div className="bg-muted/30 p-2 rounded">
                  <h4 className="font-medium text-sm">English Version</h4>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessibility_info">Accessibility Information</Label>
                  <Textarea
                    id="accessibility_info"
                    value={formData.accessibility_info}
                    onChange={(e) => setFormData(prev => ({ ...prev, accessibility_info: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              {/* Hebrew Column */}
              <div className="space-y-4">
                <div className="bg-muted/30 p-2 rounded">
                  <h4 className="font-medium text-sm">Hebrew Version (עברית)</h4>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_he">כתובת</Label>
                  <Textarea
                    id="address_he"
                    value={formData.address_he}
                    onChange={(e) => setFormData(prev => ({ ...prev, address_he: e.target.value }))}
                    rows={3}
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessibility_info_he">מידע נגישות</Label>
                  <Textarea
                    id="accessibility_info_he"
                    value={formData.accessibility_info_he}
                    onChange={(e) => setFormData(prev => ({ ...prev, accessibility_info_he: e.target.value }))}
                    rows={3}
                    dir="rtl"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isEditing && id && (
          <>
            <IncludesManager experienceId={id} />
            <ExtrasManager experienceId={id} />
            <ReviewsManager experienceId={id} />
          </>
        )}

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => saveMutation.mutate("draft")}
            disabled={saveMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={() => saveMutation.mutate("published")}
            disabled={saveMutation.isPending}
          >
            <Eye className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminExperienceEditor;