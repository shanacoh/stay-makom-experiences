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
import { ArrowLeft, Loader2, MapPin, Sparkles, Image as ImageIcon } from "lucide-react";
import { generateSlug } from "@/lib/utils";
import { HotelExtrasManager } from "@/components/admin/HotelExtrasManager";
import { Link } from "react-router-dom";
import {
  HyperGuestHotelSearch,
  type HyperGuestHotelWithDetails,
  type RoomCapacitySummary,
} from "@/components/admin/HyperGuestHotelSearch";

interface HotelEditor2Props {
  hotelId?: string;
  onClose: () => void;
}

export const HotelEditor2 = ({ hotelId, onClose }: HotelEditor2Props) => {
  const queryClient = useQueryClient();
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isDownloadingImages, setIsDownloadingImages] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [hyperguestId, setHyperguestId] = useState<number | null>(null);
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    name_he: "",
    region: "",
    region_he: "",
    city: "",
    city_he: "",
    story: "",
    story_he: "",
    hero_image: "",
    photos: [] as string[],
    contact_email: "",
    contact_phone: "",
    status: "draft" as "draft" | "published" | "pending" | "archived",
    address: "",
    address_he: "",
    latitude: null as number | null,
    longitude: null as number | null,
    seo_title_en: "",
    seo_title_he: "",
    seo_title_fr: "",
    meta_description_en: "",
    meta_description_he: "",
    meta_description_fr: "",
    og_title_en: "",
    og_title_he: "",
    og_title_fr: "",
    og_description_en: "",
    og_description_he: "",
    og_description_fr: "",
    og_image: "",
    // Infos HyperGuest (import ou édition)
    star_rating: null as number | null,
    property_type: "",
    room_capacities: [] as RoomCapacitySummary[],
    cancellation_policy: "",
    extra_conditions: "",
    min_stay: null as number | null,
    max_stay: null as number | null,
    number_of_rooms: null as number | null,
    check_in_time: "",
    check_out_time: "",
  });

  const downloadHyperGuestImages = async (imageUrls: string[], heroUrl?: string | null) => {
    if (imageUrls.length === 0 && !heroUrl) return;
    setIsDownloadingImages(true);
    const uploadedUrls: string[] = [];
    let uploadedHeroUrl = "";

    try {
      const imagesToProcess = heroUrl ? [heroUrl, ...imageUrls.slice(0, 7)] : imageUrls.slice(0, 8);
      for (let i = 0; i < imagesToProcess.length; i++) {
        const url = imagesToProcess[i];
        try {
          const fileExt = url.split(".").pop()?.split("?")[0] || "jpg";
          const fileName = `hyperguest-${Date.now()}-${i}.${fileExt}`;
          const { data, error } = await supabase.functions.invoke("download-image", {
            body: { imageUrl: url, bucket: "hotel-images", path: fileName },
          });
          if (error) continue;
          if (data?.publicUrl) {
            if (i === 0 && heroUrl) uploadedHeroUrl = data.publicUrl;
            else uploadedUrls.push(data.publicUrl);
          }
        } catch (err) {
          console.error(`Failed to download image ${i}:`, err);
        }
      }
      setFormData((prev) => ({
        ...prev,
        hero_image: uploadedHeroUrl || prev.hero_image,
        photos: [...prev.photos, ...uploadedUrls].slice(0, 8),
      }));
      if (uploadedHeroUrl || uploadedUrls.length > 0) {
        toast.success(`${uploadedUrls.length + (uploadedHeroUrl ? 1 : 0)} images imported successfully!`);
      }
    } catch (error) {
      console.error("Error downloading images:", error);
      toast.error("Failed to download some images");
    } finally {
      setIsDownloadingImages(false);
      setPendingImages([]);
    }
  };

  const handleHyperGuestSelect = async (hotel: HyperGuestHotelWithDetails) => {
    setHyperguestId(hotel.id as number);

    if (hotel.images && hotel.images.length > 0) {
      setPendingImages(hotel.images);
    }

    const city = hotel.cityName || hotel.city || "";
    const region = hotel.regionName || hotel.region || "";
    const address = hotel.address || `${city}, ${region}, Israel`.replace(/^, |, $/g, "").replace(/, $/g, "");

    setFormData((prev) => ({
      ...prev,
      name: hotel.name || prev.name,
      region,
      city,
      latitude: hotel.latitude ?? prev.latitude,
      longitude: hotel.longitude ?? prev.longitude,
      address,
      story: hotel.description || prev.story,
      contact_email: hotel.contact?.email || prev.contact_email,
      contact_phone: hotel.contact?.phone || prev.contact_phone,
      seo_title_en: hotel.name ? `${hotel.name} | Staymakom` : prev.seo_title_en,
      meta_description_en: hotel.description?.slice(0, 155) || prev.meta_description_en,
      // Infos HyperGuest
      star_rating: hotel.starRating ?? null,
      property_type: hotel.propertyTypeName ?? "",
      room_capacities: hotel.roomsSummary ?? [],
      cancellation_policy: hotel.cancellationPolicyText ?? "",
      extra_conditions: [...(hotel.remarks ?? []), ...(hotel.policiesGeneral ?? [])].filter(Boolean).join("\n\n"),
      min_stay: hotel.minStay ?? null,
      max_stay: hotel.maxStay ?? null,
      number_of_rooms: hotel.numberOfRooms ?? null,
      check_in_time: hotel.checkIn ?? "",
      check_out_time: hotel.checkOut ?? "",
    }));

    const hotelName = hotel.name || "";
    const story = hotel.description || "";
    const textsToTranslate = [hotelName, city, region, address, story].filter(Boolean);

    if (textsToTranslate.length > 0) {
      setIsTranslating(true);
      try {
        const { data, error } = await supabase.functions.invoke("translate-text", {
          body: { texts: textsToTranslate, targetLang: "he" },
        });

        if (!error && data?.translations) {
          const translations = data.translations as string[];
          let idx = 0;
          const nameHe = hotelName ? translations[idx++] : "";
          const cityHe = city ? translations[idx++] : "";
          const regionHe = region ? translations[idx++] : "";
          const addressHe = address ? translations[idx++] : "";
          const storyHe = story ? translations[idx++] : "";

          setFormData((prev) => ({
            ...prev,
            name_he: nameHe || prev.name_he,
            city_he: cityHe || prev.city_he,
            region_he: regionHe || prev.region_he,
            address_he: addressHe || prev.address_he,
            story_he: storyHe || prev.story_he,
          }));
        }
      } catch (err) {
        console.error("[HotelEditor2] Translation error:", err);
        toast.error("Translation failed", { description: "Hebrew fields could not be auto-translated." });
      } finally {
        setIsTranslating(false);
      }
    }

    const imageCount = hotel.images?.length || 0;
    toast.success(`Hotel "${hotel.name}" imported from HyperGuest!`, {
      description:
        imageCount > 0
          ? `Form pre-filled with Hebrew translations. ${imageCount} images available to import.`
          : "Form pre-filled with Hebrew translations. You can edit before saving.",
    });
  };

  const { data: hotel, isLoading } = useQuery({
    queryKey: ["hotel2", hotelId],
    queryFn: async () => {
      if (!hotelId) return null;
      const { data, error } = await supabase.from("hotels2").select("*").eq("id", hotelId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!hotelId,
  });

  useEffect(() => {
    if (hotel) {
      const h = hotel as Record<string, unknown>;
      setFormData({
        name: (h.name as string) || "",
        name_he: (h.name_he as string) || "",
        region: (h.region as string) || "",
        region_he: (h.region_he as string) || "",
        city: (h.city as string) || "",
        city_he: (h.city_he as string) || "",
        story: (h.story as string) || "",
        story_he: (h.story_he as string) || "",
        hero_image: (h.hero_image as string) || "",
        photos: (h.photos as string[]) || [],
        contact_email: (h.contact_email as string) || "",
        contact_phone: (h.contact_phone as string) || "",
        status: (h.status as "draft" | "published") || "draft",
        address: (h.address as string) || "",
        address_he: (h.address_he as string) || "",
        latitude: (h.latitude as number) || null,
        longitude: (h.longitude as number) || null,
        seo_title_en: (h.seo_title_en as string) || "",
        seo_title_he: (h.seo_title_he as string) || "",
        seo_title_fr: (h.seo_title_fr as string) || "",
        meta_description_en: (h.meta_description_en as string) || "",
        meta_description_he: (h.meta_description_he as string) || "",
        meta_description_fr: (h.meta_description_fr as string) || "",
        og_title_en: (h.og_title_en as string) || "",
        og_title_he: (h.og_title_he as string) || "",
        og_title_fr: (h.og_title_fr as string) || "",
        og_description_en: (h.og_description_en as string) || "",
        og_description_he: (h.og_description_he as string) || "",
        og_description_fr: (h.og_description_fr as string) || "",
        og_image: (h.og_image as string) || "",
        star_rating: (h.star_rating as number) ?? null,
        property_type: (h.property_type as string) ?? "",
        room_capacities: Array.isArray(h.room_capacities) ? (h.room_capacities as RoomCapacitySummary[]) : [],
        cancellation_policy: (h.cancellation_policy as string) ?? "",
        extra_conditions: (h.extra_conditions as string) ?? "",
        min_stay: (h.min_stay as number) ?? null,
        max_stay: (h.max_stay as number) ?? null,
        number_of_rooms: (h.number_of_rooms as number) ?? null,
        check_in_time: (h.check_in_time as string) ?? "",
        check_out_time: (h.check_out_time as string) ?? "",
      });
    }
  }, [hotel]);

  const handleGeocode = async () => {
    const addressToGeocode = formData.address || `${formData.name}, ${formData.city}, ${formData.region}`;
    if (!addressToGeocode.trim()) {
      toast.error("Please enter an address or hotel name/city/region first");
      return;
    }
    setIsGeocoding(true);
    try {
      const { data, error } = await supabase.functions.invoke("geocode-hotel", {
        body: { address: addressToGeocode },
      });
      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }
      setFormData({
        ...formData,
        latitude: data.latitude,
        longitude: data.longitude,
        address: formData.address || data.displayName,
      });
      toast.success(`Location found: ${data.displayName}`);
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Failed to find location. Try a more specific address.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const dataWithSlug = {
        ...data,
        slug: hotelId ? (hotel as { slug?: string })?.slug : generateSlug(data.name),
        hyperguest_property_id: hyperguestId ? String(hyperguestId) : null,
        hyperguest_imported_at: hyperguestId ? new Date().toISOString() : null,
        star_rating: data.star_rating,
        property_type: data.property_type || null,
        room_capacities: data.room_capacities?.length ? data.room_capacities : null,
        cancellation_policy: data.cancellation_policy || null,
        extra_conditions: data.extra_conditions || null,
        min_stay: data.min_stay,
        max_stay: data.max_stay,
        number_of_rooms: data.number_of_rooms,
        check_in_time: data.check_in_time || null,
        check_out_time: data.check_out_time || null,
      };

      if (hotelId) {
        const { error } = await supabase.from("hotels2").update(dataWithSlug).eq("id", hotelId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("hotels2").insert([dataWithSlug]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hotels2"] });
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
        <Link to="/admin/hotels2">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Hotels 2
          </Button>
        </Link>
        <h2 className="text-3xl font-bold">{hotelId ? "Edit Hotel" : "New Hotel"}</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Hotel Details - Bilingual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!hotelId && (
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-primary">Quick Import</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Search and import hotel data directly from HyperGuest to pre-fill the form.
                </p>
                <HyperGuestHotelSearch onSelect={handleHyperGuestSelect} fetchFullDetails={true} />

                {hyperguestId && (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                        ✓ Linked to HyperGuest ID: {hyperguestId}
                      </span>
                    </div>

                    {pendingImages.length > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <ImageIcon className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900">
                            {pendingImages.length} images available from HyperGuest
                          </p>
                          <p className="text-xs text-blue-700">Click to download and add to gallery</p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="default"
                          disabled={isDownloadingImages}
                          onClick={() => downloadHyperGuestImages(pendingImages.slice(1), pendingImages[0])}
                        >
                          {isDownloadingImages ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Importing...
                            </>
                          ) : (
                            <>
                              <ImageIcon className="mr-2 h-4 w-4" />
                              Import Images
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "draft" | "published") => setFormData({ ...formData, status: value })}
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

            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Images & Media</h3>
              <p className="text-sm text-muted-foreground">Upload hero image and gallery photos</p>

              <div className="space-y-2">
                <ImageUpload
                  label="Hero Image"
                  bucket="hotel-images"
                  value={formData.hero_image}
                  onChange={(url) => setFormData({ ...formData, hero_image: url })}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Gallery Images (up to 8)</Label>
                  <span className="text-sm text-muted-foreground">{formData.photos.length} / 8 images</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border bg-muted">
                      <img src={photo} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          const newPhotos = formData.photos.filter((_, i) => i !== index);
                          setFormData({ ...formData, photos: newPhotos });
                        }}
                      >
                        <span className="text-xs">×</span>
                      </Button>
                    </div>
                  ))}

                  {formData.photos.length < 8 && (
                    <button
                      type="button"
                      className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.multiple = true;
                        input.accept = "image/*";
                        input.onchange = async (e) => {
                          const files = Array.from((e.target as HTMLInputElement).files || []);
                          const remainingSlots = 8 - formData.photos.length;
                          const filesToUpload = files.slice(0, remainingSlots);

                          toast.promise(
                            Promise.all(
                              filesToUpload.map(async (file) => {
                                const fileExt = file.name.split(".").pop();
                                const fileName = `${Math.random()}.${fileExt}`;
                                const { error: uploadError } = await supabase.storage
                                  .from("hotel-images")
                                  .upload(fileName, file);
                                if (uploadError) throw uploadError;
                                const {
                                  data: { publicUrl },
                                } = supabase.storage.from("hotel-images").getPublicUrl(fileName);
                                return publicUrl;
                              }),
                            ).then((urls) => {
                              setFormData({ ...formData, photos: [...formData.photos, ...urls] });
                            }),
                            {
                              loading: `Uploading ${filesToUpload.length} image(s)...`,
                              success: `${filesToUpload.length} image(s) uploaded!`,
                              error: "Failed to upload images",
                            },
                          );
                        };
                        input.click();
                      }}
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-2xl">+</span>
                      </div>
                      <span className="text-sm font-medium">Add images</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

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

            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Location</h3>
              </div>
              <p className="text-sm text-muted-foreground">Set the hotel address and coordinates for map display</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address (English)</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g., 123 Hotel Street, Ayyelet HaShahar, Israel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_he">כתובת (עברית)</Label>
                  <div className="relative">
                    <Input
                      id="address_he"
                      value={formData.address_he}
                      onChange={(e) => setFormData({ ...formData, address_he: e.target.value })}
                      placeholder="כתובת בעברית"
                      dir="rtl"
                      className="bg-hebrew-input"
                      disabled={isTranslating}
                    />
                    {isTranslating && (
                      <div className="absolute inset-0 flex items-center justify-center bg-hebrew-input/80 rounded-md">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        latitude: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    placeholder="e.g., 33.0742"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        longitude: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    placeholder="e.g., 35.5585"
                  />
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGeocode}
                    disabled={isGeocoding}
                    className="w-full"
                  >
                    {isGeocoding ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Finding...
                      </>
                    ) : (
                      <>
                        <MapPin className="mr-2 h-4 w-4" />
                        Auto-detect coordinates
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {formData.latitude && formData.longitude && (
                <p className="text-sm text-green-600">
                  ✓ Coordinates set: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                </p>
              )}
            </div>

            {/* Infos HyperGuest */}
            <Card>
              <CardHeader>
                <CardTitle>Infos HyperGuest</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Données importées depuis HyperGuest (étoiles, capacités chambres, annulation, conditions).
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Étoiles</Label>
                    <Select
                      value={formData.star_rating != null ? String(formData.star_rating) : ""}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          star_rating: v === "" ? null : parseInt(v, 10),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n === 0 ? "0 (non classé)" : "★ ".repeat(n)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type de propriété</Label>
                    <Input
                      value={formData.property_type}
                      onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                      placeholder="Hotel, Apartment…"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre de chambres</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.number_of_rooms ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          number_of_rooms: e.target.value ? parseInt(e.target.value, 10) : null,
                        })
                      }
                      placeholder="—"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Check-in</Label>
                      <Input
                        value={formData.check_in_time}
                        onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })}
                        placeholder="14:00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Check-out</Label>
                      <Input
                        value={formData.check_out_time}
                        onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })}
                        placeholder="12:00"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nuits min.</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.min_stay ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          min_stay: e.target.value ? parseInt(e.target.value, 10) : null,
                        })
                      }
                      placeholder="—"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nuits max.</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.max_stay ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_stay: e.target.value ? parseInt(e.target.value, 10) : null,
                        })
                      }
                      placeholder="—"
                    />
                  </div>
                </div>

                {formData.room_capacities && formData.room_capacities.length > 0 && (
                  <div className="space-y-2">
                    <Label>Capacités par type de chambre (lecture seule)</Label>
                    <ul className="rounded-lg border divide-y text-sm">
                      {formData.room_capacities.map((room, i) => (
                        <li key={i} className="p-3 flex flex-wrap gap-x-4 gap-y-1">
                          <span className="font-medium">{room.name}</span>
                          <span className="text-muted-foreground">
                            {[
                              room.maxAdultsNumber != null && `${room.maxAdultsNumber} adultes`,
                              room.maxChildrenNumber != null && `${room.maxChildrenNumber} enfants`,
                              room.maxOccupancy != null && `max ${room.maxOccupancy} pers.`,
                              room.roomSize != null && `${room.roomSize} m²`,
                              room.beddingSummary,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Politique d&apos;annulation</Label>
                  <Textarea
                    value={formData.cancellation_policy}
                    onChange={(e) => setFormData({ ...formData, cancellation_policy: e.target.value })}
                    placeholder="Ex: J-2: 100% • À tout moment: 100%"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Conditions générales / remarques</Label>
                  <Textarea
                    value={formData.extra_conditions}
                    onChange={(e) => setFormData({ ...formData, extra_conditions: e.target.value })}
                    placeholder="Remarques, taxes, âge min, animaux…"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Bilingual Content</h3>

              <div className="grid grid-cols-2 gap-6">
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

                <div className="space-y-4">
                  <div className="bg-muted/30 p-2 rounded">
                    <h4 className="font-medium text-sm">Hebrew Version (עברית)</h4>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name_he">שם המלון</Label>
                    <div className="relative">
                      <Input
                        id="name_he"
                        value={formData.name_he}
                        onChange={(e) => setFormData({ ...formData, name_he: e.target.value })}
                        dir="rtl"
                        className="bg-hebrew-input"
                        disabled={isTranslating}
                      />
                      {isTranslating && (
                        <div className="absolute inset-0 flex items-center justify-center bg-hebrew-input/80 rounded-md">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region_he">אזור</Label>
                    <Input
                      id="region_he"
                      value={formData.region_he}
                      onChange={(e) => setFormData({ ...formData, region_he: e.target.value })}
                      dir="rtl"
                      className="bg-hebrew-input"
                      disabled={isTranslating}
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
                      disabled={isTranslating}
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
                      disabled={isTranslating}
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

        <Card className="bg-muted/30 mt-6">
          <CardHeader>
            <CardTitle>SEO Configuration</CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure SEO metadata for search engines and social media sharing
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="bg-background p-2 rounded">
                  <h4 className="font-medium text-sm">English SEO</h4>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_title_en">SEO Title</Label>
                  <Input
                    id="seo_title_en"
                    value={formData.seo_title_en}
                    onChange={(e) => setFormData({ ...formData, seo_title_en: e.target.value })}
                    placeholder="Displayed in browser tab and Google results"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta_description_en">Meta Description</Label>
                  <Textarea
                    id="meta_description_en"
                    value={formData.meta_description_en}
                    onChange={(e) => setFormData({ ...formData, meta_description_en: e.target.value })}
                    placeholder="Shown in Google search results"
                    rows={3}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-background p-2 rounded">
                  <h4 className="font-medium text-sm">Hebrew SEO (עברית)</h4>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_title_he">כותרת SEO</Label>
                  <Input
                    id="seo_title_he"
                    value={formData.seo_title_he}
                    onChange={(e) => setFormData({ ...formData, seo_title_he: e.target.value })}
                    placeholder="כותרת עבור גוגל וכרטיסייה"
                    dir="rtl"
                    className="bg-hebrew-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta_description_he">תיאור Meta</Label>
                  <Textarea
                    id="meta_description_he"
                    value={formData.meta_description_he}
                    onChange={(e) => setFormData({ ...formData, meta_description_he: e.target.value })}
                    placeholder="תיאור עבור תוצאות גוגל"
                    rows={3}
                    dir="rtl"
                    className="bg-hebrew-input"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-background p-2 rounded">
                  <h4 className="font-medium text-sm">French SEO (Français)</h4>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_title_fr">Titre SEO</Label>
                  <Input
                    id="seo_title_fr"
                    value={formData.seo_title_fr}
                    onChange={(e) => setFormData({ ...formData, seo_title_fr: e.target.value })}
                    placeholder="Titre pour Google et l'onglet"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta_description_fr">Description Meta</Label>
                  <Textarea
                    id="meta_description_fr"
                    value={formData.meta_description_fr}
                    onChange={(e) => setFormData({ ...formData, meta_description_fr: e.target.value })}
                    placeholder="Description pour les résultats Google"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="og_image">Open Graph Image</Label>
              <Input
                id="og_image"
                value={formData.og_image}
                onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                placeholder="Image URL for social media sharing"
              />
            </div>
          </CardContent>
        </Card>

        {hotelId && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Hotel Extras</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage extras that can be added to experiences at this hotel
              </p>
            </CardHeader>
            <CardContent>
              <HotelExtrasManager hotelId={hotelId} />
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
};
